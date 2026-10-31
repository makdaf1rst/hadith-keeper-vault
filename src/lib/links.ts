import { toast } from "sonner";
import { isNative, isShareCancelled } from "./native";

// shared by /settings (app) and the site header menu + footer (website)
export const BOOKS_USED_URL = {
  en: "https://drive.google.com/file/d/10_ZkVs3B4kIlxTnMSYy982FwMmAxSSFY/view",
  bn: "https://drive.google.com/file/d/1c5KMFNUTWDgYVqAGU1hKgU6fv9EgsFen/view",
};
export const NARRATORS_URL = {
  en: "https://drive.google.com/file/d/19C5NU_lLYtPqTSS-h1PhVxxaWQXdQq49/view",
  bn: "https://drive.google.com/file/d/1UVM6aDTx6YNbOZP8uvP4bNghx7dwxJUI/view",
};

export async function shareApp(bn: boolean) {
  const url = "https://jami-al-kamil.com";
  try {
    if (isNative()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: "Al-Jāmiʿ al-Kāmil", url });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: "Al-Jāmiʿ al-Kāmil", url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(bn ? "লিংক কপি হয়েছে" : "Link copied");
  } catch (error) {
    if (isShareCancelled(error)) return;
    toast.error(bn ? "শেয়ার করা যায়নি" : "Could not share");
  }
}
