type BookIntroDisplayOverride = {
  intro_ar_display: string;
  intro_en_display: string;
};

/**
 * Source-verified book-level introductions that are present in the master DOCX
 * immediately after the Kitāb heading and before the first Bāb, but are missing
 * or truncated in public/content/books.json.
 *
 * These are display-only overrides. Source fields remain untouched.
 */
export const bookIntroDisplayOverrides: Record<number, BookIntroDisplayOverride> = {
  9: {
    intro_ar_display: "جموع ما جاء في وجوب الصالة وفضلها",
    intro_en_display: "A collection of what has been reported about the obligation of prayer and its virtue",
  },
  13: {
    intro_ar_display: "جموع أبواب الصبر على االبتالء والمرض",
    intro_en_display: "Compilation of chapters on patience in affliction and illness",
  },
  14: {
    intro_ar_display:
      "فُرضت الزكاة في السنة الثانية على الصحيح.\nجموع األبواب في وجوب الزكاة والترغيب في أدائها والترهيب من منعها",
    intro_en_display:
      "Zakat was prescribed in the second year after the migration, according to the stronger view.\nCompilation of chapters on the obligation of zakat, encouragement to give it, and warning against withholding it",
  },
  15: {
    intro_ar_display: "جموع ما جاء في وجوب الصيام وفضله وأحكامه",
    intro_en_display: "Collected sections on the obligation of fasting, its virtue, and its rulings",
  },
  16: {
    intro_ar_display: "جموع أبواب ما جاء في وجوب الحّج وفضله وشروطه",
    intro_en_display: "Sections on the obligation of pilgrimage, its virtue, and its conditions",
  },
  24: {
    intro_ar_display: "جموع أبواب ما جاء في النكاح وشروطه",
    intro_en_display: "Collected chapters on what has been reported regarding marriage and its conditions",
  },
  31: {
    intro_ar_display: "جموع ما جاء في أدب القاضي",
    intro_en_display: "Collection of what has been narrated regarding the etiquette of the judge",
  },
  32: {
    intro_ar_display: "جموع أبواب ماجاء في تحريم الدماء المعصومة",
    intro_en_display: "Sections on the prohibition of unlawfully shedding protected blood",
  },
  33: {
    intro_ar_display: "جموع ما جاء في الحدود عامة",
    intro_en_display: "General Narrations Regarding Legal Punishments",
  },
  35: {
    intro_ar_display: "جموع أبواب ما جاء في األيمان",
    intro_en_display: "Collection of Chapters Regarding Oaths",
  },
  40: {
    intro_ar_display: "جموع ما جاء في الحالل من األطعمة",
    intro_en_display: "Collection of What Has Been Reported Concerning Lawful Foods",
  },
  43: {
    intro_ar_display: "جموع ما ج اء في فضائل الجهاد",
    intro_en_display: "Collection of Chapters Concerning the Virtues of Striving in the Path of God",
  },
  47: {
    intro_ar_display: "جموع أخبار آدم عليه السالم",
    intro_en_display: "Collection of Reports Concerning Adam, Peace Be upon Him",
  },
  49: {
    intro_ar_display: "مجموع ما جاء في فضل الصحبة",
    intro_en_display: "Collection of Reports Concerning the Virtue of Companionship",
  },
  52: {
    intro_ar_display: "مجموع ما جاء في فضائل مكة والمدينة مًعا",
    intro_en_display: "Collection of Narrations Concerning the Virtues of Makkah and Madinah Together",
  },
  53: {
    intro_ar_display: "مجموع ما جاء في فضائل الشهور",
    intro_en_display: "Collection of Narrations Concerning the Virtues of the Months",
  },
  54: {
    intro_ar_display: "مجموع ما جاء في األذكار",
    intro_en_display: "Collection of Narrations Concerning Remembrances",
  },
  57: {
    intro_ar_display: "مجموع ما جاء في الطب",
    intro_en_display: "A Collection of What Has Been Reported Concerning Medicine",
  },
  59: {
    intro_ar_display: "مجموع ما جاء في علوم القرآن",
    intro_en_display: "A Collection of Reports Concerning the Sciences of the Qur’an",
  },
  61: {
    intro_ar_display: "مجموع ما جاء في مكارم األخالق",
    intro_en_display: "Collection of Reports Concerning Noble Character",
  },
  63: {
    intro_ar_display: "جموع ما جاء في أنواع اللباس وألوانه",
    intro_en_display: "Collection of What Has Been Narrated Concerning Types and Colors of Clothing",
  },
  65: {
    intro_ar_display: "جموع ما جاء في الفتن",
    intro_en_display: "Collection of What Has Been Narrated Concerning Tribulations",
  },
  66: {
    intro_ar_display: "جموع ما جاء في صفة يوم القيامة",
    intro_en_display:
      "A Collection of What Has Been Narrated Concerning the Description of the Day of Judgment",
  },
};

export function getBookIntroDisplayOverride(bookNumber: number | null | undefined) {
  if (!bookNumber) return null;
  return bookIntroDisplayOverrides[bookNumber] ?? null;
}
