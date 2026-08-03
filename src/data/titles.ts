/**
 * Title System
 * 
 * Titles represent identity rather than just numerical levels.
 * Each title unlocks at a specific character level and represents a stage in the journey.
 */

export interface TitleDefinition {
  id: string;
  name: string;
  minLevel: number;
  description: string;
  flavorText: string;
}

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  {
    id: "beginner",
    name: "The Beginner",
    minLevel: 1,
    description: "Every journey begins with a single step",
    flavorText: "You've started showing up. That's everything.",
  },
  {
    id: "consistent",
    name: "The Consistent",
    minLevel: 3,
    description: "Showing up when it's easy and when it's hard",
    flavorText: "You're building the habit of showing up.",
  },
  {
    id: "disciplined",
    name: "The Disciplined",
    minLevel: 6,
    description: "Doing what you said you would do, even when you don't feel like it",
    flavorText: "Your word to yourself is becoming your bond.",
  },
  {
    id: "resolute",
    name: "The Resolute",
    minLevel: 10,
    description: "Unwavering commitment to your path",
    flavorText: "Obstacles have become stepping stones.",
  },
  {
    id: "builder",
    name: "The Builder",
    minLevel: 15,
    description: "Constructing habits that will last a lifetime",
    flavorText: "You're not just improving yourself—you're building a life.",
  },
  {
    id: "warrior",
    name: "The Warrior",
    minLevel: 20,
    description: "Fighting for the person you're becoming",
    flavorText: "The battle is with yourself, and you're winning.",
  },
  {
    id: "sage",
    name: "The Sage",
    minLevel: 28,
    description: "Wisdom born from experience and reflection",
    flavorText: "You've learned that progress is not a straight line.",
  },
  {
    id: "guardian",
    name: "The Guardian",
    minLevel: 38,
    description: "Protecting your habits, your time, and your growth",
    flavorText: "You defend what matters most.",
  },
  {
    id: "master",
    name: "The Master",
    minLevel: 50,
    description: "Excellence has become your default",
    flavorText: "You no longer chase growth—you embody it.",
  },
];

export function getTitleForLevel(level: number): TitleDefinition {
  return [...TITLE_DEFINITIONS].reverse().find((t) => level >= t.minLevel) ?? TITLE_DEFINITIONS[0];
}

export function getNextTitle(currentLevel: number): TitleDefinition | null {
  return TITLE_DEFINITIONS.find((t) => t.minLevel > currentLevel) ?? null;
}
