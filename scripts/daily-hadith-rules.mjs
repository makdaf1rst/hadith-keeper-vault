export const DAILY_EXCLUSION_RE = /\b(?:sex(?:ual)?|intercourse|menstruat(?:ion|e)|menses|violence|violent|kill(?:ed|ing|s)?|murder|war(?:fare)?|battle|fight(?:ing)?|alcohol|wine|intoxicant|medical|medicine|treatment|disease|illness|slave(?:ry)?|captive(?:s)?|prisoner|hell(?:fire)?|fire|punish\w*|torment\w*|blood|grave|satan|devil|jinn|insult|curse|abuse|urinat\w*|wetness|ghusl|wom[ae]n|wi(?:fe|ves)|husbands?|divorce\w*|marital|cauter\w*|hypocrite\w*|circumcis\w*|naked|private parts?|legs|intestines?|jews?|christians?|disbeliev\w*|polytheis\w*|vomit\w*|dogs?|wounds?|breastfe\w*|wet nurse|martyr\w*|dye|debt|die[sd]?|death|dead|shroud|what they would have done)\b|(?:যৌন|সহবাস|ঋতু|মাসিক|হায়েয|হত্যা|মারামারি|যুদ্ধ|লড়াই|মদ|মাদক|চিকিৎসা|ওষুধ|রোগ|দাস|বন্দী|জাহান্নাম|আগুন|শাস্তি|আযাব|রক্ত|কবর|শয়তান|জিন|অপমান|গালি|প্রস্রাব|গোসল|নারী|মহিলা|স্ত্রী|তালাক|মুনাফিক)/iu;

export const DAILY_THEME_RE = /\b(?:merc\w*|kind\w*|charit\w*|patien\w*|forgiv\w*|believer\w*|best|love\w*|paradise|remembrance|remember\w*|truth\w*|lord|prayer\w*|qur['’ʾ]?[aā]n|neighbou?r\w*|gratitude|grateful|supplicat\w*|intention\w*|character|reward\w*|deeds?|faith|hearts?|brother\w*|good\w*|muslims?|modest\w*|humil\w*|humble|generos\w*|honest\w*|fast(?:s|ing)?|ramadan|knowledge|mosques?|righteous\w*)\b/iu;

// The grade or source line that closes a hadith; each language must carry one.
export const DAILY_GRADE_EN_RE = /^(?:[ṢS]a[ḥh][īi][ḥh]|Authentic|[ḤH]asan|Good|Agreed upon)\b/iu;
export const DAILY_GRADE_BN_RE = /^(?:সহীহ|হাসান|মুত্তাফাকুন)/u;

// One quotation that closes the text, opened by a statement attributed to the Prophet ﷺ.
export const DAILY_SAYING_EN_RE = /^[^“]*(?:Messenger of Allah|Prophet)[^“]*\bsa(?:id|ys?)\b[^“]*“[^“]*”$/iu;
export const DAILY_SAYING_BN_RE = /^[^“]*(?:রাসূল|রাসুল|নবী)[^“]*বল(?:েছেন|লেন|েন)[^“]*“[^“]*”$/u;

// Read by hand: fragments that need their context, narrow rulings, and rewordings the overlap check missed.
export const DAILY_EXCLUDED_NUMBERS = new Set([
  527, 687, 1413, 1665, 1789, 1840, 1930, 1981, 2160, 2201, 2250, 2291, 2326, 2347, 3040, 3057, 3069, 3118, 3127,
  3136, 3138, 3222, 3224, 3259, 3720, 3964, 3965, 3969, 3974, 4137, 4246, 4261, 4265, 4278, 4363, 4367, 4412, 4417,
  4432, 4440, 5361, 5508, 5509, 5761, 5872, 5875, 5954, 5955, 6097, 6176, 6457, 7194, 7404, 7874, 8325, 10083,
  10212, 10217, 10297, 10353, 10476, 10520, 10787, 10945, 11064, 11399, 11528, 12551, 13177, 15825, 15947, 16114,
  16362, 16442, 2364, 2442, 2462, 2463, 2494, 2499, 2517, 2601, 4259, 4471, 4510, 4519, 4576, 4619, 4680, 4683, 10522,
  10523, 10524, 10525, 10526, 10964, 13699, 13773, 4578, 14366, 14735, 1735, 14906,
]);
