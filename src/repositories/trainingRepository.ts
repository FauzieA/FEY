import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import type { WorkoutSession } from "@/db/dexie";
import { WorkoutRepository } from "@/repositories/workoutRepository";
import { logActivity } from "@/services/xpService";
import { toISODate } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";

/** A single logged working set, flattened across sessions. */
export interface ExerciseSetRecord {
  date: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  weightKg: number;
  volumeKg: number;
}

export const TrainingRepository = {
  /**
   * Persists a session and awards character XP for it, including a bonus for
   * any exercise where the top set beat the previous personal record.
   */
  async saveSession(session: WorkoutSession): Promise<void> {
    const now = new Date().toISOString();
    
    // Ensure session has UUID and sync fields
    const sessionToSave: WorkoutSession = {
      ...session,
      id: session.id || generateUUID(),
      createdAt: session.createdAt || now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    // Save to local Dexie immediately
    await db.sessions.put(sessionToSave);

    const date = toISODate(sessionToSave.completedAt ?? new Date());
    const completedSets = sessionToSave.exercises.reduce(
      (count, exercise) => count + (exercise.sets ?? []).filter((set) => set.completed ?? true).length,
      0,
    );

    await logActivity("workout_session", { date, sessionId: sessionToSave.id });
    if (completedSets > 0) await logActivity("workout_set", { multiplier: completedSets, date, sessionId: sessionToSave.id });

    for (const exercise of sessionToSave.exercises) {
      const topWeight = Math.max(0, ...(exercise.sets ?? []).map((set) => set.weightKg ?? set.weight ?? 0));
      if (topWeight <= 0) continue;
      const isRecord = await WorkoutRepository.checkAndSavePR(
        exercise.exerciseId,
        exercise.exerciseName ?? exercise.name ?? exercise.exerciseId,
        topWeight,
      );
      if (isRecord) await logActivity("personal_record", { date, difficulty: "hard" as const, sessionId: sessionToSave.id });
    }

    // Queue sync to backend (will be handled by sync service based on syncStatus)
    syncService.queueSync('workout', sessionToSave, 'create');
  },

  /** Every logged set across all sessions, newest first. */
  flattenSets(sessions: WorkoutSession[]): ExerciseSetRecord[] {
    const records: ExerciseSetRecord[] = [];

    for (const session of sessions) {
      const date = toISODate(session.completedAt ?? session.startedAt ?? new Date());
      for (const exercise of session.exercises ?? []) {
        for (const set of exercise.sets ?? []) {
          const weightKg = set.weightKg ?? set.weight ?? 0;
          const reps = set.reps ?? 0;
          records.push({
            date,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName ?? exercise.name ?? exercise.exerciseId,
            reps,
            weightKg,
            volumeKg: weightKg * reps,
          });
        }
      }
    }

    return records.sort((a, b) => b.date.localeCompare(a.date));
  },
};
