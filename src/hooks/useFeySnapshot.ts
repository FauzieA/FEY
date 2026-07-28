import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import type { WorkoutSession } from "@/db/dexie";
import type {
  AdhkarLog,
  Book,
  CallReminder,
  CycleLog,
  HealthNote,
  JournalEntry,
  Measurement,
  MemorizationEntry,
  MissedFast,
  PerfumeFormula,
  PerfumeVersion,
  Person,
  PrayerLog,
  PurchasePlan,
  QuranReadingLog,
  ReadingSession,
  RevisionLog,
  SavingsEntry,
  SavingsGoal,
  SleepLog,
  TimelineEvent,
  WealthProfile,
  WeightLog,
  XpEvent,
} from "@/types/modules";

/** Every record in FEY, loaded once so cross-module views stay consistent. */
export interface FeySnapshot {
  sessions: WorkoutSession[];
  xpEvents: XpEvent[];
  prayerLogs: PrayerLog[];
  quranReading: QuranReadingLog[];
  memorization: MemorizationEntry[];
  revisions: RevisionLog[];
  adhkarLogs: AdhkarLog[];
  missedFasts: MissedFast[];
  measurements: Measurement[];
  weights: WeightLog[];
  sleepLogs: SleepLog[];
  cycleLogs: CycleLog[];
  healthNotes: HealthNote[];
  books: Book[];
  readingSessions: ReadingSession[];
  perfumeFormulas: PerfumeFormula[];
  perfumeVersions: PerfumeVersion[];
  savingsEntries: SavingsEntry[];
  savingsGoals: SavingsGoal[];
  purchasePlans: PurchasePlan[];
  wealthProfile: WealthProfile | undefined;
  journalEntries: JournalEntry[];
  people: Person[];
  callReminders: CallReminder[];
  timelineEvents: TimelineEvent[];
}

export const EMPTY_SNAPSHOT: FeySnapshot = {
  sessions: [],
  xpEvents: [],
  prayerLogs: [],
  quranReading: [],
  memorization: [],
  revisions: [],
  adhkarLogs: [],
  missedFasts: [],
  measurements: [],
  weights: [],
  sleepLogs: [],
  cycleLogs: [],
  healthNotes: [],
  books: [],
  readingSessions: [],
  perfumeFormulas: [],
  perfumeVersions: [],
  savingsEntries: [],
  savingsGoals: [],
  purchasePlans: [],
  wealthProfile: undefined,
  journalEntries: [],
  people: [],
  callReminders: [],
  timelineEvents: [],
};

export function useFeySnapshot(): FeySnapshot {
  const snapshot = useLiveQuery(async (): Promise<FeySnapshot> => {
    const [
      sessions,
      xpEvents,
      prayerLogs,
      quranReading,
      memorization,
      revisions,
      adhkarLogs,
      missedFasts,
      measurements,
      weights,
      sleepLogs,
      cycleLogs,
      healthNotes,
      books,
      readingSessions,
      perfumeFormulas,
      perfumeVersions,
      savingsEntries,
      savingsGoals,
      purchasePlans,
      wealthProfile,
      journalEntries,
      people,
      callReminders,
      timelineEvents,
    ] = await Promise.all([
      db.sessions.toArray(),
      db.xpEvents.toArray(),
      db.prayerLogs.toArray(),
      db.quranReading.toArray(),
      db.memorization.toArray(),
      db.revisions.toArray(),
      db.adhkarLogs.toArray(),
      db.missedFasts.toArray(),
      db.measurements.toArray(),
      db.weights.toArray(),
      db.sleepLogs.toArray(),
      db.cycleLogs.toArray(),
      db.healthNotes.toArray(),
      db.books.toArray(),
      db.readingSessions.toArray(),
      db.perfumeFormulas.toArray(),
      db.perfumeVersions.toArray(),
      db.savingsEntries.toArray(),
      db.savingsGoals.toArray(),
      db.purchasePlans.toArray(),
      db.wealthProfile.get("wealth"),
      db.journalEntries.toArray(),
      db.people.toArray(),
      db.callReminders.toArray(),
      db.timelineEvents.toArray(),
    ]);

    return {
      sessions,
      xpEvents,
      prayerLogs,
      quranReading,
      memorization,
      revisions,
      adhkarLogs,
      missedFasts,
      measurements,
      weights,
      sleepLogs,
      cycleLogs,
      healthNotes,
      books,
      readingSessions,
      perfumeFormulas,
      perfumeVersions,
      savingsEntries,
      savingsGoals,
      purchasePlans,
      wealthProfile,
      journalEntries,
      people,
      callReminders,
      timelineEvents,
    };
  }, []);

  return snapshot ?? EMPTY_SNAPSHOT;
}
