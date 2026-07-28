import { db } from "./dexie";
import { DEFAULT_WEALTH_PROFILE } from "@/repositories/wealthRepository";
import { logActivity } from "@/services/xpService";
import { addDays, today } from "@/utils/date";
import { PRAYER_NAMES, type PrayerName, type QuranReadingLog } from "@/types/modules";

const SEED_FLAG_ID = "seed_modules_v1";

/** Guards against the concurrent calls made by app bootstrap and StrictMode. */
let initialization: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  initialization ??= runInitialization();
  return initialization;
}

async function runInitialization() {
  const existingChar = await db.character.get("user");

  // Only run if the database has not been initialized yet
  if (!existingChar) {
    // 1. Initial Character Profile
    await db.character.put({
      id: "user",
      level: 1,
      currentXp: 0,
      nextLevelXp: 1000,
      currentStreak: 0,
      lastWorkoutDate: null,
      attributes: {
        STR: 10,
        END: 10,
        VOL: 10,
        CON: 10,
      },
    });

    // 2. Default App Settings
    await db.settings.put({
      id: "app_settings",
      defaultRestSeconds: 90,
      soundEnabled: true,
      vibrationEnabled: true,
    });

    // 3. Default Workout Plans (Preset templates using valid exercise IDs)
    await db.plans.bulkPut([
      {
        id: "plan_mon",
        title: "Chest & Triceps Focus",
        dayOfWeek: 1,
        targetMuscles: ["Chest", "Triceps"],
        exercises: [
          { exerciseId: "ex_dumbbell_bench", exerciseName: "Dumbbell Bench Press", targetSets: 4, targetReps: 8 },
          { exerciseId: "ex_shoulder_press", exerciseName: "Shoulder Press", targetSets: 3, targetReps: 10 },
        ],
      },
      {
        id: "plan_tue",
        title: "Back & Biceps Focus",
        dayOfWeek: 2,
        targetMuscles: ["Back", "Biceps"],
        exercises: [
          { exerciseId: "ex_lat_pulldown", exerciseName: "Lat Pulldown", targetSets: 4, targetReps: 10 },
          { exerciseId: "ex_seated_row", exerciseName: "Seated Row", targetSets: 3, targetReps: 8 },
        ],
      },
      {
        id: "plan_thu",
        title: "Legs & Lower Focus",
        dayOfWeek: 4,
        targetMuscles: ["Quads", "Hamstrings"],
        exercises: [
          { exerciseId: "ex_back_squat", exerciseName: "Back Squat", targetSets: 4, targetReps: 8 },
          { exerciseId: "ex_romanian_deadlift", exerciseName: "Romanian Deadlift", targetSets: 3, targetReps: 8 },
        ],
      },
    ]);
  }

  await seedModules();
}

/**
 * Sample content for the non-training modules so every screen is explorable
 * on a fresh install. Runs once, tracked by a flag row in `settings`.
 */
async function seedModules() {
  const alreadySeeded = await db.settings.get(SEED_FLAG_ID);
  if (alreadySeeded) return;

  await db.settings.put({
    id: SEED_FLAG_ID,
    defaultRestSeconds: 0,
    soundEnabled: false,
    vibrationEnabled: false,
  });

  await db.wealthProfile.put(DEFAULT_WEALTH_PROFILE);

  /* -------------------------------- Faith --------------------------------- */

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addDays(today(), -offset);
    const prayers = PRAYER_NAMES.reduce(
      (acc, name, index) => ({ ...acc, [name]: offset === 0 ? index < 3 : index < 5 - (offset % 2) }),
      {} as Record<PrayerName, boolean>,
    );
    await db.prayerLogs.put({ date, prayers });
    for (const name of PRAYER_NAMES) {
      if (prayers[name]) await logActivity("prayer_logged", { date });
    }

    await db.adhkarLogs.put({
      date,
      morning: offset % 2 === 0,
      evening: offset % 3 !== 0,
      afterPrayer: offset % 2 === 1,
      istighfarCount: offset === 0 ? 33 : 100,
    });
    if (offset % 2 === 0) await logActivity("adhkar_logged", { date });
  }

  const readings: [number, QuranReadingLog][] = [
    [5, { date: "", surah: "Al-Mulk", fromAyah: 1, toAyah: 15, pages: 3, reflection: "Dominion belongs to Him alone." }],
    [3, { date: "", surah: "Al-Kahf", fromAyah: 1, toAyah: 20, pages: 4, reflection: "Friday habit — the cave and the youth." }],
    [1, { date: "", surah: "Ar-Rahman", fromAyah: 1, toAyah: 30, pages: 3, reflection: "Which of the favours will you deny?" }],
  ];
  for (const [offset, reading] of readings) {
    const date = addDays(today(), -offset);
    await db.quranReading.add({ ...reading, date });
    await logActivity("quran_reading", { date });
  }

  await db.memorization.bulkAdd([
    { surah: "An-Naba", fromAyah: 1, toAyah: 40, status: "memorized", startedAt: addDays(today(), -120), lastReviewedAt: addDays(today(), -6) },
    { surah: "An-Naziat", fromAyah: 1, toAyah: 26, status: "needs-work", startedAt: addDays(today(), -60), lastReviewedAt: addDays(today(), -14) },
    { surah: "Abasa", fromAyah: 1, toAyah: 20, status: "learning", startedAt: addDays(today(), -10) },
  ]);
  await logActivity("quran_memorization", { date: addDays(today(), -120) });

  await db.revisions.bulkAdd([
    { date: addDays(today(), -6), surah: "An-Naba", quality: 4 },
    { date: addDays(today(), -14), surah: "An-Naziat", quality: 2, notes: "Middle section drifts." },
  ]);
  await logActivity("quran_revision", { date: addDays(today(), -6) });

  await db.missedFasts.bulkAdd([
    { missedOn: addDays(today(), -80), reason: "Cycle", madeUpOn: addDays(today(), -30) },
    { missedOn: addDays(today(), -78), reason: "Cycle", madeUpOn: null },
    { missedOn: addDays(today(), -77), reason: "Cycle", madeUpOn: null },
  ]);
  await logActivity("fast_made_up", { date: addDays(today(), -30) });

  /* -------------------------------- Health -------------------------------- */

  for (let week = 8; week >= 0; week -= 1) {
    const date = addDays(today(), -week * 7);
    await db.weights.add({ date, weightKg: Number((64 - week * 0.2).toFixed(1)) });
    await logActivity("weight_logged", { date });
  }

  await db.measurements.bulkAdd([
    { date: addDays(today(), -60), waistCm: 74, hipsCm: 98, chestCm: 89, thighCm: 57, armCm: 28 },
    { date: addDays(today(), -30), waistCm: 73, hipsCm: 97.5, chestCm: 89, thighCm: 57.5, armCm: 28.5 },
    { date: today(), waistCm: 72, hipsCm: 97, chestCm: 89.5, thighCm: 58, armCm: 29, notes: "Strength work showing." },
  ]);
  await logActivity("measurement_logged", { date: today() });

  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = addDays(today(), -offset);
    await db.sleepLogs.add({
      date,
      hours: Number((6.5 + ((offset * 7) % 5) * 0.3).toFixed(1)),
      quality: 2 + (offset % 4),
    });
    await logActivity("sleep_logged", { date });
  }

  await db.cycleLogs.bulkAdd([
    { startDate: addDays(today(), -56), endDate: addDays(today(), -51), flow: 3 },
    { startDate: addDays(today(), -28), endDate: addDays(today(), -23), flow: 4, symptoms: "Low energy days 1–2" },
  ]);
  await logActivity("cycle_logged", { date: addDays(today(), -28) });

  await db.healthNotes.bulkAdd([
    { date: addDays(today(), -20), category: "appointment", title: "Dentist check-up", details: "All clear, next in 6 months." },
    { date: addDays(today(), -5), category: "symptom", title: "Tension headaches", details: "Worse on low-sleep days." },
  ]);

  /* -------------------------------- Library ------------------------------- */

  const bookIds = await db.books.bulkAdd(
    [
      { title: "The Sealed Nectar", author: "Safiur Rahman Mubarakpuri", totalPages: 600, currentPage: 240, status: "reading", startedAt: addDays(today(), -40) },
      { title: "Deep Work", author: "Cal Newport", totalPages: 300, currentPage: 95, status: "reading", startedAt: addDays(today(), -12) },
      { title: "Reclaim Your Heart", author: "Yasmin Mogahed", totalPages: 220, currentPage: 220, status: "finished", finishedAt: addDays(today(), -25), rating: 5 },
      { title: "Atomic Habits", author: "James Clear", totalPages: 320, currentPage: 320, status: "finished", finishedAt: addDays(today(), -70), rating: 4 },
      {
        title: "The Winds of Winter",
        author: "George R. R. Martin",
        totalPages: 0,
        currentPage: 0,
        status: "waiting",
        seriesName: "A Song of Ice and Fire",
        expectedReleaseDate: addDays(today(), 240),
      },
      {
        title: "Stormlight Archive V",
        author: "Brandon Sanderson",
        totalPages: 0,
        currentPage: 0,
        status: "waiting",
        seriesName: "The Stormlight Archive",
        expectedReleaseDate: addDays(today(), 90),
      },
    ],
    { allKeys: true },
  );

  for (let offset = 10; offset >= 0; offset -= 2) {
    const date = addDays(today(), -offset);
    await db.readingSessions.add({ bookId: bookIds[0], date, pagesRead: 20 + (offset % 3) * 5, minutes: 30 });
    await logActivity("reading_session", { date });
  }
  await logActivity("book_finished", { date: addDays(today(), -25) });
  await logActivity("book_finished", { date: addDays(today(), -70) });

  /* ------------------------------- Perfumery ------------------------------ */

  const formulaId = await db.perfumeFormulas.add({
    name: "Amber Study",
    inspiration: "Late autumn, resin, dried figs",
    createdAt: addDays(today(), -45),
  });
  await logActivity("formula_created", { date: addDays(today(), -45) });

  await db.perfumeVersions.bulkAdd([
    {
      formulaId,
      version: "v1",
      date: addDays(today(), -45),
      unit: "drops",
      ingredients: [
        { name: "Bergamot", note: "top", amount: 6 },
        { name: "Labdanum", note: "heart", amount: 10 },
        { name: "Benzoin", note: "base", amount: 12 },
      ],
      observations: "Too sweet on the dry-down, top notes vanish in minutes.",
      rating: 2,
    },
    {
      formulaId,
      version: "v2",
      date: addDays(today(), -20),
      unit: "drops",
      ingredients: [
        { name: "Bergamot", note: "top", amount: 8 },
        { name: "Pink pepper", note: "top", amount: 3 },
        { name: "Labdanum", note: "heart", amount: 8 },
        { name: "Benzoin", note: "base", amount: 9 },
        { name: "Vetiver", note: "base", amount: 4 },
      ],
      observations: "Vetiver cuts the sweetness. Opening lasts about 40 minutes now.",
      rating: 4,
    },
  ]);
  await logActivity("version_logged", { date: addDays(today(), -45) });
  await logActivity("version_logged", { date: addDays(today(), -20) });

  /* -------------------------------- Wealth -------------------------------- */

  const goalIds = await db.savingsGoals.bulkAdd(
    [
      { name: "Emergency fund", targetAmount: 3000, targetDate: addDays(today(), 180), createdAt: addDays(today(), -120), completedAt: null },
      { name: "Perfume lab kit", targetAmount: 450, targetDate: addDays(today(), 60), createdAt: addDays(today(), -40), completedAt: null },
    ],
    { allKeys: true },
  );
  await logActivity("goal_created", { date: addDays(today(), -120) });

  for (let month = 4; month >= 0; month -= 1) {
    const date = addDays(today(), -month * 30);
    await db.savingsEntries.add({ date, amount: 250 + month * 10, goalId: goalIds[0], note: "Monthly transfer" });
    await logActivity("savings_deposit", { date });
  }
  await db.savingsEntries.add({ date: addDays(today(), -15), amount: 120, goalId: goalIds[1], note: "Sold old bottles" });
  await logActivity("savings_deposit", { date: addDays(today(), -15) });

  await db.purchasePlans.bulkAdd([
    { name: "Analytical scale (0.001g)", price: 180, priority: "high", createdAt: addDays(today(), -10), purchasedAt: null },
    { name: "Winter coat", price: 240, priority: "medium", createdAt: addDays(today(), -30), purchasedAt: null },
    { name: "Running shoes", price: 95, priority: "low", createdAt: addDays(today(), -60), purchasedAt: addDays(today(), -50) },
  ]);
  await logActivity("purchase_planned", { date: addDays(today(), -10) });

  /* --------------------------------- Life --------------------------------- */

  await db.journalEntries.bulkAdd([
    {
      date: addDays(today(), -4),
      title: "On slow mornings",
      body: "Started the day with adhkar instead of my phone. The whole day felt less reactive.",
      mood: 4,
      gratitude: "Quiet mornings",
    },
    {
      date: addDays(today(), -1),
      title: "Training is showing up elsewhere",
      body: "Squats are heavier and so is my patience. Discipline in one place leaks into the others.",
      mood: 5,
      gratitude: "A body that recovers",
    },
  ]);
  await logActivity("journal_entry", { date: addDays(today(), -1) });

  const peopleIds = await db.people.bulkAdd(
    [
      { name: "Mum", relationship: "Family", cadenceDays: 3, lastContactedAt: addDays(today(), -2) },
      { name: "Hafsa", relationship: "Closest friend", cadenceDays: 14, lastContactedAt: addDays(today(), -16) },
      { name: "Ustadha Amina", relationship: "Teacher", cadenceDays: 30, lastContactedAt: addDays(today(), -20) },
    ],
    { allKeys: true },
  );

  await db.callReminders.bulkAdd([
    { personId: peopleIds[0], dueDate: addDays(today(), 1), completedAt: null },
    { personId: peopleIds[1], dueDate: addDays(today(), -2), completedAt: null, note: "She started a new job — ask how it is going." },
    { personId: peopleIds[2], dueDate: addDays(today(), 10), completedAt: null },
  ]);

  await db.timelineEvents.bulkAdd([
    { date: addDays(today(), -365), title: "Started training seriously", category: "milestone", description: "First structured programme." },
    { date: addDays(today(), -120), title: "Finished memorizing An-Naba", category: "milestone" },
    { date: addDays(today(), -45), title: "First perfume formula", category: "decision", description: "Bought the starter kit and began Amber Study." },
  ]);
  await logActivity("timeline_event", { date: addDays(today(), -45) });
}
