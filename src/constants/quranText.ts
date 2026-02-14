export interface QuranWord {
    id: number;
    text: string;
    transliteration?: string;
}

export interface QuranVerse {
    number: number;
    text: string;
    words: QuranWord[];
}

export interface QuranSurahText {
    id: number;
    verses: QuranVerse[];
}

export const quranTextData: Record<number, QuranSurahText> = {
    1: { // Al-Fatihah
        id: 1,
        verses: [
            {
                number: 1,
                text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
                words: [
                    { id: 1, text: "بِسْمِ" },
                    { id: 2, text: "اللَّهِ" },
                    { id: 3, text: "الرَّحْمَنِ" },
                    { id: 4, text: "الرَّحِيمِ" }
                ]
            },
            {
                number: 2,
                text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                words: [
                    { id: 5, text: "الْحَمْدُ" },
                    { id: 6, text: "لِلَّهِ" },
                    { id: 7, text: "رَبِّ" },
                    { id: 8, text: "الْعَالَمِينَ" }
                ]
            }
            // Add more as needed for testing
        ]
    },
    112: { // Al-Ikhlas
        id: 112,
        verses: [
            {
                number: 1,
                text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
                words: [
                    { id: 1, text: "قُلْ" },
                    { id: 2, text: "هُوَ" },
                    { id: 3, text: "اللَّهُ" },
                    { id: 4, text: "أَحَدٌ" }
                ]
            },
            {
                number: 2,
                text: "اللَّهُ الصَّمَدُ",
                words: [
                    { id: 5, text: "اللَّهُ" },
                    { id: 6, text: "الصَّمَدُ" }
                ]
            },
            {
                number: 3,
                text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
                words: [
                    { id: 7, text: "لَمْ" },
                    { id: 8, text: "يَلِدْ" },
                    { id: 9, text: "وَلَمْ" },
                    { id: 10, text: "يُولَدْ" }
                ]
            },
            {
                number: 4,
                text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
                words: [
                    { id: 11, text: "وَلَمْ" },
                    { id: 12, text: "يَكُن" },
                    { id: 13, text: "لَّهُ" },
                    { id: 14, text: "كُفُوًا" },
                    { id: 15, text: "أَحَدٌ" }
                ]
            }
        ]
    },
    114: { // An-Nas
        id: 114,
        verses: [
            {
                number: 1,
                text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
                words: [
                    { id: 1, text: "قُلْ" },
                    { id: 2, text: "أَعُوذُ" },
                    { id: 3, text: "بِرَبِّ" },
                    { id: 4, text: "النَّاسِ" }
                ]
            },
            {
                number: 2,
                text: "مَلِكِ النَّاسِ",
                words: [
                    { id: 5, text: "مَلِكِ" },
                    { id: 6, text: "النَّاسِ" }
                ]
            }
        ]
    }
};
