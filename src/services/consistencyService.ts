/**
 * Consistency Tracking Service
 * 
 * Tracks consecutive days of activity to calculate consistency multipliers.
 * Each activity type has its own streak counter.
 */

import { db } from "@/db/dexie";
import { today, toISODate } from "@/utils/date";

class ConsistencyService {
  private cache = new Map<string, number>();

  /**
   * Get the current consecutive day streak for an activity type.
   * Counts consecutive days going backwards from today.
   */
  async getConsecutiveDays(activityType: string): Promise<number> {
    const cacheKey = `${activityType}-${today()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const todayStr = today();
    let consecutiveDays = 0;
    let checkDate = new Date(todayStr);

    // Check backwards from today
    while (true) {
      const dateStr = toISODate(checkDate);
      
      // Check if there was any XP event for this activity type on this date
      const hasActivity = await db.xpEvents
        .where("date")
        .equals(dateStr)
        .and((event) => event.activity === activityType)
        .count();

      if (hasActivity > 0) {
        consecutiveDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no activity yet, check if we should still count previous days
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }

      // Safety limit to prevent infinite loops
      if (consecutiveDays > 365) break;
    }

    this.cache.set(cacheKey, consecutiveDays);
    return consecutiveDays;
  }

  /**
   * Reset the cache for a specific activity type (call after logging new activity).
   */
  invalidateCache(activityType?: string): void {
    if (activityType) {
      const key = `${activityType}-${today()}`;
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get the overall activity streak (any activity logged).
   */
  async getOverallStreak(): Promise<number> {
    const todayStr = today();
    let consecutiveDays = 0;
    let checkDate = new Date(todayStr);

    while (true) {
      const dateStr = toISODate(checkDate);
      
      const hasAnyActivity = await db.xpEvents
        .where("date")
        .equals(dateStr)
        .count();

      if (hasAnyActivity > 0) {
        consecutiveDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }

      if (consecutiveDays > 365) break;
    }

    return consecutiveDays;
  }
}

export const consistencyService = new ConsistencyService();
