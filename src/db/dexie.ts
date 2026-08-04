import Dexie from "dexie";
import type {
  AchievementRecord,
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

/* -------------------------------------------------------------------------- */
/*                                 INTERFACES                                 */
/* -------------------------------------------------------------------------- */

export interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
}

export interface WorkoutPlan {
  id: string; // e.g., 'plan_mon'
  title: string;
  name?: string; 
  dayOfWeek?: number;
  targetMuscles?: string[];
  exercises: PlanExercise[];
}

export interface ExerciseSetLog {
  id?: string;
  setNum?: number;
  reps?: number;
  weightKg?: number;
  weight?: number; 
  durationSec?: number;
  completed?: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName?: string;
  name?: string;
  sets: ExerciseSetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  planId?: string | number;
  planTitle?: string;
  startedAt?: string | Date;
  completedAt: string; // ISO String timestamp
  durationSeconds?: number; // Optional
  durationMinutes: number;
  xpEarned?: number;
  completed?: boolean; // Optional
  exercises: SessionExercise[];
}

export interface PersonalRecord {
  id?: string | number;
  exerciseId: string;
  weight: number;
  reps?: number;
  date?: string | Date;
}

export interface CharacterAttribute {
  STR: number;
  END: number;
  VOL: number;
  CON: number;
}

export interface CharacterProfile {
  id: string; // usually 'user'
  level: number;
  currentXp: number;
  nextLevelXp: number;
  currentStreak: number;
  lastWorkoutDate: string | null;
  attributes: CharacterAttribute;
}

export interface AppSettings {
  id: string; // e.g., 'app_settings'
  defaultRestSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             DEXIE DATABASE CLASS                           */
/* -------------------------------------------------------------------------- */

class FeyDatabase extends Dexie {
  /* Training */
  plans!: Dexie.Table<WorkoutPlan, string>;
  sessions!: Dexie.Table<WorkoutSession, string>;
  personalRecords!: Dexie.Table<PersonalRecord, string | number>;
  character!: Dexie.Table<CharacterProfile, string>;
  settings!: Dexie.Table<AppSettings, string>;

  /* Character */
  xpEvents!: Dexie.Table<XpEvent, number>;
  achievements!: Dexie.Table<AchievementRecord, string>;

  /* Faith */
  prayerLogs!: Dexie.Table<PrayerLog, string>;
  quranReading!: Dexie.Table<QuranReadingLog, number>;
  memorization!: Dexie.Table<MemorizationEntry, number>;
  revisions!: Dexie.Table<RevisionLog, number>;
  adhkarLogs!: Dexie.Table<AdhkarLog, string>;
  missedFasts!: Dexie.Table<MissedFast, number>;

  /* Health */
  measurements!: Dexie.Table<Measurement, number>;
  weights!: Dexie.Table<WeightLog, number>;
  sleepLogs!: Dexie.Table<SleepLog, number>;
  cycleLogs!: Dexie.Table<CycleLog, number>;
  healthNotes!: Dexie.Table<HealthNote, number>;

  /* Library */
  books!: Dexie.Table<Book, number>;
  readingSessions!: Dexie.Table<ReadingSession, number>;

  /* Perfumery */
  perfumeFormulas!: Dexie.Table<PerfumeFormula, number>;
  perfumeVersions!: Dexie.Table<PerfumeVersion, number>;

  /* Wealth */
  savingsEntries!: Dexie.Table<SavingsEntry, number>;
  savingsGoals!: Dexie.Table<SavingsGoal, number>;
  purchasePlans!: Dexie.Table<PurchasePlan, number>;
  wealthProfile!: Dexie.Table<WealthProfile, string>;

  /* Life */
  journalEntries!: Dexie.Table<JournalEntry, number>;
  people!: Dexie.Table<Person, number>;
  callReminders!: Dexie.Table<CallReminder, number>;
  timelineEvents!: Dexie.Table<TimelineEvent, number>;

  constructor() {
    super("FeyDatabase");

    // Schema definition for IndexedDB
    this.version(1).stores({
      plans: "id, dayOfWeek",
      sessions: "id, completedAt, planId",
      personalRecords: "++id, exerciseId, date",
      character: "id",
      settings: "id",
    });

    // v2 expands FEY from a workout tracker into a full life operating system.
    this.version(2).stores({
      xpEvents: "++id, module, date, attribute",
      achievements: "id, unlockedAt",

      prayerLogs: "date",
      quranReading: "++id, date, surah",
      memorization: "++id, surah, status",
      revisions: "++id, date, surah",
      adhkarLogs: "date",
      missedFasts: "++id, missedOn, madeUpOn",

      measurements: "++id, date",
      weights: "++id, date",
      sleepLogs: "++id, date",
      cycleLogs: "++id, startDate",
      healthNotes: "++id, date, category",

      books: "++id, status, title",
      readingSessions: "++id, bookId, date",

      perfumeFormulas: "++id, name",
      perfumeVersions: "++id, formulaId, date",

      savingsEntries: "++id, date, goalId",
      savingsGoals: "++id, name",
      purchasePlans: "++id, priority, purchasedAt",
      wealthProfile: "id",

      journalEntries: "++id, date",
      people: "++id, name",
      callReminders: "++id, personId, dueDate",
      timelineEvents: "++id, date, category",
    });
  }
}

export const db = new FeyDatabase();