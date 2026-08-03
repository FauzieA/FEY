/**
 * FEY XP System
 * 
 * Core philosophy: Every meaningful action earns Base XP, modified by Effort Multiplier and Consistency Bonus.
 * Final XP = Base XP × Effort Multiplier × Consistency Multiplier
 */

export type Difficulty = "easy" | "medium" | "hard" | "milestone";

export interface ActivityConfig {
  baseXp: number;
  primaryAttribute: AttributeId;
  secondaryAttributes: { attribute: AttributeId; percentage: number }[];
  defaultDifficulty: Difficulty;
}

export type AttributeId = "strength" | "discipline" | "devotion" | "vitality" | "knowledge" | "stewardship" | "craft" | "connection";

export const ATTRIBUTE_NAMES: Record<AttributeId, string> = {
  strength: "Strength",
  discipline: "Discipline",
  devotion: "Faith",
  vitality: "Health",
  knowledge: "Knowledge",
  stewardship: "Finance",
  craft: "Creativity",
  connection: "Connection",
};

export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeId, string> = {
  strength: "Physical capacity and resilience",
  discipline: "Doing what you said you would do",
  devotion: "Consistency in worship and spiritual growth",
  vitality: "Rest, recovery, and body care",
  knowledge: "What you read, learn, and retain",
  stewardship: "How you handle money and resources",
  craft: "Making things with your hands and mind",
  connection: "The people you keep close",
};

/* -------------------------------------------------------------------------- */
/*                               BASE XP VALUES                               */
/* -------------------------------------------------------------------------- */

/**
 * Base XP values for different activities.
 * These are intentionally modest to make leveling meaningful over time.
 */
export const BASE_XP_VALUES: Record<string, ActivityConfig> = {
  // Training
  gym_workout: { baseXp: 25, primaryAttribute: "strength", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "medium" },
  home_workout: { baseXp: 18, primaryAttribute: "strength", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "easy" },
  mobility_session: { baseXp: 15, primaryAttribute: "vitality", secondaryAttributes: [{ attribute: "discipline", percentage: 20 }], defaultDifficulty: "easy" },
  personal_record: { baseXp: 40, primaryAttribute: "strength", secondaryAttributes: [{ attribute: "discipline", percentage: 20 }], defaultDifficulty: "hard" },

  // Faith
  all_prayers: { baseXp: 15, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "discipline", percentage: 40 }], defaultDifficulty: "medium" },
  morning_adhkar: { baseXp: 10, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "easy" },
  evening_adhkar: { baseXp: 10, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "easy" },
  quran_reading: { baseXp: 12, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "knowledge", percentage: 20 }, { attribute: "discipline", percentage: 20 }], defaultDifficulty: "easy" },
  memorization: { baseXp: 20, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "knowledge", percentage: 20 }, { attribute: "discipline", percentage: 30 }], defaultDifficulty: "medium" },
  surah_memorized: { baseXp: 100, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "milestone" },
  fast_completed: { baseXp: 15, primaryAttribute: "devotion", secondaryAttributes: [{ attribute: "discipline", percentage: 40 }], defaultDifficulty: "medium" },

  // Library
  book_finished: { baseXp: 50, primaryAttribute: "knowledge", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "hard" },
  reading_session: { baseXp: 8, primaryAttribute: "knowledge", secondaryAttributes: [{ attribute: "discipline", percentage: 20 }], defaultDifficulty: "easy" },

  // Wealth
  savings_deposit: { baseXp: 10, primaryAttribute: "stewardship", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "easy" },
  goal_reached: { baseXp: 30, primaryAttribute: "stewardship", secondaryAttributes: [{ attribute: "discipline", percentage: 20 }], defaultDifficulty: "medium" },

  // Perfumery
  formula_completed: { baseXp: 20, primaryAttribute: "craft", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "medium" },
  version_blended: { baseXp: 12, primaryAttribute: "craft", secondaryAttributes: [{ attribute: "discipline", percentage: 20 }], defaultDifficulty: "easy" },

  // Life
  journal_entry: { baseXp: 8, primaryAttribute: "knowledge", secondaryAttributes: [{ attribute: "discipline", percentage: 30 }], defaultDifficulty: "easy" },
  contact_made: { baseXp: 10, primaryAttribute: "connection", secondaryAttributes: [], defaultDifficulty: "easy" },

  // Health
  sleep_logged: { baseXp: 5, primaryAttribute: "vitality", secondaryAttributes: [], defaultDifficulty: "easy" },
  weight_logged: { baseXp: 3, primaryAttribute: "vitality", secondaryAttributes: [], defaultDifficulty: "easy" },
};

/* -------------------------------------------------------------------------- */
/*                            EFFORT MULTIPLIER                               */
/* -------------------------------------------------------------------------- */

export const EFFORT_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.15,
  hard: 1.3,
  milestone: 1.75,
};

/**
 * Calculate consistency multiplier based on consecutive days of activity.
 * Starts at ×1.00, reaches ×1.10 after 1 week, ×1.20 after 1 month, max ×1.50.
 * Missing a day resets the multiplier but does not remove earned XP.
 */
export function calculateConsistencyMultiplier(consecutiveDays: number): number {
  if (consecutiveDays === 0) return 1.0;
  
  // Formula: 1.0 + (log10(consecutiveDays + 1) * 0.15), capped at 1.50
  const multiplier = 1.0 + Math.log10(consecutiveDays + 1) * 0.15;
  return Math.min(1.50, multiplier);
}

/* -------------------------------------------------------------------------- */
/*                           XP CALCULATION                                  */
/* -------------------------------------------------------------------------- */

export interface XpResult {
  totalXp: number;
  breakdown: {
    attribute: AttributeId;
    xp: number;
  }[];
}

/**
 * Calculate final XP for an activity with all modifiers applied.
 * Distributes XP proportionally among relevant attributes.
 */
export function calculateActivityXp(
  activityKey: string,
  consecutiveDays: number,
  difficulty?: Difficulty
): XpResult {
  const config = BASE_XP_VALUES[activityKey];
  if (!config) {
    console.warn(`Unknown activity key: ${activityKey}`);
    return { totalXp: 0, breakdown: [] };
  }

  const effortMultiplier = EFFORT_MULTIPLIERS[difficulty || config.defaultDifficulty];
  const consistencyMultiplier = calculateConsistencyMultiplier(consecutiveDays);
  
  const baseXp = config.baseXp;
  const finalXp = Math.round(baseXp * effortMultiplier * consistencyMultiplier);

  // Distribute XP among attributes
  const breakdown: XpResult["breakdown"] = [];
  
  // Primary attribute gets the remaining percentage
  const secondaryTotal = config.secondaryAttributes.reduce((sum, attr) => sum + attr.percentage, 0);
  const primaryPercentage = 100 - secondaryTotal;
  
  breakdown.push({
    attribute: config.primaryAttribute,
    xp: Math.round(finalXp * (primaryPercentage / 100)),
  });
  
  config.secondaryAttributes.forEach((attr) => {
    breakdown.push({
      attribute: attr.attribute,
      xp: Math.round(finalXp * (attr.percentage / 100)),
    });
  });

  return {
    totalXp: breakdown.reduce((sum, b) => sum + b.xp, 0),
    breakdown,
  };
}

/* -------------------------------------------------------------------------- */
/*                        LEVEL PROGRESSION                                   */
/* -------------------------------------------------------------------------- */

/**
 * Exponential level progression.
 * Level 2: 250 XP, Level 3: 600 XP, Level 4: 1050 XP, Level 5: 1650 XP
 * Formula: cumulative XP required for level n
 */
export function getCumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Formula: 50 * level^2 + 50 * level - 100
  // This gives: L2=250, L3=600, L4=1050, L5=1650, L6=2360, L7=3180, L8=4110, etc.
  return 50 * level * level + 50 * level - 100;
}

export function getXpRequiredForNextLevel(currentLevel: number): number {
  const currentCumulative = getCumulativeXpForLevel(currentLevel);
  const nextCumulative = getCumulativeXpForLevel(currentLevel + 1);
  return nextCumulative - currentCumulative;
}

export function getLevelFromTotalXp(totalXp: number): number {
  let level = 1;
  while (getCumulativeXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
}

export function getLevelInfo(totalXp: number): LevelInfo {
  const level = getLevelFromTotalXp(totalXp);
  const cumulativeAtLevel = getCumulativeXpForLevel(level);
  const xpInCurrentLevel = totalXp - cumulativeAtLevel;
  const xpRequiredForNextLevel = getXpRequiredForNextLevel(level);
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  return {
    level,
    totalXp,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent,
  };
}

/* -------------------------------------------------------------------------- */
/*                        ESTIMATED ACTIONS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Estimate how many actions of various types are needed to reach the next level.
 * Returns a human-readable description.
 */
export function estimateActionsToNextLevel(xpNeeded: number): string {
  const actions: string[] = [];
  
  // Estimate based on typical activities
  const gymWorkoutsNeeded = Math.ceil(xpNeeded / 25); // 25 XP base
  const adhkarNeeded = Math.ceil(xpNeeded / 10); // 10 XP base
  const booksNeeded = Math.ceil(xpNeeded / 50); // 50 XP base
  
  if (gymWorkoutsNeeded > 0) actions.push(`${gymWorkoutsNeeded} workout${gymWorkoutsNeeded > 1 ? 's' : ''}`);
  if (adhkarNeeded > 0) actions.push(`${adhkarNeeded} day${adhkarNeeded > 1 ? 's' : ''} of adhkar`);
  if (booksNeeded > 0 && booksNeeded < 5) actions.push(`${booksNeeded} book${booksNeeded > 1 ? 's' : ''}`);
  
  if (actions.length === 0) return "Just a few more actions";
  if (actions.length === 1) return `Approximately ${actions[0]} until your next level`;
  return `Approximately ${actions.slice(0, -1).join(", ")} and ${actions[actions.length - 1]} until your next level`;
}
