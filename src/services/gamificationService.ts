import { CharacterRepository } from '@/repositories/characterRepository';
import type { WorkoutSession, CharacterProfile } from '@/db/dexie';

export class GamificationService {
  /**
   * Awards XP to the character, calculates level-ups, and updates RPG attributes.
   */
  static async awardXpForWorkout(session: WorkoutSession): Promise<{
    xpEarned: number;
    leveledUp: boolean;
    newLevel: number;
  }> {
    const char = await CharacterRepository.getProfile();
    if (!char) return { xpEarned: 0, leveledUp: false, newLevel: 1 };

    // Calculate base XP from session duration (fallback to durationMinutes if durationSeconds is undefined)
    const durationSec = session.durationSeconds ?? (session.durationMinutes ? session.durationMinutes * 60 : 0);
    const baseMinutes = Math.max(Math.floor(durationSec / 60), 10);
    
    // Safely iterate over exercises and completed sets
    const exercises = session.exercises ?? [];
    const totalSets = exercises.reduce(
      (acc, ex) => acc + (ex.sets ? ex.sets.filter((s) => s.completed ?? true).length : 0),
      0
    );

    // Formula: 5 XP per set completed + 2 XP per minute exercised + 50 completion bonus
    const xpEarned = totalSets * 5 + baseMinutes * 2 + 50;

    let currentXp = char.currentXp + xpEarned;
    let level = char.level;
    let nextLevelXp = char.nextLevelXp;
    let leveledUp = false;

    // Check level up threshold
    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      level += 1;
      nextLevelXp = Math.round(nextLevelXp * 1.25); // Scaling XP curve
      leveledUp = true;
    }

    // Attribute updates based on session
    const updatedAttributes = { ...char.attributes };
    updatedAttributes.VOL += Math.floor(totalSets / 2);
    updatedAttributes.STR += 1;
    updatedAttributes.CON += 1;

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = char.lastWorkoutDate ? char.lastWorkoutDate.split('T')[0] : null;
    let currentStreak = char.currentStreak;

    if (lastWorkout !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastWorkout === yesterdayStr) {
        currentStreak += 1;
      } else if (!lastWorkout) {
        currentStreak = 1;
      } else {
        currentStreak = 1; // Reset streak if missed more than 1 day
      }
    }

    const updatedProfile: CharacterProfile = {
      ...char,
      level,
      currentXp,
      nextLevelXp,
      currentStreak,
      lastWorkoutDate: new Date().toISOString(),
      attributes: updatedAttributes,
    };

    await CharacterRepository.saveProfile(updatedProfile);

    return { xpEarned, leveledUp, newLevel: level };
  }

  /**
   * Calculates completion percentage for the current week (Monday through Sunday)
   */
  static getWeeklyCompletionPercentage(
    sessions: WorkoutSession[],
    targetWorkoutsPerWeek = 5
  ): number {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const sessionsThisWeek = sessions.filter((s) => {
      const isCompleted = s.completed ?? true;
      const sessionDate = new Date(s.startedAt || s.completedAt);
      return isCompleted && sessionDate >= monday;
    }).length;

    return Math.min(Math.round((sessionsThisWeek / targetWorkoutsPerWeek) * 100), 100);
  }
}