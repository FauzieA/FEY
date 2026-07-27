export interface ExerciseSet {
  id?: string;
  reps?: number;
  weight?: number;
  completed?: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name?: string;
  sets: ExerciseSet[];
}

export interface WorkoutPlan {
  id?: string | number;
  name: string;
  dayOfWeek?: number;
  exercises?: WorkoutExercise[];
}

export interface WorkoutSession {
  id?: string | number;
  planId?: string | number;
  startedAt: string | Date;
  completedAt?: string | Date;
  durationSeconds: number; // Required (default to 0 when creating sessions)
  durationMinutes?: number;
  totalVolumeKg?: number;
  completed: boolean;
  exercises: WorkoutExercise[]; // Required array (can be empty [])
}

export interface PersonalRecord {
  id?: string | number;
  exerciseId: string;
  weight: number;
  reps?: number;
  date?: string | Date;
}