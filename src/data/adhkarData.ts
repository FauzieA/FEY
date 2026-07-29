export interface AdhkarItem {
  id: string;
  text: string;
  repetitions: number;
  source?: string; // Hadith reference
}

export interface AdhkarCategory {
  id: string;
  name: string;
  items: AdhkarItem[];
}

export const ADHKAR_DATA: Record<string, AdhkarCategory> = {
  morning: {
    id: "morning",
    name: "Morning Adhkar",
    items: [
      {
        id: "morning_1",
        text: "SubhanAllahi wa bihamdihi (100x)",
        repetitions: 100,
        source: "Bukhari & Muslim",
      },
      {
        id: "morning_2", 
        text: "La ilaha illallah wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir (100x)",
        repetitions: 100,
        source: "Bukhari & Muslim",
      },
      {
        id: "morning_3",
        text: "SubhanAllahi wa bihamdihi (100x)",
        repetitions: 100,
        source: "Muslim",
      },
      {
        id: "morning_4",
        text: "Allahu Akbar (34x), Alhamdulillah (33x), SubhanAllah (33x)",
        repetitions: 1,
        source: "Bukhari & Muslim",
      },
    ],
  },
  evening: {
    id: "evening",
    name: "Evening Adhkar",
    items: [
      {
        id: "evening_1",
        text: "Ayat al-Kursi (1x)",
        repetitions: 1,
        source: "Bukhari",
      },
      {
        id: "evening_2",
        text: "Surah Al-Ikhlas, Al-Falaq, An-Nas (3x each)",
        repetitions: 3,
        source: "Abu Dawud & Tirmidhi",
      },
      {
        id: "evening_3",
        text: "SubhanAllahi wa bihamdihi (100x)",
        repetitions: 100,
        source: "Bukhari & Muslim",
      },
      {
        id: "evening_4",
        text: "La ilaha illallah wahdahu la sharika lah (100x)",
        repetitions: 100,
        source: "Bukhari & Muslim",
      },
    ],
  },
  afterPrayer: {
    id: "afterPrayer",
    name: "After Prayer Adhkar",
    items: [
      {
        id: "after_prayer_1",
        text: "Astaghfirullah (3x)",
        repetitions: 3,
        source: "Tirmidhi",
      },
      {
        id: "after_prayer_2",
        text: "Allahumma anta as-salam wa minka as-salam (1x)",
        repetitions: 1,
        source: "Muslim",
      },
      {
        id: "after_prayer_3",
        text: "La ilaha illallah wahdahu la sharika lah (1x)",
        repetitions: 1,
        source: "Muslim",
      },
      {
        id: "after_prayer_4",
        text: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x)",
        repetitions: 1,
        source: "Muslim",
      },
    ],
  },
};

export const ISTIGHFAR_QUOTES = [
  "Istighfar opens the door to mercy.",
  "The one who constantly seeks forgiveness will find relief.",
  "Istighfar brings sustenance and strength.",
  "Allah loves those who turn to Him in repentance.",
  "Istighfar is a means of attaining peace of mind.",
  "The Prophet (peace be upon him) sought forgiveness 70-100 times daily.",
  "Istighfar removes distress and brings ease.",
  "Through istighfar, hearts find tranquility.",
];

export function getRandomIstighfarQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return ISTIGHFAR_QUOTES[dayOfYear % ISTIGHFAR_QUOTES.length];
}
