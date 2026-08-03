/**
 * Journey Timeline Service
 * 
 * Records meaningful moments in chronological order as a living autobiography.
 * Timeline entries include level unlocks, achievements, milestones, and significant events.
 */

export type TimelineEventType = 
  | "level_up"
  | "title_unlocked"
  | "achievement_unlocked"
  | "workout_milestone"
  | "faith_milestone"
  | "reading_milestone"
  | "wealth_milestone"
  | "life_milestone";

export interface TimelineEntry {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description: string;
  icon?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate timeline entries from various activities and achievements.
 * This would typically be called when processing XP events or checking achievements.
 */
export function generateTimelineEntry(
  type: TimelineEventType,
  title: string,
  description: string,
  date: string,
  metadata?: Record<string, any>
): TimelineEntry {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date,
    type,
    title,
    description,
    metadata,
  };
}

/**
 * Format a timeline entry for display
 */
export function formatTimelineEntry(entry: TimelineEntry): string {
  switch (entry.type) {
    case "level_up":
      return `Reached Level ${entry.metadata?.level} - ${entry.title}`;
    case "title_unlocked":
      return `Unlocked title: ${entry.title}`;
    case "achievement_unlocked":
      return `Achievement: ${entry.title}`;
    case "workout_milestone":
      return entry.description;
    case "faith_milestone":
      return entry.description;
    case "reading_milestone":
      return entry.description;
    case "wealth_milestone":
      return entry.description;
    case "life_milestone":
      return entry.description;
    default:
      return entry.description;
  }
}

/**
 * Get icon for timeline event type
 */
export function getTimelineIcon(type: TimelineEventType): string {
  const icons: Record<TimelineEventType, string> = {
    level_up: "⬆️",
    title_unlocked: "👑",
    achievement_unlocked: "🏆",
    workout_milestone: "💪",
    faith_milestone: "🕌",
    reading_milestone: "📚",
    wealth_milestone: "💰",
    life_milestone: "🌟",
  };
  return icons[type] || "📌";
}
