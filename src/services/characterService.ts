import type { AttributeId, XpEvent } from "@/types/modules";
import { currentStreak, longestStreak } from "@/utils/date";
import { percent } from "@/utils/format";

/* -------------------------------------------------------------------------- */
/*                                 ATTRIBUTES                                 */
/* -------------------------------------------------------------------------- */

export interface AttributeDefinition {
  id: AttributeId;
  name: string;
  description: string;
  /** Modules that feed this attribute, for display. */
  sources: string[];
}

export const ATTRIBUTE_DEFINITIONS: AttributeDefinition[] = [
  { id: "discipline", name: "Discipline", description: "Doing what I said I would do", sources: ["Life", "Faith"] },
  { id: "devotion", name: "Devotion", description: "Consistency in worship", sources: ["Faith"] },
  { id: "strength", name: "Strength", description: "Physical capacity under load", sources: ["Training"] },
  { id: "vitality", name: "Vitality", description: "Rest, recovery and body care", sources: ["Health", "Training"] },
  { id: "knowledge", name: "Knowledge", description: "What I read and retain", sources: ["Library"] },
  { id: "craft", name: "Craft", description: "Making things with my hands", sources: ["Perfumery"] },
  { id: "stewardship", name: "Stewardship", description: "How I handle what I own", sources: ["Wealth"] },
  { id: "connection", name: "Connection", description: "The people I keep close", sources: ["Life"] },
];

/** XP required to reach each attribute level grows quadratically. */
const ATTRIBUTE_LEVEL_SPAN = 250;

export function attributeLevel(xp: number): { level: number; intoLevel: number; span: number; progress: number } {
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * xp) / ATTRIBUTE_LEVEL_SPAN)) / 2));
  const base = ((level - 1) * level * ATTRIBUTE_LEVEL_SPAN) / 2;
  const span = level * ATTRIBUTE_LEVEL_SPAN;
  const intoLevel = Math.max(0, xp - base);
  return { level, intoLevel, span, progress: percent(intoLevel, span) };
}

/* -------------------------------------------------------------------------- */
/*                                   LEVELS                                   */
/* -------------------------------------------------------------------------- */

/** Total XP needed to go from `level` to `level + 1`. */
export function levelSpan(level: number): number {
  return 400 + (level - 1) * 150;
}

export function resolveLevel(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  progress: number;
} {
  let level = 1;
  let remaining = totalXp;

  while (remaining >= levelSpan(level) && level < 99) {
    remaining -= levelSpan(level);
    level += 1;
  }

  const xpForNextLevel = levelSpan(level);
  return { level, xpInLevel: remaining, xpForNextLevel, progress: percent(remaining, xpForNextLevel) };
}

export interface TitleDefinition {
  id: string;
  name: string;
  minLevel: number;
  description: string;
}

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  { id: "seeker", name: "The Seeker", minLevel: 1, description: "Beginning to build deliberately" },
  { id: "apprentice", name: "The Apprentice", minLevel: 4, description: "Habits are taking shape" },
  { id: "steadfast", name: "The Steadfast", minLevel: 8, description: "Consistency across several domains" },
  { id: "artisan", name: "The Artisan", minLevel: 13, description: "Craft and body developed together" },
  { id: "custodian", name: "The Custodian", minLevel: 19, description: "Trusted with wealth, health and people" },
  { id: "architect", name: "The Architect", minLevel: 26, description: "Designing the life, not reacting to it" },
  { id: "luminary", name: "The Luminary", minLevel: 35, description: "Character visible in every module" },
];

export function titleForLevel(level: number): TitleDefinition {
  return [...TITLE_DEFINITIONS].reverse().find((t) => level >= t.minLevel) ?? TITLE_DEFINITIONS[0];
}

/* -------------------------------------------------------------------------- */
/*                                   METRICS                                  */
/* -------------------------------------------------------------------------- */

/** Counters every skill and achievement is measured against. */
export interface CharacterMetrics {
  workouts: number;
  trainingVolumeKg: number;
  personalRecords: number;
  prayersLogged: number;
  completePrayerDays: number;
  quranSessions: number;
  memorizedPassages: number;
  revisions: number;
  adhkarDays: number;
  fastsMadeUp: number;
  fastsOutstanding: number;
  weightLogs: number;
  measurements: number;
  sleepLogs: number;
  booksFinished: number;
  readingSessions: number;
  perfumeFormulas: number;
  perfumeVersions: number;
  savedTotal: number;
  goalsCompleted: number;
  journalEntries: number;
  peopleTracked: number;
  contactsMade: number;
  timelineEvents: number;
  activeDays: number;
  streak: number;
  longestStreak: number;
  modulesTouched: number;
}

export const EMPTY_METRICS: CharacterMetrics = {
  workouts: 0,
  trainingVolumeKg: 0,
  personalRecords: 0,
  prayersLogged: 0,
  completePrayerDays: 0,
  quranSessions: 0,
  memorizedPassages: 0,
  revisions: 0,
  adhkarDays: 0,
  fastsMadeUp: 0,
  fastsOutstanding: 0,
  weightLogs: 0,
  measurements: 0,
  sleepLogs: 0,
  booksFinished: 0,
  readingSessions: 0,
  perfumeFormulas: 0,
  perfumeVersions: 0,
  savedTotal: 0,
  goalsCompleted: 0,
  journalEntries: 0,
  peopleTracked: 0,
  contactsMade: 0,
  timelineEvents: 0,
  activeDays: 0,
  streak: 0,
  longestStreak: 0,
  modulesTouched: 0,
};

/* -------------------------------------------------------------------------- */
/*                              SKILLS & TROPHIES                             */
/* -------------------------------------------------------------------------- */

export interface SkillDefinition {
  id: string;
  name: string;
  branch: string;
  metric: keyof CharacterMetrics;
  target: number;
  description: string;
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  { id: "iron_base", name: "Iron Base", branch: "Body", metric: "workouts", target: 12, description: "12 workouts logged" },
  { id: "load_bearer", name: "Load Bearer", branch: "Body", metric: "trainingVolumeKg", target: 25_000, description: "25,000 kg moved" },
  { id: "record_breaker", name: "Record Breaker", branch: "Body", metric: "personalRecords", target: 5, description: "5 personal records" },
  { id: "restorer", name: "Restorer", branch: "Body", metric: "sleepLogs", target: 20, description: "20 nights of sleep tracked" },

  { id: "five_pillars", name: "Five a Day", branch: "Spirit", metric: "completePrayerDays", target: 7, description: "7 days of all five prayers" },
  { id: "reciter", name: "Reciter", branch: "Spirit", metric: "quranSessions", target: 15, description: "15 Qur'an reading sessions" },
  { id: "hafidha_path", name: "Path of Hifdh", branch: "Spirit", metric: "memorizedPassages", target: 5, description: "5 passages memorized" },
  { id: "guardian_of_dhikr", name: "Guardian of Dhikr", branch: "Spirit", metric: "adhkarDays", target: 14, description: "14 days of adhkar" },

  { id: "reader", name: "Reader", branch: "Mind", metric: "booksFinished", target: 3, description: "3 books finished" },
  { id: "scholar", name: "Scholar", branch: "Mind", metric: "readingSessions", target: 30, description: "30 reading sessions" },
  { id: "chronicler", name: "Chronicler", branch: "Mind", metric: "journalEntries", target: 20, description: "20 journal entries" },

  { id: "perfumer", name: "Perfumer", branch: "Craft", metric: "perfumeFormulas", target: 3, description: "3 formulas created" },
  { id: "iterator", name: "Iterator", branch: "Craft", metric: "perfumeVersions", target: 10, description: "10 versions blended" },

  { id: "saver", name: "Saver", branch: "Stewardship", metric: "savedTotal", target: 1_000, description: "1,000 saved" },
  { id: "goal_keeper", name: "Goal Keeper", branch: "Stewardship", metric: "goalsCompleted", target: 2, description: "2 savings goals reached" },

  { id: "kinkeeper", name: "Kinkeeper", branch: "People", metric: "contactsMade", target: 15, description: "15 intentional check-ins" },
  { id: "witness", name: "Witness", branch: "People", metric: "timelineEvents", target: 10, description: "10 timeline events" },
];

export interface AchievementDefinition {
  id: string;
  name: string;
  metric: keyof CharacterMetrics;
  target: number;
  description: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: "first_steps", name: "First Steps", metric: "activeDays", target: 1, description: "Log anything in FEY" },
  { id: "week_alive", name: "Seven Days Awake", metric: "streak", target: 7, description: "A 7-day activity streak" },
  { id: "month_alive", name: "Thirty Days Deliberate", metric: "streak", target: 30, description: "A 30-day activity streak" },
  { id: "whole_life", name: "Whole Life", metric: "modulesTouched", target: 7, description: "Activity in 7 modules" },
  { id: "iron_will", name: "Iron Will", metric: "workouts", target: 50, description: "50 workouts logged" },
  { id: "devoted", name: "Devoted", metric: "completePrayerDays", target: 30, description: "30 complete prayer days" },
  { id: "well_read", name: "Well Read", metric: "booksFinished", target: 10, description: "10 books finished" },
  { id: "nose", name: "The Nose", metric: "perfumeVersions", target: 25, description: "25 perfume versions" },
  { id: "provider", name: "Provider", metric: "savedTotal", target: 5_000, description: "5,000 saved" },
  { id: "present", name: "Present", metric: "contactsMade", target: 50, description: "50 intentional check-ins" },
  { id: "debt_free_fasts", name: "Debt Cleared", metric: "fastsMadeUp", target: 5, description: "5 missed fasts made up" },
];

/* -------------------------------------------------------------------------- */
/*                              CHARACTER SUMMARY                             */
/* -------------------------------------------------------------------------- */

export interface AttributeSummary extends AttributeDefinition {
  xp: number;
  level: number;
  progress: number;
  intoLevel: number;
  span: number;
}

export interface SkillSummary extends SkillDefinition {
  value: number;
  progress: number;
  unlocked: boolean;
}

export interface AchievementSummary extends AchievementDefinition {
  value: number;
  progress: number;
  unlocked: boolean;
}

export interface CharacterSummary {
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  progress: number;
  title: TitleDefinition;
  nextTitle: TitleDefinition | null;
  attributes: AttributeSummary[];
  skills: SkillSummary[];
  achievements: AchievementSummary[];
  xpByModule: { module: string; xp: number }[];
  xpToday: number;
  xpThisWeek: number;
  streak: number;
  longestStreak: number;
  recentEvents: XpEvent[];
}

export function buildCharacter(
  events: XpEvent[],
  metrics: CharacterMetrics,
  weekStart: string,
  todayIso: string,
): CharacterSummary {
  const totalXp = events.reduce((sum, e) => sum + e.amount, 0);
  const { level, xpInLevel, xpForNextLevel, progress } = resolveLevel(totalXp);

  const xpByAttribute = new Map<AttributeId, number>();
  const xpByModule = new Map<string, number>();
  for (const event of events) {
    xpByAttribute.set(event.attribute, (xpByAttribute.get(event.attribute) ?? 0) + event.amount);
    xpByModule.set(event.module, (xpByModule.get(event.module) ?? 0) + event.amount);
  }

  const attributes: AttributeSummary[] = ATTRIBUTE_DEFINITIONS.map((definition) => {
    const xp = xpByAttribute.get(definition.id) ?? 0;
    const resolved = attributeLevel(xp);
    return { ...definition, xp, ...resolved };
  });

  const eventDates = events.map((e) => e.date);
  const streak = metrics.streak || currentStreak(eventDates);
  const longest = Math.max(metrics.longestStreak, longestStreak(eventDates));

  const skills: SkillSummary[] = SKILL_DEFINITIONS.map((skill) => {
    const value = metrics[skill.metric];
    return { ...skill, value, progress: percent(value, skill.target), unlocked: value >= skill.target };
  });

  const achievements: AchievementSummary[] = ACHIEVEMENT_DEFINITIONS.map((achievement) => {
    const value = achievement.metric === "streak" ? Math.max(streak, longest) : metrics[achievement.metric];
    return {
      ...achievement,
      value,
      progress: percent(value, achievement.target),
      unlocked: value >= achievement.target,
    };
  });

  const title = titleForLevel(level);
  const nextTitle = TITLE_DEFINITIONS.find((t) => t.minLevel > level) ?? null;

  return {
    totalXp,
    level,
    xpInLevel,
    xpForNextLevel,
    progress,
    title,
    nextTitle,
    attributes,
    skills,
    achievements,
    xpByModule: [...xpByModule.entries()].map(([module, xp]) => ({ module, xp })).sort((a, b) => b.xp - a.xp),
    xpToday: events.filter((e) => e.date === todayIso).reduce((sum, e) => sum + e.amount, 0),
    xpThisWeek: events.filter((e) => e.date >= weekStart).reduce((sum, e) => sum + e.amount, 0),
    streak,
    longestStreak: longest,
    recentEvents: [...events]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12),
  };
}
