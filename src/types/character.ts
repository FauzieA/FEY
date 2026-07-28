export interface CharacterStats {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  levelProgressPercent: number;
  
  // Attributes
  strengthLevel: number;
  athleticismLevel: number;
  mobilityLevel: number;
  balanceLevel: number;
  enduranceLevel: number;
  gripLevel: number;
  coreLevel: number;

  // Identity
  primaryClass: string;
  secondaryClass: string;
  currentFocus: string;
  trainingStyle: string;

  // Lifetime Stats
  gymSessionsCount: number;
  strengthSessionsCount: number;
  classesCount: number;
  mobilitySessionsCount: number;
  prCount: number;
  milestonesCount: number;
  currentStreak: number;
  longestStreak: number;
  hoursTrained: number;
}

export interface SkillNode {
  name: string;
  completed: boolean;
}

export interface SkillTreeGroup {
  categoryName: string;
  skills: SkillNode[];
}

export interface TitleItem {
  id: string;
  name: string;
  unlocked: boolean;
}

export interface QuestItem {
  title: string;
  progressPercent: number;
}