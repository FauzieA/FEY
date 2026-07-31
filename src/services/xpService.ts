import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { today } from "@/utils/date";
import type { AttributeId, XpEvent, XpModule } from "@/types/modules";

/**
 * Every activity in FEY awards experience toward one character attribute.
 * This is the single registry of what an action is worth, so any module can
 * contribute to the character without duplicating scoring rules.
 */
export interface ActivityRule {
  id: string;
  label: string;
  module: XpModule;
  attribute: AttributeId;
  xp: number;
}

export const ACTIVITY_RULES = {
  /* Training */
  workout_session: { id: "workout_session", label: "Workout logged", module: "training", attribute: "strength", xp: 60 },
  workout_set: { id: "workout_set", label: "Set completed", module: "training", attribute: "strength", xp: 5 },
  daily_movement: { id: "daily_movement", label: "Daily movement", module: "training", attribute: "vitality", xp: 15 },
  personal_record: { id: "personal_record", label: "Personal record", module: "training", attribute: "strength", xp: 80 },

  /* Faith */
  prayer_logged: { id: "prayer_logged", label: "Prayer on time", module: "faith", attribute: "devotion", xp: 20 },
  quran_reading: { id: "quran_reading", label: "Qur'an reading", module: "faith", attribute: "devotion", xp: 30 },
  quran_memorization: { id: "quran_memorization", label: "New memorization", module: "faith", attribute: "devotion", xp: 90 },
  quran_revision: { id: "quran_revision", label: "Revision session", module: "faith", attribute: "devotion", xp: 35 },
  adhkar_logged: { id: "adhkar_logged", label: "Adhkar", module: "faith", attribute: "devotion", xp: 15 },
  fast_made_up: { id: "fast_made_up", label: "Missed fast made up", module: "faith", attribute: "discipline", xp: 70 },

  /* Health */
  weight_logged: { id: "weight_logged", label: "Weight logged", module: "health", attribute: "vitality", xp: 10 },
  measurement_logged: { id: "measurement_logged", label: "Measurements taken", module: "health", attribute: "vitality", xp: 40 },
  sleep_logged: { id: "sleep_logged", label: "Sleep logged", module: "health", attribute: "vitality", xp: 12 },
  cycle_logged: { id: "cycle_logged", label: "Cycle logged", module: "health", attribute: "vitality", xp: 20 },
  health_note: { id: "health_note", label: "Health note", module: "health", attribute: "vitality", xp: 10 },

  /* Library */
  reading_session: { id: "reading_session", label: "Reading session", module: "library", attribute: "knowledge", xp: 25 },
  book_finished: { id: "book_finished", label: "Book finished", module: "library", attribute: "knowledge", xp: 150 },
  book_added: { id: "book_added", label: "Book added", module: "library", attribute: "knowledge", xp: 10 },

  /* Perfumery */
  formula_created: { id: "formula_created", label: "Formula created", module: "perfumery", attribute: "craft", xp: 50 },
  version_logged: { id: "version_logged", label: "Version blended", module: "perfumery", attribute: "craft", xp: 40 },

  /* Wealth */
  savings_deposit: { id: "savings_deposit", label: "Savings deposit", module: "wealth", attribute: "stewardship", xp: 30 },
  goal_created: { id: "goal_created", label: "Savings goal set", module: "wealth", attribute: "stewardship", xp: 20 },
  goal_completed: { id: "goal_completed", label: "Savings goal reached", module: "wealth", attribute: "stewardship", xp: 200 },
  purchase_planned: { id: "purchase_planned", label: "Purchase planned", module: "wealth", attribute: "stewardship", xp: 15 },

  /* Life */
  journal_entry: { id: "journal_entry", label: "Journal entry", module: "life", attribute: "discipline", xp: 30 },
  person_contacted: { id: "person_contacted", label: "Person reached out to", module: "life", attribute: "connection", xp: 40 },
  timeline_event: { id: "timeline_event", label: "Timeline event", module: "life", attribute: "connection", xp: 20 },
} satisfies Record<string, ActivityRule>;

export type ActivityId = keyof typeof ACTIVITY_RULES;

/** Records an XP event for an activity. Multiplier scales repeated units (sets, pages...). */
export async function logActivity(
  activity: ActivityId,
  options: { multiplier?: number; date?: string } = {},
): Promise<number> {
  const rule = ACTIVITY_RULES[activity] as ActivityRule;
  const multiplier = options.multiplier ?? 1;
  const amount = Math.round(rule.xp * multiplier);

  const event: XpEvent = {
    module: rule.module,
    activity: rule.id,
    attribute: rule.attribute,
    amount,
    date: options.date ?? today(),
    createdAt: new Date().toISOString(),
  };

  // Save to local Dexie immediately
  await db.xpEvents.add(event);
  
  // Queue sync to backend
  syncService.queueSync('xp', event);
  
  return amount;
}

export function activityLabel(activityId: string): string {
  return (ACTIVITY_RULES as Record<string, ActivityRule>)[activityId]?.label ?? activityId;
}
