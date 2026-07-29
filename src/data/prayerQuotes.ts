export const PRAYER_QUOTES = [
  "Prayer is the pillar of religion.",
  "The prayer of a person is indeed his light.",
  "Prayer is the first thing you will be questioned about.",
  "Be constant in prayer for it is the key to paradise.",
  "The coolness of my eyes was placed in prayer.",
  "Prayer connects you to your Creator.",
  "In prayer, you find peace and strength.",
  "Prayer is a conversation with Allah.",
  "Stand in prayer as if it is your last.",
  "Prayer is the refuge of the believer.",
  "Through prayer, hearts find rest.",
  "Prayer is the best provision for the journey.",
  "In sujood, you are closest to Allah.",
  "Prayer transforms the heart.",
  "The believer finds comfort in prayer.",
];

export function getRandomPrayerQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return PRAYER_QUOTES[dayOfYear % PRAYER_QUOTES.length];
}
