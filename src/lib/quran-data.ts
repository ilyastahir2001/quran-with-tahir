export interface Surah {
  number: number;
  name: string;
  arabicName: string;
  ayahCount: number;
  juzz: number;
}

export const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", ayahCount: 7, juzz: 1 },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", ayahCount: 286, juzz: 1 },
  { number: 3, name: "Aal-E-Imran", arabicName: "آل عمران", ayahCount: 200, juzz: 3 },
  { number: 4, name: "An-Nisa", arabicName: "النساء", ayahCount: 176, juzz: 4 },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", ayahCount: 120, juzz: 6 },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", ayahCount: 165, juzz: 7 },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", ayahCount: 206, juzz: 8 },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", ayahCount: 75, juzz: 9 },
  { number: 9, name: "At-Tawbah", arabicName: "التوبة", ayahCount: 129, juzz: 10 },
  { number: 10, name: "Yunus", arabicName: "يونس", ayahCount: 109, juzz: 11 },
  { number: 11, name: "Hud", arabicName: "هود", ayahCount: 123, juzz: 11 },
  { number: 12, name: "Yusuf", arabicName: "يوسف", ayahCount: 111, juzz: 12 },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", ayahCount: 43, juzz: 13 },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", ayahCount: 52, juzz: 13 },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", ayahCount: 99, juzz: 14 },
  { number: 16, name: "An-Nahl", arabicName: "النحل", ayahCount: 128, juzz: 14 },
  { number: 17, name: "Al-Isra", arabicName: "الإسراء", ayahCount: 111, juzz: 15 },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", ayahCount: 110, juzz: 15 },
  { number: 19, name: "Maryam", arabicName: "مريم", ayahCount: 98, juzz: 16 },
  { number: 20, name: "Ta-Ha", arabicName: "طه", ayahCount: 135, juzz: 16 },
  { number: 21, name: "Al-Anbiya", arabicName: "الأنبياء", ayahCount: 112, juzz: 17 },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", ayahCount: 78, juzz: 17 },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", ayahCount: 118, juzz: 18 },
  { number: 24, name: "An-Nur", arabicName: "النور", ayahCount: 64, juzz: 18 },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", ayahCount: 77, juzz: 18 },
  { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", ayahCount: 227, juzz: 19 },
  { number: 27, name: "An-Naml", arabicName: "النمل", ayahCount: 93, juzz: 19 },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", ayahCount: 88, juzz: 20 },
  { number: 29, name: "Al-Ankabut", arabicName: "العنكبوت", ayahCount: 69, juzz: 20 },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", ayahCount: 60, juzz: 21 },
  { number: 31, name: "Luqman", arabicName: "لقمان", ayahCount: 34, juzz: 21 },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", ayahCount: 30, juzz: 21 },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", ayahCount: 73, juzz: 21 },
  { number: 34, name: "Saba", arabicName: "سبأ", ayahCount: 54, juzz: 22 },
  { number: 35, name: "Fatir", arabicName: "فاطر", ayahCount: 45, juzz: 22 },
  { number: 36, name: "Ya-Sin", arabicName: "يس", ayahCount: 83, juzz: 22 },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", ayahCount: 182, juzz: 23 },
  { number: 38, name: "Sad", arabicName: "ص", ayahCount: 88, juzz: 23 },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", ayahCount: 75, juzz: 23 },
  { number: 40, name: "Ghafir", arabicName: "غافر", ayahCount: 85, juzz: 24 },
  { number: 41, name: "Fussilat", arabicName: "فصلت", ayahCount: 54, juzz: 24 },
  { number: 42, name: "Ash-Shura", arabicName: "الشورى", ayahCount: 53, juzz: 25 },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", ayahCount: 89, juzz: 25 },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", ayahCount: 59, juzz: 25 },
  { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", ayahCount: 37, juzz: 25 },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", ayahCount: 35, juzz: 26 },
  { number: 47, name: "Muhammad", arabicName: "محمد", ayahCount: 38, juzz: 26 },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", ayahCount: 29, juzz: 26 },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", ayahCount: 18, juzz: 26 },
  { number: 50, name: "Qaf", arabicName: "ق", ayahCount: 45, juzz: 26 },
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", ayahCount: 60, juzz: 26 },
  { number: 52, name: "At-Tur", arabicName: "الطور", ayahCount: 49, juzz: 27 },
  { number: 53, name: "An-Najm", arabicName: "النجم", ayahCount: 62, juzz: 27 },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", ayahCount: 55, juzz: 27 },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", ayahCount: 78, juzz: 27 },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", ayahCount: 96, juzz: 27 },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", ayahCount: 29, juzz: 27 },
  { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", ayahCount: 22, juzz: 28 },
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", ayahCount: 24, juzz: 28 },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", ayahCount: 13, juzz: 28 },
  { number: 61, name: "As-Saf", arabicName: "الصف", ayahCount: 14, juzz: 28 },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", ayahCount: 11, juzz: 28 },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", ayahCount: 11, juzz: 28 },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", ayahCount: 18, juzz: 28 },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", ayahCount: 12, juzz: 28 },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", ayahCount: 12, juzz: 28 },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", ayahCount: 30, juzz: 29 },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", ayahCount: 52, juzz: 29 },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", ayahCount: 52, juzz: 29 },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", ayahCount: 44, juzz: 29 },
  { number: 71, name: "Nuh", arabicName: "نوح", ayahCount: 28, juzz: 29 },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", ayahCount: 28, juzz: 29 },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", ayahCount: 20, juzz: 29 },
  { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", ayahCount: 56, juzz: 29 },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", ayahCount: 40, juzz: 29 },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", ayahCount: 31, juzz: 29 },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", ayahCount: 50, juzz: 29 },
  { number: 78, name: "An-Naba", arabicName: "النبأ", ayahCount: 40, juzz: 30 },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", ayahCount: 46, juzz: 30 },
  { number: 80, name: "Abasa", arabicName: "عبس", ayahCount: 42, juzz: 30 },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", ayahCount: 29, juzz: 30 },
  { number: 82, name: "Al-Infitar", arabicName: "الانفطار", ayahCount: 19, juzz: 30 },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", ayahCount: 36, juzz: 30 },
  { number: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", ayahCount: 25, juzz: 30 },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", ayahCount: 22, juzz: 30 },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", ayahCount: 17, juzz: 30 },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", ayahCount: 19, juzz: 30 },
  { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", ayahCount: 26, juzz: 30 },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", ayahCount: 30, juzz: 30 },
  { number: 90, name: "Al-Balad", arabicName: "البلد", ayahCount: 20, juzz: 30 },
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", ayahCount: 15, juzz: 30 },
  { number: 92, name: "Al-Layl", arabicName: "الليل", ayahCount: 21, juzz: 30 },
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", ayahCount: 11, juzz: 30 },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", ayahCount: 8, juzz: 30 },
  { number: 95, name: "At-Tin", arabicName: "التين", ayahCount: 8, juzz: 30 },
  { number: 96, name: "Al-Alaq", arabicName: "العلق", ayahCount: 19, juzz: 30 },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", ayahCount: 5, juzz: 30 },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", ayahCount: 8, juzz: 30 },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", ayahCount: 8, juzz: 30 },
  { number: 100, name: "Al-Adiyat", arabicName: "العاديات", ayahCount: 11, juzz: 30 },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", ayahCount: 11, juzz: 30 },
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", ayahCount: 8, juzz: 30 },
  { number: 103, name: "Al-Asr", arabicName: "العصر", ayahCount: 3, juzz: 30 },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", ayahCount: 9, juzz: 30 },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", ayahCount: 5, juzz: 30 },
  { number: 106, name: "Quraysh", arabicName: "قريش", ayahCount: 4, juzz: 30 },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", ayahCount: 7, juzz: 30 },
  { number: 108, name: "Al-Kawthar", arabicName: "الكوثر", ayahCount: 3, juzz: 30 },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", ayahCount: 6, juzz: 30 },
  { number: 110, name: "An-Nasr", arabicName: "النصر", ayahCount: 3, juzz: 30 },
  { number: 111, name: "Al-Masad", arabicName: "المسد", ayahCount: 5, juzz: 30 },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", ayahCount: 4, juzz: 30 },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", ayahCount: 5, juzz: 30 },
  { number: 114, name: "An-Nas", arabicName: "الناس", ayahCount: 6, juzz: 30 },
];

export const QURAN_SUBJECTS = [
  { value: "tilawah", label: "Tilawah (Reading)" },
  { value: "tajweed", label: "Tajweed (Pronunciation)" },
  { value: "hifz", label: "Hifz (Memorization)" },
  { value: "revision", label: "Revision" },
  { value: "arabic", label: "Arabic Language" },
  { value: "islamic_studies", label: "Islamic Studies" },
] as const;

export const TEACHING_METHODS = [
  { value: "recitation", label: "Recitation Practice" },
  { value: "listening", label: "Listening & Correction" },
  { value: "memorization", label: "Memorization Drill" },
  { value: "explanation", label: "Tafsir/Explanation" },
  { value: "revision", label: "Revision Session" },
] as const;

export function getSurahByNumber(number: number): Surah | undefined {
  return SURAHS.find((s) => s.number === number);
}

export function getSurahByName(name: string): Surah | undefined {
  return SURAHS.find(
    (s) => s.name.toLowerCase() === name.toLowerCase() || s.arabicName === name
  );
}

export function getMaxAyahForSurah(surahNumber: number): number {
  const surah = getSurahByNumber(surahNumber);
  return surah?.ayahCount ?? 286;
}
