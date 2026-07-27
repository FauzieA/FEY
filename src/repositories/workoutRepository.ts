import { db } from '@/db/dexie';
import type { WorkoutPlan, WorkoutSession, PersonalRecord } from '@/db/dexie';

export class WorkoutRepository {
  static async getPlans(): Promise<WorkoutPlan[]> {
    return await db.plans.toArray();
  }

  static async getPlanByDay(dayOfWeek: number): Promise<WorkoutPlan | undefined> {
    return await db.plans.where('dayOfWeek').equals(dayOfWeek).first();
  }

  static async saveSession(session: WorkoutSession): Promise<string> {
    return await db.sessions.add(session);
  }

  static async getAllSessions(): Promise<WorkoutSession[]> {
    return await db.sessions.reverse().toArray();
  }

  static async getPersonalRecords(): Promise<PersonalRecord[]> {
    return await db.personalRecords.toArray();
  }

  static async checkAndSavePR(
    exerciseId: string,
    _exerciseName: string, // Prefixed with '_' to ignore TS unused variable warning
    weightKg: number
  ): Promise<boolean> {
    const existingPr = await db.personalRecords
      .where('exerciseId')
      .equals(exerciseId)
      .first();

    if (!existingPr || weightKg > existingPr.weight) {
      if (existingPr && existingPr.id !== undefined) {
        await db.personalRecords.update(existingPr.id, {
          weight: weightKg,
          date: new Date().toISOString(),
        });
      } else {
        await db.personalRecords.add({
          exerciseId,
          weight: weightKg,
          date: new Date().toISOString(),
        });
      }
      return true; // Indicates a new PR was set!
    }

    return false;
  }
}