import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { buildCharacter, TITLE_DEFINITIONS } from "@/services/characterService";
import { computeMetrics } from "@/services/insightsService";
import { activityLabel } from "@/services/xpService";
import { formatDate, startOfWeek, today } from "@/utils/date";
import { formatNumber, titleCase } from "@/utils/format";

export default function CharacterHubPage() {
  const navigate = useNavigate();
  const snapshot = useFeySnapshot();
  const metrics = computeMetrics(snapshot);
  const character = buildCharacter(snapshot.xpEvents, metrics, startOfWeek(), today());

  const branches = [...new Set(character.skills.map((skill) => skill.branch))];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Who I am becoming"
        title="Character"
        description="Every activity in FEY feeds this page: worship, training, reading, craft, money and people."
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate("/character/training")}>
            Training character sheet
          </Button>
        }
      />

      <div className="rounded-3xl border border-[#EAE3DE] bg-[#FFFCFA] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Current title</p>
            <h2 className="font-serif text-3xl text-[#1A1817]">{character.title.name}</h2>
            <p className="text-xs italic text-[#8C7B75]">{character.title.description}</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-4xl text-[#6B2D3A]">Lv {character.level}</p>
            <p className="font-mono text-xs text-[#8C7B75]">
              {formatNumber(character.xpInLevel)} / {formatNumber(character.xpForNextLevel)} XP
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={character.progress}
            tone="gold"
            caption={character.nextTitle ? `Next title: ${character.nextTitle.name} at level ${character.nextTitle.minLevel}` : "Highest title reached"}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Lifetime XP" value={formatNumber(character.totalXp)} tone="burgundy" />
          <StatTile label="Active days" value={metrics.activeDays} />
          <StatTile label="Current streak" value={`${character.streak}d`} hint={`best ${character.longestStreak}d`} />
          <StatTile label="Achievements" value={`${character.achievements.filter((a) => a.unlocked).length} / ${character.achievements.length}`} />
        </div>
      </div>

      <Section title="Attributes" subtitle="Levels grow from the modules that feed them">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {character.attributes.map((attribute) => (
            <div key={attribute.id} className="space-y-2 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-sm text-[#1A1817]">{attribute.name}</span>
                <span className="font-mono text-xs text-[#6B2D3A]">Lv {attribute.level}</span>
              </div>
              <ProgressBar value={attribute.progress} tone="rose" caption={`${formatNumber(attribute.intoLevel)} / ${formatNumber(attribute.span)}`} />
              <p className="text-[11px] leading-relaxed text-[#8C7B75]">{attribute.description}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#C4B7B1]">{attribute.sources.join(" · ")}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skills" subtitle="Concrete thresholds, not vibes">
        <div className="space-y-4">
          {branches.map((branch) => (
            <div key={branch} className="space-y-2 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{branch}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {character.skills
                  .filter((skill) => skill.branch === branch)
                  .map((skill) => (
                    <div key={skill.id} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-sm ${skill.unlocked ? "font-semibold text-[#6B2D3A]" : "text-[#1A1817]"}`}>
                          {skill.name}
                          {skill.unlocked ? " ✓" : ""}
                        </span>
                        <span className="font-mono text-[11px] text-[#8C7B75]">
                          {formatNumber(Math.min(skill.value, skill.target))} / {formatNumber(skill.target)}
                        </span>
                      </div>
                      <ProgressBar value={skill.progress} tone={skill.unlocked ? "gold" : "burgundy"} />
                      <p className="text-[11px] text-[#8C7B75]">{skill.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Achievements">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {character.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`space-y-2 rounded-2xl border p-4 ${
                achievement.unlocked ? "border-[#D4AF37]/50 bg-[#FAF7F2]" : "border-[#EAE3DE] bg-[#FFFCFA]"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-sm text-[#1A1817]">{achievement.name}</span>
                <span className="font-mono text-[11px] text-[#8C7B75]">
                  {formatNumber(Math.min(achievement.value, achievement.target))}/{formatNumber(achievement.target)}
                </span>
              </div>
              <ProgressBar value={achievement.progress} tone={achievement.unlocked ? "gold" : "rose"} />
              <p className="text-[11px] text-[#8C7B75]">{achievement.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="XP by module">
          {character.xpByModule.length === 0 ? (
            <EmptyState title="No XP earned yet" hint="Log anything in any module to start." />
          ) : (
            <div className="space-y-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
              {character.xpByModule.map((entry) => (
                <ProgressBar
                  key={entry.module}
                  label={titleCase(entry.module)}
                  value={(entry.xp / character.xpByModule[0].xp) * 100}
                  caption={`${formatNumber(entry.xp)} XP`}
                />
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent activity">
          {character.recentEvents.length === 0 ? (
            <EmptyState title="Nothing logged yet" />
          ) : (
            <div className="divide-y divide-[#EAE3DE] rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA]">
              {character.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span>
                    <span className="block text-sm text-[#1A1817]">{activityLabel(event.activity)}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-[#8C7B75]">
                      {titleCase(event.module)} · {formatDate(event.date)}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-[#8C7122]">+{event.amount}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section title="Titles" subtitle="The path ahead">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {TITLE_DEFINITIONS.map((title) => {
            const unlocked = character.level >= title.minLevel;
            return (
              <div
                key={title.id}
                className={`rounded-2xl border p-3 ${unlocked ? "border-[#6B2D3A]/30 bg-[#F2E8EA]" : "border-[#EAE3DE] bg-[#FFFCFA]"}`}
              >
                <p className={`font-serif text-sm ${unlocked ? "text-[#6B2D3A]" : "text-[#8C7B75]"}`}>{title.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#C4B7B1]">Level {title.minLevel}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#8C7B75]">{title.description}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
