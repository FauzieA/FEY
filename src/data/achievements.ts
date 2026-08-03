/**
 * Achievement System
 * 
 * Achievements are one-time milestones that celebrate memorable moments.
 * They function independently from leveling and award one-time XP bonuses.
 */

export type Rarity = "bronze" | "silver" | "gold" | "platinum" | "legendary";

export interface AchievementDefinition {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  hint: string;
  xpBonus: number;
  metric: string;
  target: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Training - Bronze
  {
    id: "first_workout",
    name: "First Steps",
    rarity: "bronze",
    description: "Complete your first workout",
    hint: "Log a workout in the training module",
    xpBonus: 25,
    metric: "workouts",
    target: 1,
  },
  {
    id: "dead_hang_30s",
    name: "Iron Grip",
    rarity: "bronze",
    description: "Hold a dead hang for 30 seconds",
    hint: "Practice dead hangs and reach 30 seconds",
    xpBonus: 30,
    metric: "dead_hang_seconds",
    target: 30,
  },
  {
    id: "five_workouts",
    name: "Getting Started",
    rarity: "bronze",
    description: "Complete 5 workouts",
    hint: "Keep showing up to the gym",
    xpBonus: 40,
    metric: "workouts",
    target: 5,
  },

  // Training - Silver
  {
    id: "assisted_pullup_20kg",
    name: "Pull-up Progress",
    rarity: "silver",
    description: "Reduce assisted pull-up weight by 20kg",
    hint: "Track your assisted pull-up progress",
    xpBonus: 75,
    metric: "pullup_weight_reduction",
    target: 20,
  },
  {
    id: "ten_workouts",
    name: "Building Momentum",
    rarity: "silver",
    description: "Complete 10 workouts",
    hint: "Consistency is key",
    xpBonus: 60,
    metric: "workouts",
    target: 10,
  },
  {
    id: "first_pr",
    name: "Record Breaker",
    rarity: "silver",
    description: "Set your first personal record",
    hint: "Push yourself to beat a previous best",
    xpBonus: 80,
    metric: "personal_records",
    target: 1,
  },

  // Training - Gold
  {
    id: "twenty_workouts",
    name: "Dedicated",
    rarity: "gold",
    description: "Complete 20 workouts",
    hint: "You're building a real habit",
    xpBonus: 100,
    metric: "workouts",
    target: 20,
  },
  {
    id: "unassisted_pullup",
    name: "Bodyweight Mastery",
    rarity: "gold",
    description: "Complete an unassisted pull-up",
    hint: "The milestone of true pulling strength",
    xpBonus: 150,
    metric: "unassisted_pullup",
    target: 1,
  },

  // Faith - Bronze
  {
    id: "first_prayer_log",
    name: "First Prayer",
    rarity: "bronze",
    description: "Log your first prayer",
    hint: "Start tracking your salah",
    xpBonus: 20,
    metric: "prayer_logs",
    target: 1,
  },
  {
    id: "first_adhkar",
    name: "Morning Remembrance",
    rarity: "bronze",
    description: "Complete morning adhkar",
    hint: "Start your day with dhikr",
    xpBonus: 25,
    metric: "adhkar_completions",
    target: 1,
  },

  // Faith - Silver
  {
    id: "salah_streak_7",
    name: "Week of Devotion",
    rarity: "silver",
    description: "Maintain a 7-day salah streak",
    hint: "Complete all five prayers for 7 consecutive days",
    xpBonus: 100,
    metric: "salah_streak",
    target: 7,
  },
  {
    id: "first_quran_session",
    name: "Opening the Book",
    rarity: "silver",
    description: "Log your first Quran reading session",
    hint: "Start tracking your Quran reading",
    xpBonus: 40,
    metric: "quran_sessions",
    target: 1,
  },

  // Faith - Gold
  {
    id: "salah_streak_30",
    name: "Month of Faith",
    rarity: "gold",
    description: "Maintain a 30-day salah streak",
    hint: "Complete all five prayers for 30 consecutive days",
    xpBonus: 250,
    metric: "salah_streak",
    target: 30,
  },
  {
    id: "first_page_memorized",
    name: "First Page",
    rarity: "gold",
    description: "Memorize your first page of the Quran",
    hint: "Start your memorization journey",
    xpBonus: 150,
    metric: "memorized_pages",
    target: 1,
  },

  // Faith - Platinum
  {
    id: "salah_streak_90",
    name: "Quarter of Devotion",
    rarity: "platinum",
    description: "Maintain a 90-day salah streak",
    hint: "Three months of consistent prayer",
    xpBonus: 500,
    metric: "salah_streak",
    target: 90,
  },
  {
    id: "surah_memorized",
    name: "Hafidh in Progress",
    rarity: "platinum",
    description: "Memorize an entire surah",
    hint: "Complete memorization of any surah",
    xpBonus: 400,
    metric: "surahs_memorized",
    target: 1,
  },

  // Library - Bronze
  {
    id: "first_book",
    name: "First Page",
    rarity: "bronze",
    description: "Start your first book",
    hint: "Add a book to your library",
    xpBonus: 20,
    metric: "books_started",
    target: 1,
  },

  // Library - Silver
  {
    id: "first_book_finished",
    name: "Bookworm",
    rarity: "silver",
    description: "Finish your first book",
    hint: "Complete a book from start to finish",
    xpBonus: 75,
    metric: "books_finished",
    target: 1,
  },
  {
    id: "ten_reading_sessions",
    name: "Regular Reader",
    rarity: "silver",
    description: "Complete 10 reading sessions",
    hint: "Build a reading habit",
    xpBonus: 60,
    metric: "reading_sessions",
    target: 10,
  },

  // Library - Gold
  {
    id: "ten_books_finished",
    name: "Well Read",
    rarity: "gold",
    description: "Finish 10 books",
    hint: "A significant reading achievement",
    xpBonus: 200,
    metric: "books_finished",
    target: 10,
  },

  // Wealth - Bronze
  {
    id: "first_savings",
    name: "First Savings",
    rarity: "bronze",
    description: "Make your first savings deposit",
    hint: "Start building your savings habit",
    xpBonus: 25,
    metric: "savings_deposits",
    target: 1,
  },

  // Wealth - Silver
  {
    id: "saved_500",
    name: "Saver",
    rarity: "silver",
    description: "Save 500 in your currency",
    hint: "Build your savings to 500",
    xpBonus: 75,
    metric: "total_saved",
    target: 500,
  },
  {
    id: "first_goal",
    name: "Goal Setter",
    rarity: "silver",
    description: "Create your first savings goal",
    hint: "Set a target to work toward",
    xpBonus: 50,
    metric: "savings_goals",
    target: 1,
  },

  // Wealth - Gold
  {
    id: "saved_1000",
    name: "Thousand Saver",
    rarity: "gold",
    description: "Save 1,000 in your currency",
    hint: "Reach a significant savings milestone",
    xpBonus: 150,
    metric: "total_saved",
    target: 1000,
  },
  {
    id: "goal_completed",
    name: "Goal Achiever",
    rarity: "gold",
    description: "Complete your first savings goal",
    hint: "Reach a savings target you set",
    xpBonus: 125,
    metric: "goals_completed",
    target: 1,
  },

  // Perfumery - Bronze
  {
    id: "first_formula",
    name: "First Formula",
    rarity: "bronze",
    description: "Create your first perfume formula",
    hint: "Start your perfumery journey",
    xpBonus: 30,
    metric: "perfume_formulas",
    target: 1,
  },

  // Perfumery - Silver
  {
    id: "first_version",
    name: "First Blend",
    rarity: "silver",
    description: "Create your first perfume version",
    hint: "Blend your first iteration",
    xpBonus: 50,
    metric: "perfume_versions",
    target: 1,
  },

  // Perfumery - Gold
  {
    id: "five_formulas",
    name: "Perfumer",
    rarity: "gold",
    description: "Create 5 perfume formulas",
    hint: "Build your collection",
    xpBonus: 125,
    metric: "perfume_formulas",
    target: 5,
  },

  // Life - Bronze
  {
    id: "first_journal",
    name: "First Entry",
    rarity: "bronze",
    description: "Write your first journal entry",
    hint: "Start reflecting on your days",
    xpBonus: 20,
    metric: "journal_entries",
    target: 1,
  },

  // Life - Silver
  {
    id: "ten_journals",
    name: "Reflective",
    rarity: "silver",
    description: "Write 10 journal entries",
    hint: "Build a journaling habit",
    xpBonus: 60,
    metric: "journal_entries",
    target: 10,
  },

  // Life - Gold
  {
    id: "thirty_journals",
    name: "Chronicler",
    rarity: "gold",
    description: "Write 30 journal entries",
    hint: "A month of reflection",
    xpBonus: 150,
    metric: "journal_entries",
    target: 30,
  },

  // Legendary - Cross-module
  {
    id: "streak_30",
    name: "Unstoppable",
    rarity: "legendary",
    description: "Maintain a 30-day activity streak across any module",
    hint: "Show up every day for a month",
    xpBonus: 500,
    metric: "activity_streak",
    target: 30,
  },
  {
    id: "all_modules_touched",
    name: "Whole Life",
    rarity: "legendary",
    description: "Log activity in all 7 modules",
    hint: "Engage with every aspect of FEY",
    xpBonus: 400,
    metric: "modules_touched",
    target: 7,
  },
];

export const RARITY_COLORS: Record<Rarity, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  legendary: "#FF6B35",
};

export const RARITY_ORDER: Rarity[] = ["bronze", "silver", "gold", "platinum", "legendary"];

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
}

export function getAchievementsByRarity(rarity: Rarity): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => a.rarity === rarity);
}
