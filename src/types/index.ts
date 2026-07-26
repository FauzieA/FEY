// --- Character & Gamification ---
export interface CharacterState {
  id: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  currentStreak: number;
  lastWorkoutDate: string | null;
  attributes: {
    STR: number; // Strength
    END: number; // Endurance
    VOL: number; // Work Volume
    CON: number; // Consistency
  };
}

// --- Exercises & Plans ---
export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  category: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';
  defaultSets: number;
  defaultReps: number;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  dayOfWeek: number; // 1 = Mon, ..., 7 = Sun
  targetMuscles: string[];
  exercises: {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number;
  }[];
}

// --- Active Workout Logging ---
export interface SetLog {
  setNumber: number;
  repsCompleted: number;
  weightKg: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id?: number;
  planId: string;
  planTitle: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  completed: boolean;
  xpEarned: number;
  exercises: ExerciseLog[];
}

// --- Records & Settings ---
export interface PersonalRecord {
  id?: number;
  exerciseId: string;
  exerciseName: string;
  value: number; // Weight in kg
  achievedAt: string;
}

export interface AppSettings {
  id: string;
  defaultRestSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}