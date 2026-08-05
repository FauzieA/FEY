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
  id: string; // Client-generated UUID
  planId?: string | number;
  planTitle?: string;
  startedAt?: string | Date;
  completedAt: string; // ISO String timestamp
  durationSeconds?: number; // Optional
  durationMinutes: number;
  xpEarned?: number;
  completed?: boolean; // Optional
  exercises: SessionExercise[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface PersonalRecord {
  id: string; // Client-generated UUID
  exerciseId: string;
  weight: number;
  reps?: number;
  date?: string | Date;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  syncStatus: 'pending' | 'synced' | 'failed';
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
  id: string; // e.g., 'app_settings' or UUID
  defaultRestSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  syncStatus: 'pending' | 'synced' | 'failed';
}

/* -------------------------------------------------------------------------- */
/*                             DEXIE DATABASE CLASS                           */
/* -------------------------------------------------------------------------- */

class FeyDatabase extends Dexie {
  /* Training */
  plans!: Dexie.Table<WorkoutPlan, string>;
  sessions!: Dexie.Table<WorkoutSession, string>;
  personalRecords!: Dexie.Table<PersonalRecord, string>;
  character!: Dexie.Table<CharacterProfile, string>;
  settings!: Dexie.Table<AppSettings, string>;

  /* Character */
  xpEvents!: Dexie.Table<XpEvent, string>;
  achievements!: Dexie.Table<AchievementRecord, string>;

  /* Faith */
  prayerLogs!: Dexie.Table<PrayerLog, string>;
  quranReading!: Dexie.Table<QuranReadingLog, string>;
  memorization!: Dexie.Table<MemorizationEntry, string>;
  revisions!: Dexie.Table<RevisionLog, string>;
  adhkarLogs!: Dexie.Table<AdhkarLog, string>;
  missedFasts!: Dexie.Table<MissedFast, string>;

  /* Health */
  measurements!: Dexie.Table<Measurement, string>;
  weights!: Dexie.Table<WeightLog, string>;
  sleepLogs!: Dexie.Table<SleepLog, string>;
  cycleLogs!: Dexie.Table<CycleLog, string>;
  healthNotes!: Dexie.Table<HealthNote, string>;

  /* Library */
  books!: Dexie.Table<Book, string>;
  readingSessions!: Dexie.Table<ReadingSession, string>;

  /* Perfumery */
  perfumeFormulas!: Dexie.Table<PerfumeFormula, string>;
  perfumeVersions!: Dexie.Table<PerfumeVersion, string>;

  /* Wealth */
  savingsEntries!: Dexie.Table<SavingsEntry, string>;
  savingsGoals!: Dexie.Table<SavingsGoal, string>;
  purchasePlans!: Dexie.Table<PurchasePlan, string>;
  wealthProfile!: Dexie.Table<WealthProfile, string>;

  /* Life */
  journalEntries!: Dexie.Table<JournalEntry, string>;
  people!: Dexie.Table<Person, string>;
  callReminders!: Dexie.Table<CallReminder, string>;
  timelineEvents!: Dexie.Table<TimelineEvent, string>;

  constructor() {
    super("FeyDatabase");

    // Schema definition for IndexedDB
    this.version(1).stores({
      plans: "id, dayOfWeek",
      sessions: "id, completedAt, planId, syncStatus, updatedAt",
      personalRecords: "id, exerciseId, date, syncStatus, updatedAt",
      character: "id, syncStatus, updatedAt",
      settings: "id, syncStatus, updatedAt",
    });

    // v2 expands FEY from a workout tracker into a full life operating system.
    this.version(2).stores({
      xpEvents: "id, module, date, attribute",
      achievements: "id, unlockedAt",

      prayerLogs: "id, date",
      quranReading: "id, date, surah",
      memorization: "id, surah, status",
      revisions: "id, date, surah",
      adhkarLogs: "id, date",
      missedFasts: "id, missedOn, madeUpOn",

      measurements: "id, date",
      weights: "id, date",
      sleepLogs: "id, date",
      cycleLogs: "id, startDate",
      healthNotes: "id, date, category",

      books: "id, status, title",
      readingSessions: "id, bookId, date",

      perfumeFormulas: "id, name",
      perfumeVersions: "id, formulaId, date",

      savingsEntries: "id, date, goalId",
      savingsGoals: "id, name",
      purchasePlans: "id, priority, purchasedAt",
      wealthProfile: "id",

      journalEntries: "id, date",
      people: "id, name",
      callReminders: "id, personId, dueDate",
      timelineEvents: "id, date, category",
    });

    this.on('blocked', () => {
      console.warn('Dexie database upgrade blocked by another connection.');
    });

    this.open().catch(async (error: any) => {
      if (error?.name === 'UpgradeError' || error?.message?.includes('Not yet support for changing primary key')) {
        console.warn('Incompatible Dexie schema detected; deleting local database and reopening.', error);
        this.close();
        await Dexie.delete(this.name);
        await this.open();
      } else {
        throw error;
      }
    });
  }
}

export const db = new FeyDatabase();