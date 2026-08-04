import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { consistencyService } from "@/services/consistencyService";
import { calculateActivityXp, type Difficulty, type AttributeId } from "@/services/xpSystem";
import { today } from "@/utils/date";
import type { XpEvent, XpModule } from "@/types/modules";

/**
 * Updated XP Service using the new calculation system.
 * XP is calculated as: Base XP × Effort Multiplier × Consistency Multiplier
 * XP is distributed among multiple attributes per activity.
 */

// Mapping from old activity IDs to new activity keys in xpSystem
const ACTIVITY_KEY_MAP: Record<string, string> = {
  /* Training */
  workout_session: "gym_workout",
  workout_set: "gym_workout", // Sets are part of gym workout
  daily_movement: "mobility_session",
  personal_record: "personal_record",

  /* Faith */
  prayer_logged: "all_prayers",
  quran_reading: "quran_reading",
  quran_memorization: "memorization",
  quran_revision: "memorization",
  adhkar_logged: "morning_adhkar",
  fast_made_up: "fast_completed",

  /* Health */
  weight_logged: "weight_logged",
  measurement_logged: "weight_logged",
  sleep_logged: "sleep_logged",
  cycle_logged: "weight_logged",
  health_note: "weight_logged",

  /* Library */
  reading_session: "reading_session",
  book_finished: "book_finished",
  book_added: "reading_session",

  /* Perfumery */
  formula_created: "formula_completed",
  version_logged: "version_blended",

  /* Wealth */
  savings_deposit: "savings_deposit",
  goal_created: "savings_deposit",
  goal_completed: "goal_reached",
  purchase_planned: "savings_deposit",

  /* Life */
  journal_entry: "journal_entry",
  person_contacted: "contact_made",
  timeline_event: "journal_entry",
};

// Mapping from old activity IDs to modules
const ACTIVITY_MODULE_MAP: Record<string, XpModule> = {
  workout_session: "training",
  workout_set: "training",
  daily_movement: "training",
  personal_record: "training",
  prayer_logged: "faith",
  quran_reading: "faith",
  quran_memorization: "faith",
  quran_revision: "faith",
  adhkar_logged: "faith",
  fast_made_up: "faith",
  weight_logged: "health",
  measurement_logged: "health",
  sleep_logged: "health",
  cycle_logged: "health",
  health_note: "health",
  reading_session: "library",
  book_finished: "library",
  book_added: "library",
  formula_created: "perfumery",
  version_logged: "perfumery",
  savings_deposit: "wealth",
  goal_created: "wealth",
  goal_completed: "wealth",
  purchase_planned: "wealth",
  journal_entry: "life",
  person_contacted: "life",
  timeline_event: "life",
};

export type ActivityId = keyof typeof ACTIVITY_KEY_MAP;

/** Records an XP event for an activity using the new calculation system. */
export async function logActivity(
  activity: ActivityId,
  options: { multiplier?: number; date?: string; difficulty?: Difficulty; sessionId?: string } = {},
): Promise<number> {
  const activityKey = ACTIVITY_KEY_MAP[activity] || activity;
  const module = ACTIVITY_MODULE_MAP[activity] || "life";
  const date = options.date ?? today();

  // Get consecutive days for consistency multiplier
  const consecutiveDays = await consistencyService.getConsecutiveDays(activityKey);

  // Calculate XP using the new system
  const xpResult = calculateActivityXp(activityKey, consecutiveDays, options.difficulty);
  const multiplier = options.multiplier ?? 1;
  const totalXp = Math.round(xpResult.totalXp * multiplier);

  // Create XP events for each attribute
  for (const breakdown of xpResult.breakdown) {
    const amount = Math.round(breakdown.xp * multiplier);
    if (amount <= 0) continue;

    const event: XpEvent = {
      module,
      activity: activityKey,
      attribute: breakdown.attribute as AttributeId,
      amount,
      date,
      createdAt: new Date().toISOString(),
      ...(options.sessionId ? { sessionId: options.sessionId } : {}),
    };

    // Save to local Dexie immediately
    await db.xpEvents.add(event);
    
    // Queue sync to backend
    syncService.queueSync('xp', event, 'create');
  }

  // Invalidate consistency cache after logging
  consistencyService.invalidateCache(activityKey);
  
  return totalXp;
}

export function activityLabel(activityId: string): string {
  return activityId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
