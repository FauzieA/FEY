import { db } from '@/db/dexie';
import { syncService } from '@/services/syncService';
import type { WorkoutPlan, WorkoutSession, PersonalRecord } from '@/db/dexie';

export class WorkoutRepository {
  static async getPlans(): Promise<WorkoutPlan[]> {
    // First try local Dexie
    const localPlans = await db.plans.toArray();
    if (localPlans.length > 0) {
      return localPlans;
    }
    
    // If no local data, return empty (plans are seeded in seed.ts)
    return [];
  }

  static async getPlanByDay(dayOfWeek: number): Promise<WorkoutPlan | undefined> {
    return await db.plans.where('dayOfWeek').equals(dayOfWeek).first();
  }

  static async saveSession(session: WorkoutSession): Promise<string> {
    // Save to local Dexie immediately
    const id = await db.sessions.add(session);
    
    // Queue sync to backend
    syncService.queueSync('workout', session);
    
    return id;
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
      
      // Queue sync to backend
      syncService.queueSync('personal_record', {
        exerciseId,
        weight: weightKg,
        date: new Date().toISOString(),
      });
      
      return true; // Indicates a new PR was set!
    }

    return false;
  }
}