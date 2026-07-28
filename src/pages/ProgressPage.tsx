import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrendChart } from "@/components/ui/TrendChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import type { FeySnapshot } from "@/hooks/useFeySnapshot";
import { buildCharacter } from "@/services/characterService";
import { computeMetrics, dailyCompletion } from "@/services/insightsService";
import { PRAYER_NAMES } from "@/types/modules";
import { addDays, formatShortDate, lastNDays, startOfWeek, toISODate, today } from "@/utils/date";
import { average, formatCurrency, formatNumber, percent } from "@/utils/format";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "consistency", label: "Consistency" },
  { id: "modules", label: "By module" },
];

/** Compares the last 30 days against the 30 before them. */
function trend(dates: string[], values?: number[]): { current: number; previous: number; change: number } {
  const cutoff = addDays(today(), -30);
  const previousCutoff = addDays(today(), -60);

  let current = 0;
  let previous = 0;
  dates.forEach((date, index) => {
    const value = values ? values[index] : 1;
    if (date > cutoff) current += value;
    else if (date > previousCutoff) previous += value;
  });

  const change = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
  return { current, previous, change };
}

function TrendCard({ label, value, change, hint }: { label: string; value: string; change: number; hint?: string }) {
  const direction = change > 0 ? "▲" : change < 0 ? "▼" : "—";
  const tone = change > 0 ? "text-[#4A7C59]" : change < 0 ? "text-[#8C3A3A]" : "text-[#8C7B75]";
  return (
    <div className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{label}</span>
      <span className="mt-1 block font-serif text-2xl text-[#1A1817]">{value}</span>
      <span className={`mt-1 block text-[11px] font-mono ${tone}`}>
        {direction} {Math.abs(change)}% vs previous 30 days
      </span>
      {hint && <span className="mt-1 block text-[11px] text-[#8C7B75]">{hint}</span>}
    </div>
  );
}

export default function ProgressPage() {
  const [tab, setTab] = useState("overview");
  const snapshot = useFeySnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Long-term view"
        title="Progress"
        description="Not raw data — direction. Where I am improving, where consistency slipped, and what is trending."
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" && <OverviewTab snapshot={snapshot} />}
      {tab === "consistency" && <ConsistencyTab snapshot={snapshot} />}
      {tab === "modules" && <ModulesTab snapshot={snapshot} />}
    </div>
  );
}

function OverviewTab({ snapshot }: { snapshot: FeySnapshot }) {
  const metrics = computeMetrics(snapshot);
  const character = buildCharacter(snapshot.xpEvents, metrics, startOfWeek(), today());

  const xpByWeek = new Map<string, number>();
  for (const event of snapshot.xpEvents) {
    const week = startOfWeek(event.date);
    xpByWeek.set(week, (xpByWeek.get(week) ?? 0) + event.amount);
  }
  const xpSeries = [...xpByWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, value]) => ({ label: formatShortDate(week), value }));

  const xpTrend = trend(
    snapshot.xpEvents.map((event) => event.date),
    snapshot.xpEvents.map((event) => event.amount),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Level" value={character.level} hint={character.title.name} tone="burgundy" />
        <StatTile label="Lifetime XP" value={formatNumber(character.totalXp)} />
        <StatTile label="Active days" value={metrics.activeDays} />
        <StatTile label="Best streak" value={`${character.longestStreak}d`} />
      </div>

      <Section title="Experience earned per week" subtitle="The single clearest measure of an intentional month">
        <TrendChart data={xpSeries} kind="area" emptyLabel="Log activities to build this trend" />
      </Section>

      <Section title="Direction of travel">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TrendCard label="XP" value={formatNumber(xpTrend.current)} change={xpTrend.change} hint="Last 30 days" />
          <TrendCard
            label="Workouts"
            value={String(
              trend(snapshot.sessions.map((session) => toISODate(session.completedAt))).current,
            )}
            change={trend(snapshot.sessions.map((session) => toISODate(session.completedAt))).change}
          />
          <TrendCard
            label="Reading sessions"
            value={String(trend(snapshot.readingSessions.map((session) => session.date)).current)}
            change={trend(snapshot.readingSessions.map((session) => session.date)).change}
          />
          <TrendCard
            label="Journal entries"
            value={String(trend(snapshot.journalEntries.map((entry) => entry.date)).current)}
            change={trend(snapshot.journalEntries.map((entry) => entry.date)).change}
          />
        </div>
      </Section>

      <Section title="Attribute balance" subtitle="Where character growth is concentrated">
        <div className="space-y-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
          {character.attributes.map((attribute) => (
            <ProgressBar
              key={attribute.id}
              label={`${attribute.name} · Lv ${attribute.level}`}
              value={percent(attribute.xp, Math.max(1, ...character.attributes.map((item) => item.xp)))}
              caption={`${formatNumber(attribute.xp)} XP`}
              tone="rose"
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function ConsistencyTab({ snapshot }: { snapshot: FeySnapshot }) {
  const days = lastNDays(28).map((date) => ({ date, percent: dailyCompletion(snapshot, date) }));
  const weeks: { label: string; value: number }[] = [];
  for (let index = 0; index < days.length; index += 7) {
    const chunk = days.slice(index, index + 7);
    weeks.push({
      label: formatShortDate(chunk[0].date),
      value: Math.round(average(chunk.map((day) => day.percent))),
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="28-day average" value={`${Math.round(average(days.map((day) => day.percent)))}%`} tone="burgundy" />
        <StatTile label="Perfect days" value={days.filter((day) => day.percent === 100).length} />
        <StatTile label="Empty days" value={days.filter((day) => day.percent === 0).length} />
        <StatTile label="This week" value={`${weeks.at(-1)?.value ?? 0}%`} />
      </div>

      <Section title="Daily completion, last 28 days">
        <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
          {days.map((day) => (
            <div
              key={day.date}
              title={`${day.date} · ${day.percent}%`}
              className="aspect-square rounded-lg border border-[#EAE3DE]"
              style={{ backgroundColor: day.percent === 0 ? "#F8F5F2" : `rgba(107, 45, 58, ${0.15 + (day.percent / 100) * 0.85})` }}
            />
          ))}
        </div>
      </Section>

      <Section title="Weekly completion average">
        <TrendChart data={weeks} kind="bar" unit="%" />
      </Section>
    </div>
  );
}

function ModulesTab({ snapshot }: { snapshot: FeySnapshot }) {
  const currency = snapshot.wealthProfile?.currency ?? "GBP";

  const prayerDays = snapshot.prayerLogs.filter((log) => log.date > addDays(today(), -30));
  const prayerRate = prayerDays.length
    ? percent(
        prayerDays.reduce((sum, log) => sum + PRAYER_NAMES.filter((name) => log.prayers?.[name]).length, 0),
        prayerDays.length * 5,
      )
    : 0;

  const sleepLast30 = snapshot.sleepLogs.filter((log) => log.date > addDays(today(), -30));
  const weights = [...snapshot.weights].sort((a, b) => a.date.localeCompare(b.date));

  const volumeTrend = trend(
    snapshot.sessions.map((session) => toISODate(session.completedAt)),
    snapshot.sessions.map((session) => session.totalVolumeKg ?? 0),
  );
  const savingsTrend = trend(
    snapshot.savingsEntries.map((entry) => entry.date),
    snapshot.savingsEntries.map((entry) => entry.amount),
  );
  const pagesTrend = trend(
    snapshot.readingSessions.map((session) => session.date),
    snapshot.readingSessions.map((session) => session.pagesRead),
  );

  const cards = [
    {
      title: "Training",
      stats: [
        { label: "Volume, last 30 days", value: `${formatNumber(volumeTrend.current)} kg`, change: volumeTrend.change },
      ],
      detail: `${snapshot.sessions.length} session${snapshot.sessions.length === 1 ? "" : "s"} all-time`,
    },
    {
      title: "Faith",
      stats: [{ label: "Prayers logged", value: `${prayerRate}%`, change: 0 }],
      detail: `${snapshot.quranReading.length} reading sessions · ${snapshot.revisions.length} revisions · ${
        snapshot.missedFasts.filter((fast) => !fast.madeUpOn).length
      } fasts owed`,
    },
    {
      title: "Health",
      stats: [
        {
          label: "Average sleep",
          value: sleepLast30.length ? `${average(sleepLast30.map((log) => log.hours)).toFixed(1)}h` : "—",
          change: 0,
        },
      ],
      detail:
        weights.length >= 2
          ? `Weight ${weights.at(-1)!.weightKg} kg (${(weights.at(-1)!.weightKg - weights[0].weightKg).toFixed(1)} kg since first entry)`
          : "Log weight twice to see direction",
    },
    {
      title: "Library",
      stats: [{ label: "Pages, last 30 days", value: formatNumber(pagesTrend.current), change: pagesTrend.change }],
      detail: `${snapshot.books.filter((book) => book.status === "finished").length} books finished · ${
        snapshot.books.filter((book) => book.status === "waiting").length
      } waiting`,
    },
    {
      title: "Perfumery",
      stats: [{ label: "Versions blended", value: String(snapshot.perfumeVersions.length), change: 0 }],
      detail: `${snapshot.perfumeFormulas.length} formula${snapshot.perfumeFormulas.length === 1 ? "" : "s"} in development`,
    },
    {
      title: "Wealth",
      stats: [
        { label: "Saved, last 30 days", value: formatCurrency(savingsTrend.current, currency), change: savingsTrend.change },
      ],
      detail: `${snapshot.savingsGoals.filter((goal) => goal.completedAt).length} goals reached · ${
        snapshot.purchasePlans.filter((plan) => !plan.purchasedAt).length
      } purchases planned`,
    },
    {
      title: "Life",
      stats: [
        {
          label: "Check-ins completed",
          value: String(snapshot.callReminders.filter((reminder) => reminder.completedAt).length),
          change: 0,
        },
      ],
      detail: `${snapshot.journalEntries.length} journal entries · ${snapshot.timelineEvents.length} timeline events`,
    },
  ];

  if (snapshot.xpEvents.length === 0) {
    return <EmptyState title="No activity yet" hint="Log something in any module and this page fills in." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className="space-y-2 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{card.title}</p>
          {card.stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-2xl leading-tight text-[#1A1817]">{stat.value}</p>
              <p className="text-[11px] text-[#8C7B75]">{stat.label}</p>
            </div>
          ))}
          <p className="text-xs leading-relaxed text-[#8C7B75]">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}
