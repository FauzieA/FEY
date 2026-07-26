import { db } from '@/db/dexie';
import type { WorkoutPlan, WorkoutSession, PersonalRecord } from '@/types';

export class WorkoutRepository {
  static async getPlans(): Promise<WorkoutPlan[]> {
    return await db.plans.toArray();
  }

  static async getPlanByDay(dayOfWeek: number): Promise<WorkoutPlan | undefined> {
    return await db.plans.where('dayOfWeek').equals(dayOfWeek).first();
  }

  static async saveSession(session: Omit<WorkoutSession, 'id'>): Promise<number> {
    return await db.sessions.add(session as WorkoutSession);
  }

  static async getAllSessions(): Promise<WorkoutSession[]> {
    return await db.sessions.reverse().toArray();
  }

  static async getPersonalRecords(): Promise<PersonalRecord[]> {
    return await db.personalRecords.toArray();
  }

  static async checkAndSavePR(exerciseId: string, exerciseName: string, weightKg: number): Promise<boolean> {
    const existingPr = await db.personalRecords
      .where('exerciseId')
      .equals(exerciseId)
      .first();

    if (!existingPr || weightKg > existingPr.value) {
      if (existingPr && existingPr.id) {
        await db.personalRecords.update(existingPr.id, {
          value: weightKg,
          achievedAt: new Date().toISOString(),
        });
      } else {
        await db.personalRecords.add({
          exerciseId,
          exerciseName,
          value: weightKg,
          achievedAt: new Date().toISOString(),
        });
      }
      return true; // Indicates a new PR was set!
    }

    return false;
  }
}