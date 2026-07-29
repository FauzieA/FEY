export interface AdhkarItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  arabic: string;
  translation: string;
  repetitions: number;
  shortBenefit: string;
  benefit: string;
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
  title: "Ayat al-Kursi",
  subtitle: "The Greatest Protection",
  category: "Protection",
  arabic: `أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ.

اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ`,
  translation: `I seek the protection of Allah from the rejected Shayṭān.

Allah—there is no god worthy of worship except Him, the Ever-Living, the Sustainer of all. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass nothing of His knowledge except what He wills. His Kursī extends over the heavens and the earth, and preserving them does not tire Him. He is the Most High, the Most Magnificent.`,
  repetitions: 1,
  shortBenefit: "Protected until the evening.",
  benefit: "Whoever recites Āyat al-Kursī in the morning will be protected until the evening. Whoever recites it in the evening will be protected until the morning. The Prophet ﷺ confirmed this by saying: 'The evil one spoke the truth.'",
},

{
  id: "morning_2",
  title: "The Three Quls",
  subtitle: "Protection from Every Evil",
  category: "Protection",
  arabic: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

قُلْ هُوَ اللّٰهُ أَحَدٌ ۝ اللّٰهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ

بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ

بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ`,
  translation: `In the Name of Allah, the All-Merciful, the Very Merciful.

Say: He is Allah, the One, the Self-Sufficient Master. He has not given birth, nor was He born, and there is none equal to Him. (112)

In the Name of Allah, the All-Merciful, the Very Merciful.

Say: I seek protection in the Lord of the daybreak, from the evil of what He has created, from the evil of the darkness when it settles, from the evil of those who blow on knots, and from the evil of the envier when he envies. (113)

In the Name of Allah, the All-Merciful, the Very Merciful.

Say: I seek protection in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the whisperer who withdraws, who whispers into the hearts of mankind, whether from among the jinn or mankind. (114)`,
  repetitions: 3,
  shortBenefit: "Sufficient against every type of evil.",
  benefit: "Recite Sūrah al-Ikhlāṣ, Sūrah al-Falaq and Sūrah al-Nās three times every morning and evening. The Prophet ﷺ said: 'It will suffice you in all respects,' meaning they will protect you from every type of evil.",
},
{
  id: "morning_3",
  title: "Sayyid al-Istighfar",
  subtitle: "The Best Way of Seeking Forgiveness",
  category: "Forgiveness",
  arabic: `اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ لَكَ بِذَنْبِيْ ، فَاغْفِرْ لِيْ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ.`,
  translation: `O Allah, You are my Lord. There is no god worthy of worship except You. You created me, and I am Your servant. I remain faithful to Your covenant and promise as best I can. I seek Your protection from the evil of what I have done. I acknowledge the blessings You have bestowed upon me, and I confess my sins. So forgive me, for none forgives sins except You.`,
  repetitions: 1,
  shortBenefit: "A means to Paradise.",
  benefit: "The Prophet ﷺ called this 'the best way of seeking forgiveness.' Whoever recites it with sincere conviction in the morning and dies before evening will be among the people of Paradise. Likewise, whoever recites it at night with sincere conviction and dies before morning will be among the people of Paradise.",
},

{
  id: "morning_4",
  title: "Protection from Anxiety, Laziness & Debt",
  subtitle: "A Du'a for Relief",
  category: "Protection",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ ، وَأَعُوْذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ ، وَأَعُوْذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ ، وَأَعُوْذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.`,
  translation: `O Allah, I seek Your protection from anxiety and grief. I seek Your protection from inability and laziness. I seek Your protection from cowardice and miserliness, and I seek Your protection from being overcome by debt and being overpowered by people.`,
  repetitions: 1,
  shortBenefit: "Relief from worries and debt.",
  benefit: "The Prophet ﷺ taught this supplication to Abū Umāmah رضي الله عنه and said that by reciting it morning and evening, Allah would remove his worries and settle his debts. Abū Umāmah later said that Allah did exactly that.",
},

{
  id: "morning_5",
  title: "Ask Allah for Well-being",
  subtitle: "Well-being in This Life and the Next",
  category: "Well-being",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِيْ دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ ، اَللّٰهُمَّ اسْتُرْ عَوْرَاتِيْ وَآمِنْ رَّوْعَاتِيْ ، اَللّٰهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ ، وَمِنْ خَلْفِيْ ، وَعَنْ يَمِيْنِيْ ، وَعَنْ شِمَالِيْ ، وَمِنْ فَوْقِيْ ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ.`,
  translation: `O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for forgiveness and well-being in my religion, my worldly affairs, my family and my wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from in front of me, from behind me, from my right, from my left and from above me. I seek protection in Your Greatness from being unexpectedly destroyed from beneath me.`,
  repetitions: 1,
  shortBenefit: "Asking for complete well-being and protection.",
  benefit: "The Messenger of Allah ﷺ never abandoned this supplication in the morning and evening. He also said: 'After certainty (yaqīn), no one has been given anything better than well-being (ʿāfiyah).' It is one of the greatest du'as for protection in both this life and the Hereafter.",
},
{
  id: "morning_6",
  title: "Protection from the Four Evils",
  subtitle: "Seek Refuge from Yourself and Shayṭān",
  category: "Protection",
  arabic: `اَللّٰهُمَّ فَاطِرَ السَّمٰوَاتِ وَالْأَرْضِ ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ ، رَبَّ كُلِّ شَيْءٍ وَمَلِيْكَهُ ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِيْ سُوْءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ.`,
  translation: `O Allah, Creator of the heavens and the earth, Knower of the unseen and the seen, Lord and Sovereign of everything. I bear witness that there is no god worthy of worship except You. I seek Your protection from the evil of my own soul, from the evil of Shayṭān and his call to polytheism, and from committing evil against myself or bringing it upon another Muslim.`,
  repetitions: 1,
  shortBenefit: "Protection from four great evils.",
  benefit: "Abū Bakr رضي الله عنه asked the Prophet ﷺ for words to recite every morning and evening. The Prophet ﷺ taught him this du'a and instructed him to recite it in the morning, evening, and before sleeping as protection from the evil of the soul, Shayṭān, shirk, and harming oneself or others.",
},

{
  id: "morning_7",
  title: "Entrust All Your Affairs to Allah",
  subtitle: "Never Be Left to Yourself",
  category: "Reliance",
  arabic: `يَا حَيُّ يَا قَيُّوْمُ ، بِرَحْمَتِكَ أَسْتَغِيْثُ ، أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ ، وَلَا تَكِلْنِيْ إِلَىٰ نَفْسِيْ طَرْفَةَ عَيْنٍ.`,
  translation: `O Ever-Living, O Sustainer of all. By Your mercy I seek relief. Rectify all of my affairs and do not leave me to myself for even the blink of an eye.`,
  repetitions: 1,
  shortBenefit: "Allah takes care of your affairs.",
  benefit: "The Prophet ﷺ advised Fāṭimah رضي الله عنها never to neglect this supplication in the morning and evening. He himself would also recite 'Yā Ḥayyu Yā Qayyūm, bi-raḥmatika astaghīth' whenever something distressed him.",
},

{
  id: "morning_8",
  title: "Thank Allah for Every Blessing",
  subtitle: "Fulfil Your Daily Gratitude",
  category: "Gratitude",
  arabic: `اَللّٰهُمَّ مَا أَصْبَحَ بِيْ مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ ، فَمِنْكَ وَحْدَكَ لَا شَرِيْكَ لَكَ ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.`,
  translation: `O Allah, whatever blessing I or anyone among Your creation has received this morning is from You alone, without partner. To You belongs all praise and all thanks.`,
  repetitions: 1,
  shortBenefit: "Fulfils your gratitude for the day.",
  benefit: "The Prophet ﷺ said that whoever recites this in the morning has fulfilled the obligation of thanking Allah for that entire day, and whoever recites it in the evening has fulfilled the gratitude due for that night.",
},
{
  id: "morning_9",
  title: "Renew Your Faith",
  subtitle: "Begin the Day Upon Islam",
  category: "Faith",
  arabic: `أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ ، وَعَلَىٰ دِيْنِ نَبِيِّنَا مُحَمَّدٍ ، وَعَلَىٰ مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ حَنِيْفًا مُّسْلِمًا وَّمَا كَانَ مِنَ الْمُشْرِكِيْنَ.`,
  translation: `We have entered the morning upon the natural religion of Islam, the statement of pure faith, the religion of our Prophet Muhammad ﷺ, and upon the way of our father Ibrāhīm, who turned away from all falsehood, submitted to Allah, and was not among the polytheists.`,
  repetitions: 1,
  shortBenefit: "Renews your faith each morning.",
  benefit: "The Prophet ﷺ would recite this supplication in the morning, affirming Islam, sincerity, and the religion of Prophet Muhammad ﷺ and Prophet Ibrāhīm عليه السلام.",
},

{
  id: "morning_10",
  title: "Praise Allah at the Start of the Day",
  subtitle: "Begin with Praise and Tawḥīd",
  category: "Praise",
  arabic: `أَصْبَحْتُ أُثْنِيْ عَلَيْكَ حَمْدًا ، وَأَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ.`,
  translation: `I have entered the morning praising You, and I bear witness that there is no god worthy of worship except Allah.`,
  repetitions: 3,
  shortBenefit: "Begin the day praising Allah.",
  benefit: "The Prophet ﷺ instructed that this dhikr be recited three times every morning and every evening, beginning and ending the day with praise and the testimony of faith.",
},

{
  id: "morning_11",
  title: "Ask Allah for a Good Day",
  subtitle: "Seek Good and Protection",
  category: "Protection",
  arabic: `أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ وَالْحَمْدُ لِلّٰهِ ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيْرٌ ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.`,
  translation: `We have entered the morning, and all sovereignty belongs to Allah. All praise belongs to Allah. There is no god worthy of worship except Allah alone, without partner. To Him belongs the dominion and all praise, and He is over all things Powerful. My Lord, I ask You for the good of this day and the good that follows it. I seek Your protection from the evil of this day and the evil that follows it. My Lord, I seek Your protection from laziness, the misery of old age, the punishment of the Fire, and the punishment of the grave.`,
  repetitions: 1,
  shortBenefit: "Ask Allah for a blessed day.",
  benefit: "This was among the morning supplications regularly recited by the Prophet ﷺ. It seeks every good for the day while asking Allah's protection from evil, laziness, Hellfire, and the punishment of the grave.",
},

{
  id: "morning_12",
  title: "Ask Allah to Bless Your Day",
  subtitle: "Victory, Light and Guidance",
  category: "Blessings",
  arabic: `أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ خَيْرَ هٰذَا الْيَوْمِ ، فَتْحَهُ وَنَصْرَهُ وَنُوْرَهُ وَبَرَكَتَهُ وَهُدَاهُ ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْهِ وَشَرِّ مَا بَعْدَهُ.`,
  translation: `We have entered the morning and all sovereignty belongs to Allah, Lord of the worlds. O Allah, I ask You for the goodness of this day: its victory, its help, its light, its blessings and its guidance. I seek Your protection from the evil within it and the evil that follows it.`,
  repetitions: 1,
  shortBenefit: "Ask for victory and blessings.",
  benefit: "The Prophet ﷺ instructed the believers to recite this every morning and evening, asking Allah to fill the day with victory, guidance, light, blessings, and protection from every evil.",
},
{
  id: "morning_13",
  title: "Seek Freedom From the Hell-Fire",
  subtitle: "Witness Your Faith Before Allah",
  category: "Protection",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيْعَ خَلْقِكَ ، أَنَّكَ أَنْتَ اللّٰهُ لَا إِلٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيْكَ لَكَ ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ.`,
  translation: `O Allah, I have entered the morning, and I call upon You, the bearers of Your Throne, Your angels, and all of Your creation to bear witness that You are Allah. There is no god worthy of worship except You Alone, without any partner, and that Muhammad ﷺ is Your servant and Messenger.`,
  repetitions: 4,
  shortBenefit: "Seek freedom from the Hell-Fire.",
  benefit: "The Prophet ﷺ taught that whoever recites this in the morning and evening has their portion of freedom from the Hell-Fire increased with each repetition, until Allah frees them completely when it is said four times.",
},

{
  id: "morning_14",
  title: "Begin the Day Through Allah",
  subtitle: "Depend Upon Allah Alone",
  category: "Faith",
  arabic: `اَللّٰهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوْتُ وَإِلَيْكَ النُّشُوْرُ.`,
  translation: `O Allah, by You we have entered the morning and by You we enter the evening. By You, we live and by You, we die, and to You is the resurrection.`,
  repetitions: 1,
  shortBenefit: "Remember that all life is from Allah.",
  benefit: "The Prophet ﷺ would say this upon entering the morning, acknowledging that every blessing, every moment of life, and the return to Allah are all through His power and decree.",
},

{
  id: "morning_15",
  title: "Ask Allah for Well-Being",
  subtitle: "Protection for Your Body and Faith",
  category: "Protection",
  arabic: `اَللّٰهُمَّ عَافِنِيْ فِيْ بَدَنِيْ ، اَللّٰهُمَّ عَافِنِيْ فِيْ سَمْعِيْ ، اَللّٰهُمَّ عَافِنِيْ فِيْ بَصَرِيْ ، لَا إِلٰهَ إِلَّا أَنْتَ ، اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ.`,
  translation: `O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god worthy of worship except You. O Allah, I seek Your protection from disbelief and poverty, and I seek Your protection from the punishment of the grave. There is no god worthy of worship except You.`,
  repetitions: 3,
  shortBenefit: "Ask Allah for health and protection.",
  benefit: "The Prophet ﷺ taught this supplication to seek protection for one's body, hearing, sight, faith, wealth, and from the punishment of the grave. It was recited three times in the morning and evening by those who followed his Sunnah.",
},{
  id: "morning_13",
  title: "Seek Freedom From the Hell-Fire",
  subtitle: "Witness Your Faith Before Allah",
  category: "Protection",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيْعَ خَلْقِكَ ، أَنَّكَ أَنْتَ اللّٰهُ لَا إِلٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيْكَ لَكَ ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ.`,
  translation: `O Allah, I have entered the morning, and I call upon You, the bearers of Your Throne, Your angels, and all of Your creation to bear witness that You are Allah. There is no god worthy of worship except You Alone, without any partner, and that Muhammad ﷺ is Your servant and Messenger.`,
  repetitions: 4,
  shortBenefit: "Seek freedom from the Hell-Fire.",
  benefit: "The Prophet ﷺ taught that whoever recites this in the morning and evening has their portion of freedom from the Hell-Fire increased with each repetition, until Allah frees them completely when it is said four times.",
},

{
  id: "morning_14",
  title: "Begin the Day Through Allah",
  subtitle: "Depend Upon Allah Alone",
  category: "Faith",
  arabic: `اَللّٰهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوْتُ وَإِلَيْكَ النُّشُوْرُ.`,
  translation: `O Allah, by You we have entered the morning and by You we enter the evening. By You, we live and by You, we die, and to You is the resurrection.`,
  repetitions: 1,
  shortBenefit: "Remember that all life is from Allah.",
  benefit: "The Prophet ﷺ would say this upon entering the morning, acknowledging that every blessing, every moment of life, and the return to Allah are all through His power and decree.",
},

{
  id: "morning_15",
  title: "Ask Allah for Well-Being",
  subtitle: "Protection for Your Body and Faith",
  category: "Protection",
  arabic: `اَللّٰهُمَّ عَافِنِيْ فِيْ بَدَنِيْ ، اَللّٰهُمَّ عَافِنِيْ فِيْ سَمْعِيْ ، اَللّٰهُمَّ عَافِنِيْ فِيْ بَصَرِيْ ، لَا إِلٰهَ إِلَّا أَنْتَ ، اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ.`,
  translation: `O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god worthy of worship except You. O Allah, I seek Your protection from disbelief and poverty, and I seek Your protection from the punishment of the grave. There is no god worthy of worship except You.`,
  repetitions: 3,
  shortBenefit: "Ask Allah for health and protection.",
  benefit: "The Prophet ﷺ taught this supplication to seek protection for one's body, hearing, sight, faith, wealth, and from the punishment of the grave. It was recited three times in the morning and evening by those who followed his Sunnah.",
},
{
  id: "morning_16",
  title: "Allah Will Suffice You in Everything",
  subtitle: "Place Your Trust in Allah Alone",
  category: "Reliance",
  arabic: `حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ ، عَلَيْهِ تَوَكَّلْتُ ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيْمِ.`,
  translation: `Allah is sufficient for me. There is no god worthy of worship except Him. I have placed my trust in Him alone, and He is the Lord of the Magnificent Throne.`,
  repetitions: 7,
  shortBenefit: "Rely upon Allah in every matter.",
  benefit: "The Prophet ﷺ taught that whoever recites this seven times in the morning and evening, Allah will suffice them in everything that concerns them in this world and the Hereafter.",
},

{
  id: "morning_17",
  title: "Be Pleased With Allah",
  subtitle: "Contentment With Islam and the Prophet ﷺ",
  category: "Faith",
  arabic: `رَضِيْتُ بِاللّٰهِ رَبًّا ، وَبِالْإِسْلَامِ دِيْنًا ، وَبِمُحَمَّدٍ نَّبِيًّا.`,
  translation: `I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.`,
  repetitions: 3,
  shortBenefit: "Strengthen your contentment with faith.",
  benefit: "The Prophet ﷺ promised that whoever says this three times in the morning and evening, Allah will make them pleased on the Day of Judgement. It is a declaration of acceptance and love for Allah, Islam, and the Messenger ﷺ.",
},

{
  id: "morning_18",
  title: "Protect Yourself From All Harm",
  subtitle: "Seek Allah’s Protection",
  category: "Protection",
  arabic: `بِسْمِ اللّٰهِ الَّذِيْ لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ ، وَهُوَ السَّمِيْعُ الْعَلِيْمُ.`,
  translation: `In the Name of Allah, with whose Name nothing can harm in the earth nor in the sky. He is the All-Hearing, the All-Knowing.`,
  repetitions: 3,
  shortBenefit: "Seek protection from sudden harm.",
  benefit: "The Prophet ﷺ taught that whoever says this three times every morning and evening will be protected from harm by Allah’s permission.",
},

{
  id: "morning_19",
  title: "Have Your Sins Forgiven",
  subtitle: "Glorify Allah and Earn Great Reward",
  category: "Remembrance",
  arabic: `سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ.`,
  translation: `Allah is free from all imperfection, and all praise is due to Him.`,
  repetitions: 100,
  shortBenefit: "Earn forgiveness and immense reward.",
  benefit: "The Prophet ﷺ taught that whoever says this one hundred times in the morning and evening will have their sins forgiven, even if they are like the foam of the sea, and no one will surpass them on the Day of Judgement except one who says the same or more.",
},
{
  id: "morning_20",
  title: "Earn an Unparalleled Reward",
  subtitle: "Affirm the Oneness of Allah",
  category: "Tawḥīd",
  arabic: `لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيْرٌ.`,
  translation: `There is no god worthy of worship except Allah. He is Alone and has no partner. To Him Alone belongs all sovereignty and all praise, and He is over all things All-Powerful.`,
  repetitions: 100,
  shortBenefit: "Earn immense rewards through Tawḥīd.",
  benefit: "The Prophet ﷺ taught that whoever recites this one hundred times in a day receives the reward of freeing ten slaves, one hundred good deeds are recorded, one hundred sins are erased, and they are protected from Shayṭān until the evening.",
},

{
  id: "morning_21",
  title: "Tasbīḥ, Taḥmīd and Takbīr",
  subtitle: "Glorify, Praise and Magnify Allah",
  category: "Remembrance",
  arabic: `سُبْحَانَ اللّٰهِ ، اَلْحَمْدُ لِلّٰهِ ، اَللّٰهُ أَكْبَرُ.`,
  translation: `Allah is free from all imperfection. All praise belongs to Allah. Allah is the Greatest.`,
  repetitions: 100,
  shortBenefit: "Fill your morning with powerful remembrance.",
  benefit: "The Prophet ﷺ taught the virtue of saying these phrases before sunrise and sunset, with each remembrance carrying a reward greater than great worldly possessions given in the path of Allah.",
},

{
  id: "morning_22",
  title: "Receive the Intercession of the Prophet ﷺ",
  subtitle: "Send Ṣalāh Upon the Messenger ﷺ",
  category: "Salawāt",
  arabic: `اَللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَّعَلَىٰ اٰلِ مُحَمَّدٍ ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيْمَ وَعَلَىٰ اٰلِ إِبْرَاهِيْمَ ، إِنَّكَ حَمِيْدٌ مَّجِيْدٌ ، اَللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَّعَلَىٰ اٰلِ مُحَمَّدٍ ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيْمَ وَعَلَىٰ اٰلِ إِبْرَاهِيْمَ ، إِنَّكَ حَمِيْدٌ مَّجِيْدٌ.`,
  translation: `O Allah, honour and have mercy upon Muhammad and the family of Muhammad as You honoured and showed mercy to Ibrāhīm and the family of Ibrāhīm. Indeed, You are the Most Praiseworthy, the Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrāhīm and the family of Ibrāhīm. Indeed, You are the Most Praiseworthy, the Most Glorious.`,
  repetitions: 10,
  shortBenefit: "Seek the Prophet's ﷺ intercession.",
  benefit: "The Prophet ﷺ taught that whoever sends ṣalāh upon him ten times in the morning and ten times in the evening will receive his intercession on the Day of Judgement.",
},

{
  id: "morning_23",
  title: "Seek Forgiveness and Repent",
  subtitle: "Return to Allah Through Istighfār",
  category: "Repentance",
  arabic: `أَسْتَغْفِرُ اللّٰهَ وَأَتُوْبُ إِلَيْهِ.`,
  translation: `I seek Allah’s forgiveness and turn to Him in repentance.`,
  repetitions: 100,
  shortBenefit: "Follow the Sunnah of seeking forgiveness.",
  benefit: "The Prophet ﷺ would seek Allah’s forgiveness one hundred times a day, teaching believers the importance of constant repentance and returning to Allah.",
},

{
  id: "morning_24",
  title: "Four Phrases That Outweigh All Dhikr",
  subtitle: "A Great Remembrance With Immense Reward",
  category: "Remembrance",
  arabic: `سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ ، عَدَدَ خَلْقِهِ ، وَرِضَا نَفْسِهِ ، وَزِنَةَ عَرْشِهِ ، وَمِدَادَ كَلِمَاتِهِ.`,
  translation: `Allah is free from imperfection and all praise is due to Him, as numerous as the number of His creation, as much as His pleasure, as heavy as the weight of His Throne, and as endless as the ink of His words.`,
  repetitions: 3,
  shortBenefit: "Earn the reward of countless remembrance.",
  benefit: "The Prophet ﷺ taught that these words, said three times, carry a reward that outweighs the amount of remembrance someone may perform throughout the day.",
},
    ],
  },

  evening: {
    id: "evening",
    name: "Evening Adhkar",
    items: [
     {
  id: "evening_1",
  title: "Ayat al-Kursī: The Greatest Protection",
  subtitle: "Seek Allah’s Protection Until Morning",
  category: "Protection",
  arabic: `أَعُوْذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ.
اَللّٰهُ لَآ إِلٰهَ إِلَّا هُوَ الْحَىُّ الْقَيُّوْمُ ، لَا تَأْخُذُهُۥ سِنَةٌ وَّلَا نَوْمٌ ، لَهُۥ مَا فِى السَّمٰـوٰتِ وَمَا فِى الْأَرْضِ ، مَنْ ذَا الَّذِىْ يَشْفَعُ عِنْدَهُۥ إِلَّا بِإِذْنِهِۦ ، يَعْلَمُ مَا بَيْنَ أَيْدِيْهِمْ وَمَا خَلْفَهُمْ ، وَلَا يُحِيْطُوْنَ بِشَىْءٍ مِّنْ عِلْمِهِٓ إِلَّا بِمَا شَآءَ ، وَسِعَ كُرْسِيُّهُ السَّمٰـوٰتِ وَالْأَرْضَ، وَلَا يَئُوْدُهُۥ حِفْظُهُمَا ، وَهُوَ الْعَلِىُّ الْعَظِيْمُ.`,
  translation: `I seek the protection of Allah from the rejected Shayṭān. Allah, there is no god worthy of worship but He, the Ever-Living, the Sustainer of all. Neither drowsiness overtakes Him nor sleep. To Him Alone belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except with His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursī extends over the heavens and the earth, and their preservation does not tire Him. And He is the Most High, the Magnificent. (2:255)`,
  repetitions: 1,
  shortBenefit: "Seek protection until the morning.",
  benefit: "Ayat al-Kursī is among the greatest verses of the Qur’an. The Prophet ﷺ taught that reciting it in the evening is a means of protection from harm and evil until morning.",
},

{
  id: "evening_2",
  title: "Three Quls: Protection From All Evil",
  subtitle: "Seek Allah’s Refuge Through the Qur’an",
  category: "Protection",
  arabic: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ.
قُلْ هُوَ اللّٰهُ أَحَدٌ ، اَللّٰهُ الصَّمَدُ ، لَمْ يَلِدْ وَلَمْ يُوْلَدْ ، وَلَمْ يَكُنْ لَّهُۥ كُفُوًا أَحَدٌ.

بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ.
قُلْ أَعُوْذُ بِرَبِّ الْفَلَقِ ، مِنْ شَرِّ مَا خَلَقَ ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.

بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ.
قُلْ أَعُوْذُ بِرَبِّ النَّاسِ ، مَلِكِ النَّاسِ ، إِلٰهِ النَّاسِ ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ، اَلَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِ ، مِنَ الْجِنَّةِ وَالنَّاسِ.`,
  translation: `In the name of Allah, the All-Merciful, the Very Merciful.
Say, He is Allah, the One, the Self-Sufficient Master, Who has not given birth and was not born, and to Whom no one is equal. (112)

In the name of Allah, the All-Merciful, the Very Merciful.
Say, I seek protection of the Lord of the daybreak, from the evil of what He has created, and from the evil of the darkening night when it settles, and from the evil of the blowers in knots, and from the evil of the envier when he envies. (113)

In the name of Allah, the All-Merciful, the Very Merciful.
Say, I seek protection of the Lord of mankind, the King of mankind, the God of mankind, from the evil of the whisperer who withdraws, who whispers in the hearts of mankind, whether they be Jinn or people. (114)`,
  repetitions: 3,
  shortBenefit: "Protection from every type of evil.",
  benefit: "The Prophet ﷺ instructed that reciting Sūrah al-Ikhlāṣ, al-Falaq, and al-Nās three times in the morning and evening is sufficient as protection from all harm.",
},
{
  id: "evening_3",
  title: "Sayyid al-Istighfār: The Best Way of Seeking Forgiveness",
  subtitle: "Seek Allah’s Forgiveness With Certainty",
  category: "Repentance",
  arabic: `اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ لَكَ بِذَنْبِيْ ، فَاغْفِرْ لِيْ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ.`,
  translation: `O Allah, You are my Lord. There is no god worthy of worship except You. You have created me, and I am Your servant. I remain upon Your covenant and promise as much as I am able. I seek Your protection from the evil of what I have done. I acknowledge Your blessings upon me, and I acknowledge my sins. So forgive me, for none forgives sins except You.`,
  repetitions: 1,
  shortBenefit: "The greatest supplication for forgiveness.",
  benefit: "The Prophet ﷺ described this as the best way of seeking forgiveness. Whoever says it at night with firm belief and dies before morning will be among the people of Paradise.",
},

{
  id: "evening_4",
  title: "Protect Yourself From Anxiety, Laziness and Debt",
  subtitle: "Seek Relief From Burdens of the Heart",
  category: "Protection",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ ، وَأَعُوْذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوْذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ ، وَأَعُوْذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.`,
  translation: `O Allah, I seek Your protection from anxiety and grief. I seek Your protection from inability and laziness. I seek Your protection from cowardice and miserliness, and I seek Your protection from being overcome by debt and being overpowered by men.`,
  repetitions: 1,
  shortBenefit: "Seek relief from worries and hardships.",
  benefit: "The Prophet ﷺ taught this supplication to remove worries and help settle debts. Abū Umāmah (raḍiy Allāhu ʿanhu) said that after reciting it, Allah removed his worries and settled his debt.",
},

{
  id: "evening_5",
  title: "Attain Well-Being in This World and the Hereafter",
  subtitle: "Ask Allah for Complete Protection",
  category: "Well-Being",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِيْ دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ ، اَللّٰهُمَّ اسْتُرْ عَوْرَاتِيْ وَآمِنْ رَّوْعَاتِيْ ، اَللّٰهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ ، وَمِنْ خَلْفِيْ ، وَعَنْ يَّمِيْنِيْ ، وَعَنْ شِمَالِيْ ، وَمِنْ فَوْقِيْ ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ.`,
  translation: `O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for forgiveness and well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from in front of me, behind me, from my right, from my left, and from above me. I seek protection in Your Greatness from being unexpectedly destroyed from beneath me.`,
  repetitions: 1,
  shortBenefit: "Ask Allah for complete safety and well-being.",
  benefit: "The Prophet ﷺ never abandoned this supplication in the morning and evening. It asks Allah for protection in one's faith, worldly affairs, family, wealth, and from every direction of harm.",
},
{
  id: "evening_6",
  title: "Protect Yourself From the Four Evils",
  subtitle: "Seek Allah’s Protection From Hidden Harm",
  category: "Protection",
  arabic: `اَللّٰهُمَّ فَاطِرَ السَّمٰوَاتِ وَالْأَرْضِ ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ ، رَبَّ كُلِّ شَيْءٍ وَّمَلِيْكَهُ ، أَشْهَدُ أَنْ لَّا إِلٰهَ إِلَّا أَنْتَ ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِيْ سُوْءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ.`,
  translation: `O Allah, Creator of the heavens and the earth, Knower of the unseen and the seen, Lord and Sovereign of everything. I bear witness that there is no god worthy of worship except You. I seek Your protection from the evil of my own self, from the evil of Shayṭān and his call to shirk, and from committing evil against myself or bringing harm upon another Muslim.`,
  repetitions: 1,
  shortBenefit: "Seek protection from the evils within and around you.",
  benefit: "The Prophet ﷺ taught this supplication to Abū Bakr (raḍiy Allāhu ʿanhu) to say in the morning and evening. It seeks Allah’s protection from the evil of the soul, Shayṭān, shirk, and harming oneself or others.",
},

{
  id: "evening_7",
  title: "Entrust All Your Matters to Allah",
  subtitle: "Rely Upon Allah’s Mercy and Care",
  category: "Reliance",
  arabic: `يَا حَيُّ يَا قَيُّوْمُ ، بِرَحْمَتِكَ أَسْتَغِيْثُ ، أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ ، وَلَا تَكِلْنِيْ إِلَىٰ نَفْسِيْ طَرْفَةَ عَيْنٍ.`,
  translation: `O Ever-Living, O Sustainer of all, I seek assistance through Your mercy. Rectify all of my affairs and do not entrust me to myself even for the blink of an eye.`,
  repetitions: 1,
  shortBenefit: "Ask Allah to take care of all your affairs.",
  benefit: "The Prophet ﷺ advised Fāṭimah (raḍiy Allāhu ʿanhā) to say this in the morning and evening. It is a reminder that every matter is in need of Allah’s help and mercy.",
},

{
  id: "evening_8",
  title: "Fulfil Your Obligation to Thank Allah",
  subtitle: "Recognize Every Blessing Comes From Him",
  category: "Gratitude",
  arabic: `اَللّٰهُمَّ مَا أَمْسَىٰ بِيْ مِنْ نِّعْمَةٍ أَوْ بِأَحَدٍ مِّنْ خَلْقِكَ ، فَمِنْكَ وَحْدَكَ لَا شَرِيْكَ لَكَ ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.`,
  translation: `O Allah, whatever blessing I or any of Your creation has received this evening is from You Alone. You have no partner. To You belongs all praise and all thanks.`,
  repetitions: 1,
  shortBenefit: "Complete your gratitude to Allah for the day.",
  benefit: "The Prophet ﷺ taught that whoever says this in the evening has fulfilled their obligation of thanking Allah for that night.",
},
{
  id: "evening_9",
  title: "Renew Your Iman (Faith) in the Evening",
  subtitle: "End Your Day Firmly Upon Islam",
  category: "Faith",
  arabic: `أَمْسَيْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ ، وَعَلَىٰ دِيْنِ نَبِيِّنَا مُحَمَّدٍ ، وَعَلَىٰ مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ حَنِيْفًا مُّسْلِمًا وَّمَا كَانَ مِنَ الْمُشْرِكِيْنَ.`,
  translation: `We have entered the evening upon the natural religion of Islam, the statement of pure faith, the religion of our Prophet Muhammad ﷺ, and upon the way of our father Ibrāhīm, who turned away from all that is false, having surrendered to Allah, and he was not of the polytheists.`,
  repetitions: 1,
  shortBenefit: "Renew your faith and devotion to Allah.",
  benefit: "The Prophet ﷺ would say this in the morning and evening, reminding the believer to remain firm upon Islam, the Shahādah, and the way of Prophet Ibrāhīm عليه السلام.",
},

{
  id: "evening_10",
  title: "Begin the Evening by Praising Allah",
  subtitle: "Enter the Evening With Gratitude",
  category: "Gratitude",
  arabic: `أَمْسَيْتُ أُثْنِيْ عَلَيْكَ حَمْدًا ، وَأَشْهَدُ أَنْ لَّا إِلٰهَ إِلَّا اللّٰهُ.`,
  translation: `I have entered the evening praising You, and I bear witness that there is no god worthy of worship but Allah.`,
  repetitions: 3,
  shortBenefit: "Begin your evening with praise and testimony of faith.",
  benefit: "The Messenger of Allah ﷺ instructed that this remembrance be said in the morning and evening three times, filling the heart with praise of Allah and affirming His Oneness.",
},

{
  id: "evening_11",
  title: "Ask Allah for a Good Evening",
  subtitle: "Seek Goodness and Protection Throughout the Night",
  category: "Protection",
  arabic: `أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ وَالْحَمْدُ لِلّٰهِ ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيْرٌ ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.`,
  translation: `We have entered the evening and at this very time the whole kingdom belongs to Allah. All praise is due to Allah. There is no god worthy of worship except Allah, the One; He has no partner with Him. The entire kingdom belongs solely to Him, to Him is all praise due, and He is All-Powerful over everything. My Lord, I ask You for the good that is in this night and the good that follows it, and I seek Your protection from the evil that is in this night and from the evil that follows it. My Lord, I seek Your protection from laziness and the misery of old age. My Lord, I seek Your protection from the torment of the Hell-fire and the punishment of the grave.`,
  repetitions: 1,
  shortBenefit: "Seek Allah's goodness and protection throughout the night.",
  benefit: "The Messenger of Allah ﷺ would say this when entering the evening, asking Allah for the blessings of the night, protection from harm, and safety from the punishment of the Fire and the grave.",
},

{
  id: "evening_12",
  title: "Ask Allah to Bless Your Evening",
  subtitle: "Seek Victory, Light and Guidance",
  category: "Blessings",
  arabic: `أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ خَيْرَ هٰذِهِ اللَّيْلَةِ ، فَتْحَهَا وَنَصْرَهَا وَنُوْرَهَا وَبَرَكَتَهَا وَهُدَاهَا ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْهَا وَشَرِّ مَا بَعْدَهَا.`,
  translation: `We have entered the evening and at this very time the whole kingdom belongs to Allah, Lord of the worlds. O Allah, I ask You for the goodness of this night: its victory, its help, its light, its blessings and its guidance. I seek Your protection from the evil that is in it and from the evil that follows it.`,
  repetitions: 1,
  shortBenefit: "Ask Allah to fill your night with goodness and guidance.",
  benefit: "The Prophet ﷺ taught this supplication for the morning and evening, asking Allah for openings, victory, light, blessings and guidance while seeking protection from harm.",
},
{
  id: "evening_13",
  title: "Get Yourself Freed From the Hell-Fire",
  subtitle: "Strengthen Your Testimony of Faith",
  category: "Protection",
  arabic: `اَللّٰهُمَّ إِنِّيْ أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ ، وَمَلَائِكَتَكَ وَجَمِيْعَ خَلْقِكَ ، أَنَّكَ أَنْتَ اللّٰهُ لَا إِلٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيْكَ لَكَ ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ.`,
  translation: `O Allah, I have entered the evening, and I call upon You, the bearers of Your Throne, Your angels and all creation, to bear witness that surely You are Allah. There is no god worthy of worship except You Alone. You have no partners, and that Muhammad ﷺ is Your servant and Your Messenger.`,
  repetitions: 4,
  shortBenefit: "A means of being freed from the Hell-fire.",
  benefit: "The Prophet ﷺ taught that whoever says this in the morning or evening, Allah frees a portion of them from the Hell-fire. Repeating it four times is mentioned as a means of being fully freed from it.",
},

{
  id: "evening_14",
  title: "Express Your Submission",
  subtitle: "Place Your Dependence Upon Allah",
  category: "Reliance",
  arabic: `اَللّٰهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوْتُ وَإِلَيْكَ الْمَصِيْرُ.`,
  translation: `O Allah, by You we have entered the evening and by You we enter upon the morning. By You, we live and we die, and to You is the return.`,
  repetitions: 1,
  shortBenefit: "Declare your complete dependence upon Allah.",
  benefit: "The Prophet ﷺ would say this when entering the evening, acknowledging that our life, death, and return are all in Allah’s hands.",
},

{
  id: "evening_15",
  title: "Ask Allah for Good Health and Protection",
  subtitle: "Seek Well-Being for Your Body and Faith",
  category: "Well-Being",
  arabic: `اَللّٰهُمَّ عَافِنِيْ فِيْ بَدَنِيْ ، اَللّٰهُمَّ عَافِنِيْ فِيْ سَمْعِيْ ، اَللّٰهُمَّ عَافِنِيْ فِيْ بَصَرِيْ ، لَا إِلٰهَ إِلَّا أَنْتَ ، اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ.`,
  translation: `O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god worthy of worship except You. O Allah, I seek Your protection from disbelief and poverty and I seek Your protection from the punishment of the grave. There is no god worthy of worship except You.`,
  repetitions: 3,
  shortBenefit: "Ask Allah for health, protection, and safety.",
  benefit: "Abū Bakrah (raḍiy Allāhu ʿanhu) narrated that he heard the Prophet ﷺ supplicate with these words in the morning and evening, and he loved to follow his Sunnah.",
},

{
  id: "evening_16",
  title: "Allah Will Suffice You in Everything",
  subtitle: "Place Your Trust Completely in Allah",
  category: "Reliance",
  arabic: `حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ ، عَلَيْهِ تَوَكَّلْتُ ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيْمِ.`,
  translation: `Allah is sufficient for me. There is no god worthy of worship except Him. I have placed my trust in Him only and He is the Lord of the Magnificent Throne.`,
  repetitions: 7,
  shortBenefit: "Entrust all your affairs to Allah.",
  benefit: "It is narrated that whoever says this seven times in the morning and evening, Allah will suffice him in everything that concerns him in this world and the next.",
},
{
  id: "evening_17",
  title: "Have the Prophet ﷺ Hold Your Hand and Enter You Into Paradise",
  subtitle: "Be Pleased With Allah as Your Lord, Islam as Your Religion, and Muhammad ﷺ as Your Prophet",
  category: "Faith",
  arabic: `رَضِيْتُ بِاللّٰهِ رَبًّا ، وَبِالْإِسْلَامِ دِيْنًا ، وَبِمُحَمَّدٍ نَّبِيًّا.`,
  translation: `I am pleased with Allah as my Lord, with Islam as my religion and with Muhammad ﷺ as my Prophet.`,
  repetitions: 3,
  shortBenefit: "A declaration of complete contentment with Allah, Islam, and the Prophet ﷺ.",
  benefit: "The Prophet ﷺ promised that whoever says this three times in the morning and evening will be granted Allah’s pleasure on the Day of Judgement. It is also narrated that whoever says it will have the Prophet ﷺ take hold of his hand and enter him into Paradise.",
},

{
  id: "evening_18",
  title: "Protect Yourself From All Harm",
  subtitle: "Seek Allah’s Protection From Sudden Calamities",
  category: "Protection",
  arabic: `بِسْمِ اللّٰهِ الَّذِيْ لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ ، وَهُوَ السَّمِيْعُ الْعَلِيْمُ.`,
  translation: `In the Name of Allah, with whose Name nothing can harm in the earth nor in the sky. He is the All-Hearing and All-Knowing.`,
  repetitions: 3,
  shortBenefit: "A protection from sudden harm and calamities.",
  benefit: "The Prophet ﷺ taught that whoever says this three times in the morning and evening will not be harmed by anything. It is a powerful remembrance seeking Allah’s protection through His Name.",
},

{
  id: "evening_19",
  title: "Have Your Sins Forgiven",
  subtitle: "Glorify Allah and Earn Great Reward",
  category: "Forgiveness",
  arabic: `سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ.`,
  translation: `Allah is free from imperfection, and all praise is due to Him.`,
  repetitions: 100,
  shortBenefit: "A simple dhikr with immense reward and forgiveness.",
  benefit: "The Prophet ﷺ taught that whoever says this 100 times in the morning and evening will not be surpassed on the Day of Judgement except by someone who says the same or more. Whoever says it 100 times a day will have their sins forgiven, even if they are like the foam of the sea.",
},
{
  id: "evening_20",
  title: "Earn an Unparalleled Reward",
  subtitle: "Declare the Oneness of Allah and Earn Great Virtue",
  category: "Remembrance",
  arabic: `لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيْرٌ.`,
  translation: `There is no god worthy of worship except Allah. He is Alone and He has no partner whatsoever. To Him Alone belong all sovereignty and all praise. He is over all things All-Powerful.`,
  repetitions: 100,
  shortBenefit: "A powerful declaration of Tawḥīd with immense reward.",
  benefit: "The Prophet ﷺ taught that whoever recites this 100 times in a day receives the reward of freeing 10 slaves, 100 good deeds are written for them, 100 sins are erased, and they are protected from Shayṭān until evening.",
},

{
  id: "evening_21",
  title: "Tasbīḥ, Taḥmīd and Takbīr",
  subtitle: "Glorify, Praise and Magnify Allah",
  category: "Remembrance",
  arabic: `سُبْحَانَ اللّٰهِ ، اَلْحَمْدُ لِلّٰهِ ، اَللّٰهُ أَكْبَرُ.`,
  translation: `Allah is free from imperfection. All praise be to Allah. Allah is the Greatest.`,
  repetitions: 100,
  shortBenefit: "Simple words of remembrance with extraordinary reward.",
  benefit: "The Prophet ﷺ taught that saying these words before sunrise and sunset carries rewards greater than immense worldly possessions, including greater than 100 camels, 100 horses, and freeing 100 slaves.",
},

{
  id: "evening_22",
  title: "Receive the Intercession of the Prophet ﷺ",
  subtitle: "Send Ṣalāh Upon the Prophet ﷺ",
  category: "Sending Blessings",
  arabic: `اَللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَّعَلَىٰ اٰلِ مُحَمَّدٍ ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيْمَ وَعَلَىٰ اٰلِ إِبْرَاهِيْمَ ، إِنَّكَ حَمِيْدٌ مَّجِيْدٌ ، اَللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَّعَلَىٰ اٰلِ مُحَمَّدٍ ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيْمَ وَعَلَىٰ اٰلِ إِبْرَاهِيْمَ ، إِنَّكَ حَمِيْدٌ مَّجِيْدٌ`,
  translation: `O Allah, honour and have mercy upon Muhammad and the family of Muhammad as You have honoured and had mercy upon Ibrāhīm and the family of Ibrāhīm. Indeed, You are the Most Praiseworthy, the Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrāhīm and the family of Ibrāhīm. Indeed, You are the Most Praiseworthy, the Most Glorious.`,
  repetitions: 10,
  shortBenefit: "A means of receiving the Prophet’s ﷺ intercession.",
  benefit: "The Prophet ﷺ taught that whoever sends ṣalāh upon him 10 times in the morning and 10 times in the evening will receive his intercession on the Day of Judgement.",
},

{
  id: "evening_23",
  title: "Protect Yourself From All Evil",
  subtitle: "Seek Refuge in Allah’s Perfect Words",
  category: "Protection",
  arabic: `أَعُوْذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.`,
  translation: `I seek protection in Allah’s perfect words from the evil of whatever He has created.`,
  repetitions: 3,
  shortBenefit: "Protection from harm during the night.",
  benefit: "The Prophet ﷺ taught that whoever recites this three times in the evening will not be harmed by poisonous stings during that night.",
},
    ],
  },
};

export const ISTIGHFAR_QUOTES = [
  "Seek forgiveness often, for Allah loves those who constantly return to Him.",
  "The Prophet ﷺ sought Allah's forgiveness more than seventy times each day.",
  "The Prophet ﷺ sought Allah's forgiveness one hundred times every day.",
  "Whoever constantly seeks Allah's forgiveness, Allah will make for him a way out of every hardship.",
  "Istighfar wipes away sins, no matter how many times you return sincerely.",
  "Every 'Astaghfirullah' is another step back toward Allah.",
  "No sin is greater than Allah's mercy.",
  "The doors of repentance remain open until the soul reaches the throat.",
  "Allah loves those who repent and purify themselves.",
  "Never let Shayṭān convince you that you've sinned too much to return to Allah.",
  "A heart softened by istighfar is a heart close to Allah.",
  "The best of sinners are those who constantly repent.",
];

export function getDailyIstighfarQuote(): string {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  return ISTIGHFAR_QUOTES[dayOfYear % ISTIGHFAR_QUOTES.length];
}