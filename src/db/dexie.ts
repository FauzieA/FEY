import Dexie from "dexie";

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
  dayOfWeek?: number;
  targetMuscles?: string[];
  exercises: PlanExercise[];
}

export interface ExerciseSetLog {
  setNum: number;
  weightKg: number;
  reps: number;
  durationSec?: number;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  planTitle: string;
  completedAt: string; // ISO String timestamp
  durationMinutes: number;
  totalVolumeKg: number;
  xpEarned: number;
  exercises: SessionExercise[];
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

class FeyDatabase extends Dexie {
  plans!: Dexie.Table<WorkoutPlan, string>;
  sessions!: Dexie.Table<WorkoutSession, string>;
  character!: Dexie.Table<CharacterProfile, string>;
  settings!: Dexie.Table<AppSettings, string>;

  constructor() {
    super("FeyDatabase");
    this.version(1).stores({
      plans: "id",
      sessions: "id, completedAt",
      character: "id",
      settings: "id",
    });
  }
}

export const db = new FeyDatabase();