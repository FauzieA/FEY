import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { buildCharacter } from "@/services/characterService";
import { computeMetrics, dailyChecklist, dailyCompletion, moduleSummaries, upcomingReminders, weeklyCompletion } from "@/services/insightsService";
import { formatDate, relativeDay, startOfWeek, today, weekdayLabel, daysBetween } from "@/utils/date";
import { formatNumber } from "@/utils/format";

const QUICK_ACTIONS = [
  { label: "Log a workout", path: "/training" },
  { label: "Mark prayers", path: "/faith" },
  { label: "Log sleep", path: "/health" },
  { label: "Log reading", path: "/library" },
  { label: "Log savings", path: "/wealth" },
  { label: "Write journal", path: "/life" },
];

export default function HomeDashboardPage() {
  const navigate = useNavigate();
  const snapshot = useFeySnapshot();

  const metrics = computeMetrics(snapshot);
  const character = buildCharacter(snapshot.xpEvents, metrics, startOfWeek(), today());
  const checklist = dailyChecklist(snapshot);
  const daily = dailyCompletion(snapshot);
  const weekly = weeklyCompletion(snapshot);
  const reminders = upcomingReminders(snapshot);
  const summaries = moduleSummaries(snapshot);

  // Calculate cycle phase for dashboard
  const cycles = [...snapshot.cycleLogs].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const activeCycle = cycles.find((cycle) => !cycle.endDate);
  
  const gaps = cycles
    .slice(0, 6)
    .map((cycle, index, list) => (index + 1 < list.length ? daysBetween(list[index + 1].startDate, cycle.startDate) : null))
    .filter((gap): gap is number => gap !== null && gap > 20 && gap < 45);
  const averageCycle = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28;

  const getCurrentPhase = (day: number, cycleLength: number) => {
    const normalizedDay = ((day - 1) % cycleLength) + 1;
    const lutealEnd = cycleLength;

    if (normalizedDay >= 1 && normalizedDay <= 5) {
      return { name: "Menstrual", color: "#6B2D3A" };
    } else if (normalizedDay >= 6 && normalizedDay <= 13) {
      return { name: "Follicular", color: "#8C7B75" };
    } else if (normalizedDay >= 14 && normalizedDay <= 17) {
      return { name: "Ovulation", color: "#C4B7B1" };
    } else if (normalizedDay >= 18 && normalizedDay <= lutealEnd) {
      return { name: "Luteal", color: "#D9B7BE" };
    }
    return null;
  };

  const cycleInfo = activeCycle ? {
    cycleDay: daysBetween(activeCycle.startDate) + 1,
    daysUntilNext: averageCycle - (daysBetween(activeCycle.startDate) + 1),
    phase: getCurrentPhase(daysBetween(activeCycle.startDate) + 1, averageCycle),
    averageCycleLength: averageCycle
  } : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(today())}
        title="Today"
        description="One view of who I am building: worship, body, mind, craft, money and people."
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate("/progress")}>
            See long-term progress
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#EAE3DE] bg-[#FFFCFA] p-5 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Character</p>
              <h2 className="font-serif text-3xl text-[#1A1817]">Level {character.level}</h2>
              <p className="text-xs text-[#8C7122]">
                {character.title.name} · {character.title.description}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-[#6B2D3A]">
                {formatNumber(character.xpInLevel)} / {formatNumber(character.xpForNextLevel)} XP
              </p>
              <p className="text-[11px] text-[#8C7B75]">{formatNumber(character.totalXp)} XP lifetime</p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={character.progress} tone="gold" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="XP today" value={formatNumber(character.xpToday)} />
            <StatTile label="XP this week" value={formatNumber(character.xpThisWeek)} />
            <StatTile label="Streak" value={`${character.streak}d`} hint={`best ${character.longestStreak}d`} />
            <StatTile label="Modules active" value={`${metrics.modulesTouched} / 7`} />
          </div>
        </div>

        {/* Cycle Phase Card */}
        <div className="space-y-4 rounded-3xl border border-[#EAE3DE] bg-[#FFFCFA] p-5">
          {cycleInfo && cycleInfo.phase ? (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Cycle Phase</p>
                <p className="font-serif text-2xl text-[#1A1817]">{cycleInfo.phase.name}</p>
                <p className="text-xs text-[#8C7B75]">Day {cycleInfo.cycleDay} of {cycleInfo.averageCycleLength}</p>
              </div>
              <div className="h-2 bg-[#EAE3DE] rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300" 
                  style={{ width: `${(cycleInfo.cycleDay / cycleInfo.averageCycleLength) * 100}%`, backgroundColor: cycleInfo.phase.color }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Days until next" value={cycleInfo.daysUntilNext > 0 ? `${cycleInfo.daysUntilNext}d` : "Soon"} />
                <StatTile label="Average cycle" value={`${cycleInfo.averageCycleLength}d`} />
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-[#8C7B75]">No active cycle</p>
              <Button size="sm" variant="ghost" onClick={() => navigate("/health")} className="mt-2">
                Log cycle
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-[#EAE3DE] bg-[#FFFCFA] p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Daily completion</p>
            <p className="font-serif text-3xl text-[#6B2D3A]">{daily}%</p>
            <ProgressBar value={daily} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Weekly completion</p>
            <p className="font-serif text-3xl text-[#6B2D3A]">{weekly.percent}%</p>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {weekly.days.map((day) => (
                <div key={day.date} className="text-center">
                  <div className="h-12 w-full overflow-hidden rounded-lg bg-[#EAE3DE]">
                    <div className="mt-auto h-full w-full bg-[#6B2D3A]/80" style={{ height: `${day.percent}%`, marginTop: `${100 - day.percent}%` }} />
                  </div>
                  <span className="mt-1 block text-[9px] uppercase text-[#8C7B75]">{weekdayLabel(day.date)[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Section title="Today's queue" subtitle="The handful of things that make a day complete">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checklist.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col justify-between gap-2 rounded-2xl border px-4 py-3 transition-colors ${
                item.done
                  ? "border-[#6B2D3A]/30 bg-[#F2E8EA] text-[#6B2D3A]"
                  : "border-[#EAE3DE] bg-[#FFFCFA] text-[#1A1817] hover:border-[#D9B7BE]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex-1">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-[#8C7B75]">{item.module}</span>
                </span>
                <span className={`text-xs font-bold ${item.done ? "text-[#6B2D3A]" : "text-[#C4B7B1]"}`}>{item.done ? "✓" : "—"}</span>
              </div>
              {item.progress !== undefined && item.progress > 0 && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[10px] text-[#8C7B75]">
                    <span>Progress</span>
                    <span>{Math.round(item.progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#EAE3DE] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-[#6B2D3A] transition-all duration-300" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Quick actions">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button key={action.path + action.label} size="sm" variant="rose" onClick={() => navigate(action.path)}>
              {action.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Upcoming & overdue" subtitle="Reminders pulled from every module">
        {reminders.length === 0 ? (
          <EmptyState title="Nothing waiting" hint="Call reminders, book releases and goal dates appear here." />
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <Link
                key={reminder.id}
                to={reminder.path}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4 hover:border-[#D9B7BE]"
              >
                <span>
                  <span className="block font-serif text-sm text-[#1A1817]">{reminder.title}</span>
                  <span className="block text-xs text-[#8C7B75]">
                    {reminder.module} · {reminder.detail}
                  </span>
                </span>
                <span className={`shrink-0 font-mono text-xs ${reminder.overdue ? "text-[#6B2D3A]" : "text-[#8C7B75]"}`}>
                  {relativeDay(reminder.date)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Every module" subtitle="A summary of each area of life">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <Link
              key={summary.id}
              to={summary.path}
              className="group space-y-2 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4 transition-colors hover:border-[#6B2D3A]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{summary.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C7B75] group-hover:text-[#6B2D3A]" />
              </div>
              <p className="font-serif text-lg leading-tight text-[#1A1817]">{summary.headline}</p>
              <p className="text-xs text-[#8C7B75]">{summary.detail}</p>
              {summary.progress !== null && <ProgressBar value={summary.progress} tone="rose" />}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
