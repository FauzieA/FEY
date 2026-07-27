import Dexie from "dexie";

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
  totalVolumeKg: number;
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
  plans!: Dexie.Table<WorkoutPlan, string>;
  sessions!: Dexie.Table<WorkoutSession, string>;
  personalRecords!: Dexie.Table<PersonalRecord, string | number>;
  character!: Dexie.Table<CharacterProfile, string>;
  settings!: Dexie.Table<AppSettings, string>;

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
  }
}

export const db = new FeyDatabase();