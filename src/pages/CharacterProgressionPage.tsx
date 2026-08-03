import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { getLevelInfo, estimateActionsToNextLevel, ATTRIBUTE_NAMES, ATTRIBUTE_DESCRIPTIONS, type AttributeId } from "@/services/xpSystem";
import { getTitleForLevel, getNextTitle, TITLE_DEFINITIONS } from "@/data/titles";
import { ACHIEVEMENT_DEFINITIONS, RARITY_COLORS, RARITY_ORDER, type Rarity } from "@/data/achievements";
import { formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/date";
import { ChevronDown, ChevronUp, Trophy, Lock, Sparkles } from "lucide-react";

export default function CharacterProgressionPage() {
  const snapshot = useFeySnapshot();
  const [expandedAttribute, setExpandedAttribute] = useState<AttributeId | null>(null);
  const [showLockedTitles, setShowLockedTitles] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<Rarity | "all">("all");

  // Calculate total XP from events
  const totalXp = snapshot.xpEvents.reduce((sum, e) => sum + e.amount, 0);
  const levelInfo = getLevelInfo(totalXp);
  const currentTitle = getTitleForLevel(levelInfo.level);
  const nextTitle = getNextTitle(levelInfo.level);

  // Calculate XP by attribute and top contributors per attribute
  const coreAttributes: AttributeId[] = ["strength", "discipline", "devotion", "vitality", "knowledge", "stewardship", "craft"];
  const xpByAttribute = new Map<AttributeId, number>();
  const xpByActivityByAttribute = new Map<AttributeId, Map<string, number>>();
  
  snapshot.xpEvents.forEach((event) => {
    if (coreAttributes.includes(event.attribute as AttributeId)) {
      const attr = event.attribute as AttributeId;
      xpByAttribute.set(attr, (xpByAttribute.get(attr) ?? 0) + event.amount);
      
      // Track XP by activity for each attribute
      if (!xpByActivityByAttribute.has(attr)) {
        xpByActivityByAttribute.set(attr, new Map());
      }
      const attrActivityMap = xpByActivityByAttribute.get(attr)!;
      attrActivityMap.set(event.activity, (attrActivityMap.get(event.activity) ?? 0) + event.amount);
    }
  });

  // Calculate attribute levels (using same formula as character level for now)
  const attributes = coreAttributes.map((attr: AttributeId) => {
    const xp = xpByAttribute.get(attr) ?? 0;
    const attrLevelInfo = getLevelInfo(xp);
    
    // Get top contributors for this specific attribute
    const activityMap = xpByActivityByAttribute.get(attr) ?? new Map();
    const topContributors = [...activityMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([activity, xp]) => ({ activity, xp }));
    
    return {
      id: attr,
      name: ATTRIBUTE_NAMES[attr],
      description: ATTRIBUTE_DESCRIPTIONS[attr],
      xp,
      level: attrLevelInfo.level,
      progress: attrLevelInfo.progressPercent,
      xpInLevel: attrLevelInfo.xpInCurrentLevel,
      xpRequired: attrLevelInfo.xpRequiredForNextLevel,
      topContributors,
    };
  });

  // Generate timeline from recent events
  const timeline = snapshot.xpEvents
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20)
    .map((event) => ({
      date: event.date,
      title: event.activity,
      description: `+${event.amount} XP in ${event.attribute}`,
      icon: getActivityIcon(event.activity),
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your Journey"
        title="Character Progression"
        description="The person you are becoming through every action you take."
      />

      {/* Character Card */}
      <div className="bg-gradient-to-br from-[#6B2D3A] to-[#8B3D4A] rounded-3xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA] mb-1">Current Identity</p>
            <h2 className="font-serif text-3xl mb-1">{currentTitle.name}</h2>
            <p className="text-sm text-[#F2E8EA] italic">{currentTitle.flavorText}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA] mb-1">Level</p>
            <p className="font-mono text-5xl">{levelInfo.level}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Total XP: {formatNumber(totalXp)}</span>
            <span>{formatNumber(levelInfo.xpInCurrentLevel)} / {formatNumber(levelInfo.xpRequiredForNextLevel)} XP</span>
          </div>
          <ProgressBar value={levelInfo.progressPercent} tone="burgundy" />
        </div>

        <p className="text-sm text-[#F2E8EA]">
          {estimateActionsToNextLevel(levelInfo.xpRequiredForNextLevel - levelInfo.xpInCurrentLevel)}
        </p>

        {nextTitle && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA] mb-1">Next Title</p>
            <p className="text-sm">{nextTitle.name} at Level {nextTitle.minLevel}</p>
          </div>
        )}
      </div>

      {/* Attributes Section */}
      <Section title="Attributes" subtitle="The seven dimensions of your character">
        <div className="space-y-3">
          {attributes.map((attr) => (
            <AttributeCard
              key={attr.id}
              attribute={attr}
              isExpanded={expandedAttribute === attr.id}
              onToggle={() => setExpandedAttribute(expandedAttribute === attr.id ? null : attr.id)}
            />
          ))}
        </div>
      </Section>

      {/* Titles Section */}
      <Section title="Titles" subtitle="Identity earned through consistent action">
        <div className="space-y-3">
          {TITLE_DEFINITIONS.map((title) => {
            const unlocked = levelInfo.level >= title.minLevel;
            if (!showLockedTitles && !unlocked) return null;
            return (
              <div
                key={title.id}
                className={`rounded-2xl border p-4 ${
                  unlocked
                    ? "border-[#6B2D3A] bg-[#FFFCFA]"
                    : "border-[#EAE3DE] bg-[#F8F5F2] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {unlocked ? (
                      <Sparkles className="h-5 w-5 text-[#6B2D3A]" />
                    ) : (
                      <Lock className="h-5 w-5 text-[#8C7B75]" />
                    )}
                    <div>
                      <h3 className="font-serif text-lg text-[#1A1817]">{title.name}</h3>
                      <p className="text-xs text-[#8C7B75]">{title.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#6B2D3A]">Level {title.minLevel}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setShowLockedTitles(!showLockedTitles)}
          className="mt-4 text-sm text-[#6B2D3A] hover:underline"
        >
          {showLockedTitles ? "Hide locked titles" : "Show locked titles"}
        </button>
      </Section>

      {/* Achievements Section */}
      <Section title="Achievements" subtitle="One-time milestones that celebrate defining moments">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedRarity("all")}
            className={`px-3 py-1 rounded-full text-xs ${
              selectedRarity === "all" ? "bg-[#6B2D3A] text-white" : "bg-[#F2E8EA] text-[#6B2D3A]"
            }`}
          >
            All
          </button>
          {RARITY_ORDER.map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-3 py-1 rounded-full text-xs ${
                selectedRarity === rarity ? "bg-[#6B2D3A] text-white" : "bg-[#F2E8EA] text-[#6B2D3A]"
              }`}
              style={{ backgroundColor: selectedRarity === rarity ? RARITY_COLORS[rarity] : undefined }}
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENT_DEFINITIONS.filter(
            (a) => selectedRarity === "all" || a.rarity === selectedRarity
          ).map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4"
              style={{ borderLeftColor: RARITY_COLORS[achievement.rarity], borderLeftWidth: 4 }}
            >
              <div className="flex items-start justify-between mb-2">
                <Trophy className="h-5 w-5" style={{ color: RARITY_COLORS[achievement.rarity] }} />
                <span className="text-[10px] font-bold uppercase" style={{ color: RARITY_COLORS[achievement.rarity] }}>
                  {achievement.rarity}
                </span>
              </div>
              <h3 className="font-serif text-sm text-[#1A1817] mb-1">{achievement.name}</h3>
              <p className="text-xs text-[#8C7B75] mb-2">{achievement.description}</p>
              <p className="text-[10px] text-[#6B2D3A] italic">{achievement.hint}</p>
              <p className="text-xs font-mono text-[#6B2D3A] mt-2">+{achievement.xpBonus} XP</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Journey Timeline */}
      <Section title="Journey Timeline" subtitle="Your autobiography written through actions">
        {timeline.length === 0 ? (
          <EmptyState title="No journey yet" hint="Log activities to start building your timeline." />
        ) : (
          <div className="space-y-4">
            {timeline.map((entry, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#6B2D3A] flex items-center justify-center text-white text-sm">
                    {entry.icon}
                  </div>
                  {index < timeline.length - 1 && <div className="w-0.5 h-full bg-[#EAE3DE] mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-[#8C7B75] mb-1">{formatDate(entry.date)}</p>
                  <p className="font-serif text-lg text-[#1A1817]">{entry.title}</p>
                  <p className="text-sm text-[#6B2D3A]">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function AttributeCard({
  attribute,
  isExpanded,
  onToggle,
}: {
  attribute: {
    id: AttributeId;
    name: string;
    description: string;
    xp: number;
    level: number;
    progress: number;
    xpInLevel: number;
    xpRequired: number;
    topContributors: { activity: string; xp: number }[];
  };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-lg text-[#1A1817]">{attribute.name}</h3>
            <span className="text-xs font-mono text-[#6B2D3A]">Level {attribute.level}</span>
          </div>
          <p className="text-xs text-[#8C7B75] mb-3">{attribute.description}</p>
          <ProgressBar value={attribute.progress} tone="rose" />
          <p className="text-[10px] text-[#8C7B75] mt-1">
            {attribute.xpInLevel} / {attribute.xpRequired} XP · {attribute.xp} total
          </p>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 text-[#8C7B75]" /> : <ChevronDown className="h-5 w-5 text-[#8C7B75]" />}
      </button>

      {isExpanded && (
        <div className="border-t border-[#EAE3DE] p-4 bg-[#F8F5F2]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-3">
            Top Contributors
          </p>
          {attribute.topContributors.length > 0 ? (
            <div className="space-y-2">
              {attribute.topContributors.slice(0, 3).map((contributor, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-[#1A1817]">{contributor.activity}</span>
                  <span className="font-mono text-[#6B2D3A]">+{contributor.xp} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C7B75]">No activities recorded yet</p>
          )}
        </div>
      )}
    </div>
  );
}

function getActivityIcon(activity: string): string {
  const iconMap: Record<string, string> = {
    workout: "💪",
    prayer: "🕌",
    quran: "📖",
    adhkar: "🤲",
    reading: "📚",
    savings: "💰",
    journal: "✍️",
    sleep: "😴",
    perfume: "🧴",
  };
  return iconMap[activity.toLowerCase()] || "⭐";
}
