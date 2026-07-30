export const PRAYER_QUOTES =[
"The first thing Allah will ask you about on the Day of Judgment is your prayer.",

"If your prayer is accepted, the rest of your deeds have hope. If it is ruined, what comes after?",

"Between a person and disbelief is abandoning the prayer. (Sahih Muslim)",

"The covenant between us and them is the prayer. Whoever abandons it has committed disbelief. (Jami' at-Tirmidhi)",

"What if your next prayer is the one that saves you on the Day of Judgment?",

"One day you'll pray your last prayer. You just won't know it's your last.",

"Every prayer you delay is a meeting with Allah that you chose to postpone.",

"Allah invited you five times today. Did you answer?",

"The adhan isn't just a call to prayer. It's Allah calling you back to Him.",

"Your phone has notifications. Your Lord has invitations.",

"Allah gave you twenty-four hours. He asked for a few minutes.",

"If you have time to scroll, you have time to pray.",

"You never know which salah will be the one Allah accepts completely.",

"The grave won't ask about your streaks, followers, or grades. It will ask about your deeds.",

"Imagine standing before Allah and having no prayer to present.",

"The people of Hell were asked, 'What brought you here?' One of their first answers was: 'We were not among those who prayed.' (Qur'an 74:42-43)",

"Your excuses won't accompany you into the grave.",

"Death doesn't wait for motivation.",

"You're only one missed prayer away from making missing prayers feel normal.",

"Every missed prayer makes the next one easier to miss.",

"Satan doesn't always need you to stop praying. Sometimes delaying it is enough.",

"The Prophet ﷺ never considered prayer negotiable.",

"Allah never said, 'Pray when you're in the mood.'",

"Prayer was prescribed at fixed times. (Qur'an 4:103)",

"Imagine hearing the adhan in your grave, wishing you could answer it one last time.",

"The prayer you are too lazy to pray today may be the prayer you beg to return to tomorrow.",

"The Angel of Death will not wait until you've finished your episode.",

"Your soul belongs to Allah before it belongs to you.",

"Don't let your final meeting with Allah be after a lifetime of avoiding meetings with Him.",

"One day, the world will continue without you. Your prayers are what continue for you.",

"Allah sees every time you choose Him over your comfort.",

"When you stand for prayer, Allah already knows every word you'll say, yet He still wants to hear you.",

"You don't pray because Allah needs it. You pray because you do.",

"Prayer is where your heart learns who it belongs to.",

"The closest you'll ever be to Allah is while you're in sujood. (Sahih Muslim)",

"Stay in sujood a little longer. Maybe this is the moment your du'a is accepted.",

"Allah is never tired of hearing you, even if you're repeating the same du'a.",

"Your tears in sujood are never wasted.",

"Allah knows what you couldn't put into words before you even raise your hands.",

"Tell Allah about your day. He was there for every second of it.",

"You don't have to impress Allah. Just be sincere.",

"The prayer mat has witnessed tears nobody else knows about.",

"Your salah is your daily appointment with the King of Kings.",

"Imagine missing a meeting with the president. Why is missing a meeting with Allah easier?",

"The Prophet ﷺ said, 'Give us comfort through prayer.'",

"The Prophet ﷺ ran toward prayer, not away from it.",

"When something worried the Prophet ﷺ, he prayed.",

"The Prophet ﷺ stood in prayer until his feet swelled.",

"He wasn't forced. He loved standing before Allah.",

"The Prophet ﷺ had his sins forgiven, yet he still prayed through the night.",

"What excuse do I have?",

"If the Prophet ﷺ needed prayer, how much more do we?",

"The strongest person is the one who answers the adhan despite laziness.",

"Allah is watching you even when nobody else is.",

"The prayer you hide is often more beloved than the worship people see.",

"Every sincere sujood is known to Allah, even if no one else knows.",

"Prayer washes away sins between one prayer and the next.",

"Five prayers are like bathing in a river five times a day; sins are washed away. (Sahih al-Bukhari & Sahih Muslim)",

"Never underestimate a sincere Astaghfirullah after salah.",

"The angels witness Fajr.",

"Fajr separates those who truly love Allah from those who only love sleep.",

"If people knew the reward of Fajr and Isha, they would come even if they had to crawl. (Sahih al-Bukhari & Sahih Muslim)",

"The warmth of your bed won't follow you into your grave.",

"The prayer mat is softer than the soil of the grave.",

"One day your forehead will touch the earth permanently. Let it touch it in sujood first.",

"The world tells you to chase success. Allah tells you to establish prayer.",

"The most successful people in the Qur'an are those who establish salah.",

"Prayer is not interrupting your life. It is your life being put back in order.",

"You've survived every difficult day Allah already brought you through. Meet Him in prayer today.",

"Sometimes Allah delays what you want because He's waiting for you to ask Him in sujood.",

"The door to Allah is never locked.",

"No matter how many sins you've committed, the next prayer is still waiting.",

"Allah never gets tired of forgiving. We get tired of asking.",

"The adhan is mercy disguised as a reminder.",

"Your Lord still invites you, even after every mistake you've made.",

"Every prayer is another chance to return.",

"The distance between you and Allah is often just one sincere sujood.",

"Don't wait to become a better Muslim before praying. Prayer is what helps make you one.",

"If you're ashamed to face Allah after sinning, remember that Shaytan wants exactly that.",

"Run back to Allah, not away from Him.",

"The prayer you almost skipped may have been the one that changed your destiny.",

"Some blessings arrive only after sujood.",

"Some hardships leave only after du'a.",

"Some hearts heal only in prayer.",

"Allah already knows your pain. Prayer is your permission to place it before Him.",

"The world becomes quieter when your heart remembers Allah.",

"You'll never regret praying. You'll only regret not praying.",

"On the Day of Judgment, nobody will wish they had prayed less.",

"Jannah has never been too expensive. It has always required sincerity.",

"Perhaps the only thing standing between you and Paradise is consistency in prayer.",

"Maybe your next salah is the one Allah has been waiting for."
];

export function getRandomPrayerQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return PRAYER_QUOTES[dayOfYear % PRAYER_QUOTES.length];
}
