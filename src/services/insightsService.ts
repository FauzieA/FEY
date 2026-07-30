import type { FeySnapshot } from "@/hooks/useFeySnapshot";
import type { CharacterMetrics } from "@/services/characterService";
import { EMPTY_METRICS } from "@/services/characterService";
import { PRAYER_NAMES } from "@/types/modules";
import { addDays, currentStreak, daysBetween, longestStreak, startOfWeek, today, weekDates } from "@/utils/date";
import { average, formatCurrency, formatNumber, percent } from "@/utils/format";

/* -------------------------------------------------------------------------- */
/*                              CHARACTER METRICS                             */
/* -------------------------------------------------------------------------- */

export function computeMetrics(snapshot: FeySnapshot): CharacterMetrics {
  const prayersLogged = snapshot.prayerLogs.reduce(
    (sum, log) => sum + PRAYER_NAMES.filter((name) => log.prayers?.[name]).length,
    0,
  );
  const completePrayerDays = snapshot.prayerLogs.filter((log) =>
    PRAYER_NAMES.every((name) => log.prayers?.[name]),
  ).length;

  const activityDates = [
    ...snapshot.xpEvents.map((e) => e.date),
    ...snapshot.prayerLogs.map((p) => p.date),
    ...snapshot.sessions.map((s) => String(s.completedAt).slice(0, 10)),
  ];

  return {
    ...EMPTY_METRICS,
    workouts: snapshot.sessions.length,
    trainingVolumeKg: Math.round(snapshot.sessions.reduce((sum, s) => sum + (s.totalVolumeKg ?? 0), 0)),
    personalRecords: snapshot.xpEvents.filter((e) => e.activity === "personal_record").length,
    prayersLogged,
    completePrayerDays,
    quranSessions: snapshot.quranReading.length,
    memorizedPassages: snapshot.memorization.filter((m) => m.status === "memorized").length,
    revisions: snapshot.revisions.length,
    adhkarDays: snapshot.adhkarLogs.filter((a) => a.morning || a.evening || a.afterPrayer).length,
    fastsMadeUp: snapshot.missedFasts.filter((f) => f.madeUpOn).length,
    fastsOutstanding: snapshot.missedFasts.filter((f) => !f.madeUpOn).length,
    weightLogs: snapshot.weights.length,
    measurements: snapshot.measurements.length,
    sleepLogs: snapshot.sleepLogs.length,
    booksFinished: snapshot.books.filter((b) => b.status === "finished").length,
    readingSessions: snapshot.readingSessions.length,
    perfumeFormulas: snapshot.perfumeFormulas.length,
    perfumeVersions: snapshot.perfumeVersions.length,
    savedTotal: snapshot.savingsEntries.reduce((sum, entry) => sum + entry.amount, 0),
    goalsCompleted: snapshot.savingsGoals.filter((goal) => goal.completedAt).length,
    journalEntries: snapshot.journalEntries.length,
    peopleTracked: snapshot.people.length,
    contactsMade: snapshot.callReminders.filter((r) => r.completedAt).length,
    timelineEvents: snapshot.timelineEvents.length,
    activeDays: new Set(activityDates).size,
    streak: currentStreak(activityDates),
    longestStreak: longestStreak(activityDates),
    modulesTouched: new Set(snapshot.xpEvents.map((e) => e.module)).size,
  };
}

/* -------------------------------------------------------------------------- */
/*                               DAILY CHECKLIST                              */
/* -------------------------------------------------------------------------- */

export interface ChecklistItem {
  id: string;
  label: string;
  module: string;
  path: string;
  done: boolean;
  progress?: number;
}

export function dailyChecklist(snapshot: FeySnapshot, date = today()): ChecklistItem[] {
  const prayerLog = snapshot.prayerLogs.find((log) => log.date === date);
  const adhkar = snapshot.adhkarLogs.find((log) => log.date === date);
  
  // Get current memorization progress
  const currentMemorization = snapshot.memorization.find((m) => m.status === "learning" || m.status === "needs-work");
  const memorizationLabel = currentMemorization 
    ? `Memorizing: ${currentMemorization.surah} (${currentMemorization.fromAyah}-${currentMemorization.toAyah})`
    : "Qur'an memorization";
  
  // Get cycle phase info
  const activeCycle = snapshot.cycleLogs.find((cycle) => !cycle.endDate);
  let cycleLabel = "Cycle tracking";
  let cycleProgress = 0;
  if (activeCycle) {
    const currentDay = daysBetween(activeCycle.startDate) + 1;
    if (currentDay <= 5) {
      cycleLabel = "Menstrual Phase";
      cycleProgress = Math.min(100, (currentDay / 5) * 100);
    } else if (currentDay <= 13) {
      cycleLabel = "Follicular Phase";
      cycleProgress = Math.min(100, ((currentDay - 5) / 8) * 100);
    } else if (currentDay <= 16) {
      cycleLabel = "Ovulation Phase";
      cycleProgress = Math.min(100, ((currentDay - 13) / 3) * 100);
    } else {
      cycleLabel = "Luteal Phase";
      cycleProgress = Math.min(100, ((currentDay - 16) / 12) * 100);
    }
  }
  
  // Get current reading book
  const currentBook = snapshot.books.find((b) => b.status === "reading");
  const readingLabel = currentBook ? `Reading: ${currentBook.title}` : "Read a book";
  const readingProgress = currentBook ? Math.round((currentBook.currentPage / currentBook.totalPages) * 100) : 0;

  return [
    {
      id: "prayers",
      label: "Five prayers",
      module: "Faith",
      path: "/faith",
      done: PRAYER_NAMES.every((name) => prayerLog?.prayers?.[name]),
      progress: PRAYER_NAMES.filter((name) => prayerLog?.prayers?.[name]).length / 5 * 100,
    },
    {
      id: "adhkar",
      label: "Morning & evening adhkar",
      module: "Faith",
      path: "/faith",
      done: Boolean(adhkar?.morning && adhkar?.evening),
      progress: (adhkar?.morning ? 50 : 0) + (adhkar?.evening ? 50 : 0),
    },
    {
      id: "quran",
      label: memorizationLabel,
      module: "Faith",
      path: "/faith",
      done: snapshot.memorization.some((m) => m.status === "memorized"),
      progress: currentMemorization ? 50 : 0,
    },
    {
      id: "training",
      label: "Movement or workout",
      module: "Training",
      path: "/training",
      done: snapshot.sessions.some((s) => String(s.completedAt).slice(0, 10) === date),
    },
    {
      id: "cycle",
      label: cycleLabel,
      module: "Health",
      path: "/health",
      done: Boolean(activeCycle),
      progress: activeCycle ? cycleProgress : 0,
    },
    {
      id: "reading",
      label: readingLabel,
      module: "Library",
      path: "/library",
      done: snapshot.readingSessions.some((log) => log.date === date),
      progress: readingProgress,
    },
  ];
}

export function dailyCompletion(snapshot: FeySnapshot, date = today()): number {
  const items = dailyChecklist(snapshot, date);
  return percent(items.filter((i) => i.done).length, items.length);
}

export function weeklyCompletion(snapshot: FeySnapshot): { percent: number; days: { date: string; percent: number }[] } {
  const days = weekDates().map((date) => ({ date, percent: dailyCompletion(snapshot, date) }));
  const elapsed = days.filter((day) => day.date <= today());
  return { percent: Math.round(average(elapsed.map((d) => d.percent))), days };
}

/* -------------------------------------------------------------------------- */
/*                                  REMINDERS                                 */
/* -------------------------------------------------------------------------- */

export interface Reminder {
  id: string;
  title: string;
  detail: string;
  date: string;
  module: string;
  path: string;
  overdue: boolean;
}

export function upcomingReminders(snapshot: FeySnapshot, horizonDays = 30): Reminder[] {
  const now = today();
  const horizon = addDays(now, horizonDays);
  const reminders: Reminder[] = [];

  for (const reminder of snapshot.callReminders) {
    if (reminder.completedAt) continue;
    const person = snapshot.people.find((p) => p.id === reminder.personId);
    if (reminder.dueDate > horizon) continue;
    reminders.push({
      id: `call-${reminder.id}`,
      title: `Call ${person?.name ?? "someone"}`,
      detail: reminder.note ?? person?.relationship ?? "Stay connected",
      date: reminder.dueDate,
      module: "Life",
      path: "/life",
      overdue: reminder.dueDate < now,
    });
  }

  const peopleWithOpenReminders = new Set(
    snapshot.callReminders.filter((reminder) => !reminder.completedAt).map((reminder) => reminder.personId),
  );

  for (const person of snapshot.people) {
    if (!person.lastContactedAt || (person.id && peopleWithOpenReminders.has(person.id))) continue;
    const due = addDays(person.lastContactedAt, person.cadenceDays);
    if (due > horizon) continue;
    reminders.push({
      id: `cadence-${person.id}`,
      title: `Check in with ${person.name}`,
      detail: `Every ${person.cadenceDays} days · last spoke ${daysBetween(person.lastContactedAt)} days ago`,
      date: due,
      module: "Life",
      path: "/life",
      overdue: due < now,
    });
  }

  for (const book of snapshot.books) {
    if (book.status !== "waiting" || !book.expectedReleaseDate) continue;
    reminders.push({
      id: `release-${book.id}`,
      title: `${book.title} releases`,
      detail: book.seriesName ? `${book.seriesName} · ${book.author}` : book.author,
      date: book.expectedReleaseDate,
      module: "Library",
      path: "/library",
      overdue: book.expectedReleaseDate < now,
    });
  }

  for (const goal of snapshot.savingsGoals) {
    if (goal.completedAt || !goal.targetDate || goal.targetDate > horizon) continue;
    const saved = snapshot.savingsEntries
      .filter((entry) => entry.goalId === goal.id)
      .reduce((sum, entry) => sum + entry.amount, 0);
    reminders.push({
      id: `goal-${goal.id}`,
      title: `${goal.name} target date`,
      detail: `${formatNumber(percent(saved, goal.targetAmount))}% funded`,
      date: goal.targetDate,
      module: "Wealth",
      path: "/wealth",
      overdue: goal.targetDate < now,
    });
  }

  const outstandingFasts = snapshot.missedFasts.filter((f) => !f.madeUpOn);
  if (outstandingFasts.length > 0) {
    reminders.push({
      id: "fasts",
      title: `${outstandingFasts.length} fast${outstandingFasts.length === 1 ? "" : "s"} to make up`,
      detail: "Missed fasts still owed",
      date: now,
      module: "Faith",
      path: "/faith",
      overdue: true,
    });
  }

  return reminders.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
}

/* -------------------------------------------------------------------------- */
/*                              MODULE SUMMARIES                              */
/* -------------------------------------------------------------------------- */

export interface ModuleSummary {
  id: string;
  label: string;
  path: string;
  headline: string;
  detail: string;
  progress: number | null;
}

export function moduleSummaries(snapshot: FeySnapshot): ModuleSummary[] {
  const weekStart = startOfWeek();
  const currency = snapshot.wealthProfile?.currency ?? "GBP";

  const workoutsThisWeek = snapshot.sessions.filter(
    (s) => String(s.completedAt).slice(0, 10) >= weekStart,
  ).length;

  const prayerDays = snapshot.prayerLogs.filter((log) => log.date >= weekStart);
  const prayersThisWeek = prayerDays.reduce(
    (sum, log) => sum + PRAYER_NAMES.filter((name) => log.prayers?.[name]).length,
    0,
  );

  const latestWeight = [...snapshot.weights].sort((a, b) => b.date.localeCompare(a.date))[0];
  const sleepWeek = snapshot.sleepLogs.filter((log) => log.date >= weekStart);

  const reading = snapshot.books.filter((b) => b.status === "reading");
  const readingProgress = reading.length
    ? Math.round(average(reading.map((b) => percent(b.currentPage, b.totalPages))))
    : 0;

  const activeFormulas = snapshot.perfumeFormulas.filter((f) => !f.archived);

  const saved = snapshot.savingsEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const savingsTarget = snapshot.savingsGoals
    .filter((goal) => !goal.completedAt)
    .reduce((sum, goal) => sum + goal.targetAmount, 0);

  const journalThisWeek = snapshot.journalEntries.filter((entry) => entry.date >= weekStart).length;
  const overdueContacts = snapshot.callReminders.filter(
    (reminder) => !reminder.completedAt && reminder.dueDate <= today(),
  ).length;

  return [
    {
      id: "training",
      label: "Training",
      path: "/training",
      headline: `${workoutsThisWeek} session${workoutsThisWeek === 1 ? "" : "s"} this week`,
      detail: `${formatNumber(snapshot.sessions.reduce((sum, s) => sum + (s.totalVolumeKg ?? 0), 0))} kg lifted all-time`,
      progress: percent(workoutsThisWeek, 5),
    },
    {
      id: "faith",
      label: "Faith",
      path: "/faith",
      headline: `${prayersThisWeek} / 35 prayers this week`,
      detail: `${snapshot.memorization.filter((m) => m.status === "memorized").length} passages memorized · ${snapshot.quranReading.length} reading sessions`,
      progress: percent(prayersThisWeek, 35),
    },
    {
      id: "health",
      label: "Health",
      path: "/health",
      headline: latestWeight ? `${latestWeight.weightKg} kg` : "No weight logged",
      detail: sleepWeek.length
        ? `${average(sleepWeek.map((s) => s.hours)).toFixed(1)}h average sleep this week`
        : "No sleep logged this week",
      progress: percent(sleepWeek.length, 7),
    },
    {
      id: "library",
      label: "Library",
      path: "/library",
      headline: `${reading.length} book${reading.length === 1 ? "" : "s"} in progress`,
      detail: `${snapshot.books.filter((b) => b.status === "finished").length} finished · ${snapshot.books.filter((b) => b.status === "waiting").length} in the waiting room`,
      progress: readingProgress,
    },
    {
      id: "perfumery",
      label: "Perfumery",
      path: "/perfumery",
      headline: `${activeFormulas.length} active formula${activeFormulas.length === 1 ? "" : "s"}`,
      detail: `${snapshot.perfumeVersions.length} versions blended`,
      progress: null,
    },
    {
      id: "wealth",
      label: "Wealth",
      path: "/wealth",
      headline: formatCurrency(saved, currency),
      detail: savingsTarget
        ? `${percent(saved, savingsTarget)}% of open goals funded`
        : "No open savings goals",
      progress: savingsTarget ? percent(saved, savingsTarget) : null,
    },
    {
      id: "life",
      label: "Life",
      path: "/life",
      headline: `${journalThisWeek} journal entr${journalThisWeek === 1 ? "y" : "ies"} this week`,
      detail: overdueContacts
        ? `${overdueContacts} check-in${overdueContacts === 1 ? "" : "s"} due`
        : `${snapshot.people.length} people tracked`,
      progress: percent(journalThisWeek, 7),
    },
  ];
}
