import { useQuery } from "@tanstack/react-query";
import { Archive, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AUDIO_BASE, audioUrl, chapterAudioUrl } from "@/lib/audio";
import { fetchBookHadiths, fetchBooks, fetchChapters, fetchCollections } from "@/lib/library-api";
import { useLanguage, type ContentLanguage } from "@/lib/language";

export function AudioDownloadMenu() {
  const { contentLanguage } = useLanguage();
  const bn = contentLanguage === "bn";
  const [lang, setLang] = useState<ContentLanguage>(contentLanguage === "bn" ? "bn" : "en");
  const [bookId, setBookId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const book = books.data?.find(b => b.id === bookId);
  const collections = useQuery({ queryKey: ["audio-collections", bookId], queryFn: () => fetchCollections(bookId), enabled: !!bookId });
  const chapters = useQuery({ queryKey: ["audio-chapters", bookId], queryFn: () => fetchChapters(bookId), enabled: !!bookId });
  const hadiths = useQuery({ queryKey: ["audio-hadiths", bookId], queryFn: () => fetchBookHadiths(bookId), enabled: !!bookId });
  const canExport = !!AUDIO_BASE && !!book && !!chapters.data && !!hadiths.data && !busy;

  async function run() {
    if (!canExport || !book) return;
    setBusy(true);
    try {
      const selected = (hadiths.data ?? []).filter(h => !collectionId || h.collection_id === collectionId);
      const selectedChapters = (chapters.data ?? []).filter(c => !collectionId || c.collection_id === collectionId);
      if (!selected.length) throw new Error(bn ? "এখানে কোনো হাদীস নেই।" : "No hadith found in this selection.");
      // Limit memory-intensive client-side ZIPs on iPhone; larger archives need server-side packaging.
      if (selected.length > 450) throw new Error(bn ? "এই নির্বাচনটি মোবাইলে ZIP করার জন্য অনেক বড়। ছোট সংগ্রহ বেছে নিন।" : "This selection is too large to ZIP safely on a phone. Choose a smaller collection.");
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const prefix = `Al-Jami-al-Kamil/Kitab-${String(book.book_number).padStart(2, "0")}/${collectionId ? "Collection-" + collectionId + "/" : ""}${lang}`;
      const folder = zip.folder(prefix)!;
      const cache = typeof caches !== "undefined" ? await caches.open("jk-audio") : null;
      const files = [
        ...selected.map(h => ({ url: audioUrl(h.hadith_number, lang), name: `Hadith-${String(h.hadith_number).padStart(5, "0")}.mp3` })),
        ...selectedChapters.map(c => ({ url: chapterAudioUrl(c.id, lang), name: `Chapter-${c.id}.mp3` })),
      ];
      let found = 0;
      let missing = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        setProgress(`${i + 1} / ${files.length}`);
        let response = await cache?.match(file.url);
        if (!response) {
          try {
            const fetched = await fetch(file.url);
            if (fetched.ok) response = fetched;
          } catch { /* Keep any cached recordings even if offline. */ }
        }
        if (!response?.ok && response?.type !== "opaque") { missing++; continue; }
        try {
          folder.file(file.name, await response.blob());
          found++;
        } catch { missing++; }
      }
      if (!found) throw new Error(bn ? "কোনো অডিও পাওয়া যায়নি।" : "No audio files available to export.");
      if (missing) throw new Error(bn ? `${missing}টি অডিও পাওয়া যায়নি। অসম্পূর্ণ ZIP তৈরি করা হয়নি।` : `${missing} audio files are unavailable. An incomplete ZIP was not created.`);
      setProgress(bn ? "ZIP তৈরি হচ্ছে…" : "Creating ZIP…");
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE", streamFiles: true });
      const filename = `Al-Jami-al-Kamil-Kitab-${String(book.book_number).padStart(2, "0")}${collectionId ? "-Collection-" + collectionId : ""}-${lang}-audio.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast.success(bn ? "ZIP ডাউনলোড শুরু হয়েছে। Files অ্যাপে সংরক্ষণ করুন।" : "ZIP download started. Save it to Files.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Audio ZIP export failed.");
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  if (!AUDIO_BASE) return null;
  return (
    <section className="rounded-xl border border-gold/40 bg-parchment p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Archive className="size-5" />{bn ? "অডিও ডাউনলোড" : "Audio Downloads"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{bn ? "ইংরেজি বা বাংলা MP3 ফাইল ZIP আকারে ডিভাইসে সংরক্ষণ করুন। আগে সংরক্ষিত অডিও পুনরায় ডাউনলোড করা হবে না।" : "Save English or Bengali MP3 recordings as a ZIP on your device. Already cached recordings are reused."}</p>
      <div className="mt-4 grid gap-3">
        <label className="text-sm font-medium" htmlFor="audio-download-lang">{bn ? "অডিও ভাষা" : "Audio language"}</label>
        <select id="audio-download-lang" className="w-full rounded-md border bg-background p-3" value={lang} onChange={e => setLang(e.target.value as ContentLanguage)} disabled={busy}>
          <option value="en">English</option><option value="bn">বাংলা</option>
        </select>
        <label className="text-sm font-medium" htmlFor="audio-download-book">{bn ? "কিতাব নির্বাচন করুন" : "Select Kitāb"}</label>
        <select id="audio-download-book" className="w-full rounded-md border bg-background p-3" value={bookId} onChange={e => { setBookId(e.target.value); setCollectionId(""); }} disabled={busy}>
          <option value="">{bn ? "কিতাব বেছে নিন" : "Choose a Kitāb"}</option>
          {(books.data ?? []).map(b => <option key={b.id} value={b.id}>{b.book_number}. {b.title_en}</option>)}
        </select>
        {bookId ? <>
          <label className="text-sm font-medium" htmlFor="audio-download-collection">{bn ? "সংগ্রহ নির্বাচন করুন (ঐচ্ছিক)" : "Select collection (optional)"}</label>
          <select id="audio-download-collection" className="w-full rounded-md border bg-background p-3" value={collectionId} onChange={e => setCollectionId(e.target.value)} disabled={busy}>
            <option value="">{bn ? "সম্পূর্ণ কিতাব" : "Entire Kitāb"}</option>
            {(collections.data ?? []).map(c => <option key={c.id} value={c.id}>{c.title_en || c.title_ar || c.id}</option>)}
          </select>
        </> : null}
        <Button type="button" size="lg" disabled={!canExport} onClick={() => void run()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? progress : (bn ? "অডিও ZIP ডাউনলোড" : "Download Audio ZIP")}
        </Button>
        <p className="text-xs text-muted-foreground">{bn ? "আইফোনের মেমরি সীমার কারণে বড় কিতাবের জন্য ছোট সংগ্রহ বেছে নিন।" : "For large Kitābs, choose smaller collections to avoid iPhone memory limits."}</p>
      </div>
    </section>
  );
}
