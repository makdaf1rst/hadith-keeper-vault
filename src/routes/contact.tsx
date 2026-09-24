import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Al-Jāmiʿ al-Kāmil" },
      { name: "description", content: "Contact the Al-Jāmiʿ al-Kāmil project to report genuine database corrections or discuss contributing to future scholarly projects." },
      { property: "og:title", content: "Contact — Al-Jāmiʿ al-Kāmil" },
      { property: "og:description", content: "Report genuine corrections, make duʿāʾ for the project, or get in touch about contributing to future work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { interfaceLanguage } = useLanguage();
  const bn = interfaceLanguage === "bn";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-parchment">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <Mail className="size-5 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">{bn ? "আল-জামি আল-কামিল" : "Al-Jāmiʿ al-Kāmil"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-foreground">{bn ? "যোগাযোগ" : "Contact"}</h1>

          {bn ? (
            <div className="mt-6 space-y-5 text-base leading-8 text-foreground/90">
              <p>
                এই প্রকল্পটি কেবল আল্লাহর সন্তুষ্টির জন্য গ্রহণ করা হয়েছে। আমরা মহান আল্লাহর কাছে প্রার্থনা করি, তিনি এটি কবুল করুন, এতে ইখলাস ও উপকার দান করুন এবং এর সঙ্গে সংশ্লিষ্ট প্রতিটি প্রচেষ্টাকে সওয়াবের মাধ্যম বানান। আল্লাহ আমাদের সবার সেই সব আমল কবুল করুন যা একান্তভাবে তাঁর জন্য করা হয়।
              </p>
              <p>
                এই ডাটাবেস প্রস্তুত ও পর্যালোচনায় সর্বোচ্চ যত্ন নেওয়া হলেও মানুষের কাজ ভুলের সম্ভাবনা থেকে মুক্ত নয়। আপনি যদি কোনো প্রকৃত ভুল, অনুপস্থিত অংশ, ভুল শব্দ, ভাঙা রেফারেন্স, প্রদর্শনগত সমস্যা বা সংশোধনযোগ্য অন্য কোনো বিষয় দেখতে পান, অনুগ্রহ করে আমাদের জানান। সমস্যাটির একটি পরিষ্কার স্ক্রিনশটের সঙ্গে সঠিক কিতাব, অধ্যায়, হাদীস নম্বর এবং সমস্যার প্রকৃতি চিহ্নিত করার মতো যথেষ্ট তথ্য পাঠান। এতে আমরা বিষয়টি সতর্কভাবে যাচাই করে কেবল যথাযথভাবে প্রমাণিত সংশোধন করতে পারব।
              </p>
              <p>
                আমরা এই প্রকল্পের জন্য ব্যক্তিগত অনুদান গ্রহণ করি না। আপনি আন্তরিকভাবে সহযোগিতা করতে চাইলে আমাদের পক্ষ থেকে কোনো বিশ্বস্ত খাতে সদাকাহ করুন এবং আপনার দোয়ায় আমাদের স্মরণ রাখুন। আল্লাহর কাছে প্রার্থনা করুন যেন তিনি আমাদের ক্ষমা করেন, এই কাজ কবুল করেন, ভুল থেকে রক্ষা করেন, মানুষের জন্য উপকারী করেন এবং এতে জড়িত সবাইকে ইখলাস ও উত্তম পরিণতি দান করেন।
              </p>
              <p>
                তবে আপনি যদি আমাদের ভবিষ্যৎ প্রকল্পগুলোর উন্নয়নে বাস্তবভাবে অংশ নিতে চান—গবেষণা, প্রযুক্তিগত উন্নয়ন, ইলমী সহায়তা, প্রুফরিডিং, ডিজাইন অথবা প্রকল্পের প্রকৃত উন্নয়নের উদ্দেশ্যে আর্থিক সহায়তার মাধ্যমে—তাহলে আমাদের সঙ্গে যোগাযোগ করতে পারেন। কাজের মান, নির্ভুলতা, সহজলভ্যতা ও দীর্ঘমেয়াদি উপকার বৃদ্ধি করে এমন আন্তরিক সহযোগিতাকে আমরা বিশেষভাবে স্বাগত জানাই।
              </p>
              <p>সংশোধনের প্রতিবেদন, সহযোগিতা বা ভবিষ্যৎ প্রকল্প সম্পর্কে জিজ্ঞাসার জন্য আমাদের সঙ্গে যোগাযোগ করুন:</p>
              <p>
                <a href="mailto:Aljamiushshamil@gmail.com" className="font-semibold text-primary underline underline-offset-4">Aljamiushshamil@gmail.com</a>
              </p>
              <p className="italic text-muted-foreground">
                আল্লাহ সঠিক বিষয়গুলো কবুল করুন, ত্রুটিগুলো ক্ষমা করুন এবং এই কাজকে স্থায়ী উপকারের উৎস বানান।
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5 english-text text-base leading-8 text-foreground/90">
              <p>This project was undertaken solely for the sake of Allah. We ask Allah, Most High, to accept it, to place sincerity and benefit in it, and to make every effort connected to it a means of reward. May Allah accept from all of us every deed that is done sincerely for His sake.</p>
              <p>Although great care has been taken in preparing and reviewing this database, human work is never free from the possibility of error. If you find a genuine mistake, missing material, incorrect wording, broken reference, display problem, or any other issue that truly requires correction, we would be grateful if you could inform us. Please send a clear screenshot of the issue together with enough detail to identify the exact Book, Chapter, hadith number, and the nature of the problem. This will help us investigate the matter carefully and make only corrections that are properly verified.</p>
              <p>We do not accept personal donations for this project. If you sincerely wish to give in support of the effort, then please give charity on our behalf to a trustworthy cause and remember us in your duʿāʾ. Ask Allah to forgive us, accept this work, protect it from error, allow it to benefit people, and grant everyone involved in it sincerity and a good end.</p>
              <p>If, however, you genuinely wish to take part in the development of our future projects — whether through research, technical development, scholarly assistance, proofreading, design, or financial support directed toward the actual development of those projects — you are welcome to contact us. We are especially interested in sincere collaboration that helps strengthen the quality, accuracy, accessibility, and long-term benefit of the work.</p>
              <p>For correction reports, collaboration, or enquiries regarding future projects, please contact us at:</p>
              <p><a href="mailto:Aljamiushshamil@gmail.com" className="font-semibold text-primary underline underline-offset-4">Aljamiushshamil@gmail.com</a></p>
              <p className="italic text-muted-foreground">May Allah accept what is correct, forgive what is deficient, and make this work a source of lasting benefit.</p>
            </div>
          )}
        </div>

        <Button asChild variant="outline" className="mt-8">
          <Link to="/">
            <ArrowLeft aria-hidden />
            {bn ? "গ্রন্থাগারে ফিরে যান" : "Back to the library"}
          </Link>
        </Button>
      </main>
    </div>
  );
}
