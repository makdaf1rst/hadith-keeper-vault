// Shared "About this library" text: home page (website) and Settings → About (app).
export function AboutLibrary({ bn, className = "" }: { bn: boolean; className?: string }) {
  return (
    <div className={`space-y-4 leading-7 text-muted-foreground ${className}`}>
      {bn ? (
        <>
          <p>
            শাইখ দিয়া আল-রহমান আল-আযমী (ضياء الرحمن الأعظمي) ছিলেন হাদীসের একজন বিশিষ্ট
            আলিম এবং মদিনা ইসলামী বিশ্ববিদ্যালয়ের অধ্যাপক। তাঁর অন্যতম শ্রেষ্ঠ ইলমী
            কীর্তি হলো{" "}
            <em>
              আল-জামি‘ আল-কামিল ফি আল-হাদীস আস-সহীহ আশ-শামিল আল-মুরাত্তাব ‘আলা আবওয়াব
              আল-ফিকহ
            </em>
            — রাসূলুল্লাহ ﷺ-এর নির্ভরযোগ্য সুন্নাহকে এক সুবিস্তৃত ও সুসংগঠিত সংকলনে
            একত্র করার এক মহৎ প্রচেষ্টা।
          </p>
          <p>
            এই গ্রন্থ প্রস্তুত করতে শাইখ আল-আযমী ২০০টিরও বেশি হাদীসগ্রন্থ থেকে উপকরণ
            গ্রহণ করেন এবং পুনরাবৃত্তি বাদ দিয়ে আনুমানিক ৬০,০০০ স্বতন্ত্র হাদীসের বিশাল
            ভাণ্ডার পর্যালোচনা করেন। ব্যাপক গবেষণা, তুলনা, যাচাই ও হাদীসের মান
            নির্ধারণের মাধ্যমে তিনি চূড়ান্ত সংকলনে ১৬,৫৪৬টি নম্বরযুক্ত বর্ণনা
            অন্তর্ভুক্ত করেন। এই গ্রন্থের অন্যতম বৈশিষ্ট্য হলো গ্রহণযোগ্য বর্ণনা—সহীহ ও
            হাসান হাদীস—এর ওপর গুরুত্ব, যা ইসলামী ফিকহের কিতাব ও অধ্যায় অনুযায়ী
            বিন্যস্ত।
          </p>
          <p>
            এই বাংলা অনুবাদ মহান এই গ্রন্থকে বাংলা ভাষাভাষী পাঠকদের জন্য আরও সহজলভ্য
            করার এবং রাসূলুল্লাহ ﷺ-এর সুন্নাহ সংরক্ষণ ও প্রচারে আমাদের সামর্থ্য অনুযায়ী
            ক্ষুদ্র অবদান রাখার একটি বিনীত প্রচেষ্টা।
          </p>
          <p>
            আমরা আল্লাহর কাছে প্রার্থনা করি, তিনি আমাদের ভুল ও ত্রুটি ক্ষমা করুন, এই
            প্রচেষ্টায় ইখলাস ও উপকার দান করুন, সুন্নাহর খেদমতের জন্য শাইখ দিয়া
            আল-রহমান আল-আযমীকে অফুরন্ত প্রতিদান দিন এবং এই কাজটি কেবল তাঁর সন্তুষ্টির
            জন্য আমাদের পক্ষ থেকে কবুল করুন। আমীন।
          </p>
        </>
      ) : (
        <>
          <p>
            Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī (ضياء الرحمن الأعظمي) was a distinguished
            scholar of Ḥadīth and a professor at the Islamic University of Madinah.
            Among his greatest scholarly achievements is{" "}
            <em>
              Al-Jāmiʿ al-Kāmil fī al-Ḥadīth al-Ṣaḥīḥ al-Shāmil al-Murattab ʿalā Abwāb
              al-Fiqh
            </em>
            , a monumental effort to gather the reliable Sunnah of the Messenger of
            Allah ﷺ into one comprehensive and systematically arranged collection.
          </p>
          <p>
            In preparing this work, Shaykh al-Aʿẓamī drew upon more than 200 books of
            Ḥadīth and surveyed a vast body of narrations that he estimated at
            approximately 60,000 distinct hadith texts after repetitions were removed.
            Through extensive research, comparison, verification, and grading, he
            compiled 16,546 numbered narrations in the final collection. One of the
            defining features of the work is its focus on accepted narrations — Ṣaḥīḥ
            (Authentic) and Ḥasan (Good) hadiths — arranged according to the books and
            chapters of Islamic jurisprudence.
          </p>
          <p>
            This English translation is a humble effort to make this great work more
            accessible to English-speaking readers and to contribute, in whatever small
            measure we can, to the preservation and spread of the Sunnah of the
            Messenger of Allah ﷺ.
          </p>
          <p>
            We ask Allah to overlook our mistakes and shortcomings, place sincerity and
            benefit in this effort, reward Shaykh Ḍiyāʾ al-Raḥmān al-Aʿẓamī abundantly
            for his service to the Sunnah, and accept this deed from us solely for His
            sake. Āmīn.
          </p>
        </>
      )}
    </div>
  );
}
