import { db } from '@/db/dexie';
import { syncService } from '@/services/syncService';
import { toISODate } from '@/utils/date';
import { generateUUID } from '@/utils/uuid';
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
    syncService.queueSync('workout', session, 'create');
    
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
      const today = toISODate(new Date());
      const recordId = existingPr?.id ?? generateUUID();

      if (existingPr && existingPr.id !== undefined) {
        await db.personalRecords.update(existingPr.id, {
          weight: weightKg,
          date: today,
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
      } else {
        await db.personalRecords.add({
          id: recordId,
          exerciseId,
          weight: weightKg,
          date: today,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
      }
      
      // Queue sync to backend
      const prPayload = {
        id: recordId,
        exerciseId,
        weight: weightKg,
        date: today,
      };

      if (existingPr && existingPr.id !== undefined) {
        syncService.queueSync('personal_record', { id: existingPr.id, ...prPayload }, 'update');
      } else {
        syncService.queueSync('personal_record', prPayload, 'create');
      }
      
      return true; // Indicates a new PR was set!
    }

    return false;
  }
}