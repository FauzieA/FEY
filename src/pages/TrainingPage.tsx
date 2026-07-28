import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrendChart } from "@/components/ui/TrendChart";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { TrainingRepository } from "@/repositories/trainingRepository";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { formatDate, formatShortDate, startOfWeek, toISODate, today, weekDates, weekdayLabel } from "@/utils/date";
import { formatNumber, percent } from "@/utils/format";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "log", label: "Log a workout" },
  { id: "history", label: "Exercise history" },
  { id: "progression", label: "Progression" },
  { id: "analytics", label: "Analytics" },
];

const TRACKS = [
  { path: "/weekly", title: "Weekly Gym Plan", blurb: "Structured progressive overload across push, pull, lower and core." },
  { path: "/daily", title: "Daily Movement Queue", blurb: "Posture, grip and movement-skill work to do every day." },
  { path: "/class-day", title: "Class Day", blurb: "Low-fatigue routines for active recovery and quick energy burn." },
  { path: "/history", title: "Weekly Summary & Logs", blurb: "Past sessions, volume totals and historical achievements." },
  { path: "/evolution", title: "Evolution", blurb: "Muscle map, performance trends and then-versus-now." },
];

export default function TrainingPage() {
  const [tab, setTab] = useState("overview");
  const snapshot = useFeySnapshot();

  const weekStart = startOfWeek();
  const sessionsThisWeek = snapshot.sessions.filter((session) => toISODate(session.completedAt) >= weekStart);
  const totalVolume = snapshot.sessions.reduce((sum, session) => sum + (session.totalVolumeKg ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Body & Capacity"
        title="Training"
        description="Everything from the original workout tracker, plus logging, history, progression and analytics."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Sessions this week" value={`${sessionsThisWeek.length} / 5`} tone="burgundy" />
        <StatTile label="All-time sessions" value={snapshot.sessions.length} />
        <StatTile label="Volume lifted" value={`${formatNumber(totalVolume)} kg`} />
        <StatTile label="Personal records" value={snapshot.xpEvents.filter((e) => e.activity === "personal_record").length} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" && <OverviewTab />}
      {tab === "log" && <LogTab />}
      {tab === "history" && <HistoryTab />}
      {tab === "progression" && <ProgressionTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

function OverviewTab() {
  const navigate = useNavigate();
  const snapshot = useFeySnapshot();

  const days = weekDates().map((date) => ({
    date,
    sessions: snapshot.sessions.filter((session) => toISODate(session.completedAt) === date).length,
  }));

  return (
    <div className="space-y-6">
      <Section title="This week">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div
              key={day.date}
              className={`rounded-2xl border p-2 text-center ${
                day.sessions > 0 ? "border-[#6B2D3A]/30 bg-[#F2E8EA]" : "border-[#EAE3DE] bg-[#FFFCFA]"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-widest text-[#8C7B75]">{weekdayLabel(day.date)}</span>
              <span className="font-serif text-lg text-[#6B2D3A]">{day.sessions || "·"}</span>
            </div>
          ))}
        </div>
        <ProgressBar
          value={percent(days.filter((day) => day.sessions > 0).length, 5)}
          label="Weekly target"
          caption={`${days.filter((day) => day.sessions > 0).length} / 5 training days`}
        />
      </Section>

      <Section title="Training tracks" subtitle="The original workout flows, unchanged">
        <div className="grid gap-3 sm:grid-cols-2">
          {TRACKS.map((track) => (
            <button
              key={track.path}
              type="button"
              onClick={() => navigate(track.path)}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4 text-left transition-colors hover:border-[#6B2D3A]"
            >
              <span>
                <span className="block font-serif text-sm text-[#1A1817] group-hover:text-[#6B2D3A]">{track.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[#8C7B75]">{track.blurb}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8C7B75] group-hover:text-[#6B2D3A]" />
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function LogTab() {
  const [form, setForm] = useState({
    exerciseId: EXERCISE_DATABASE[0]?.id ?? "",
    date: today(),
    sets: "3",
    reps: "10",
    weightKg: "20",
    durationMinutes: "45",
    notes: "",
  });

  return (
    <Section title="Quick log" subtitle="Log a session outside the guided flows — sets, reps and load">
      <InlineForm
        title="Log a workout"
        defaultOpen
        onSubmit={async () => {
          const exercise = EXERCISE_DATABASE.find((item) => item.id === form.exerciseId);
          if (!exercise) return;

          const setCount = Number(form.sets) || 1;
          const reps = Number(form.reps) || 0;
          const weightKg = Number(form.weightKg) || 0;

          await TrainingRepository.saveSession({
            id: `session_${exercise.id}_${form.date}_${Date.now()}`,
            planTitle: exercise.name,
            completedAt: new Date(`${form.date}T12:00:00`).toISOString(),
            durationMinutes: Number(form.durationMinutes) || 0,
            totalVolumeKg: setCount * reps * weightKg,
            exercises: [
              {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                notes: form.notes || undefined,
                sets: Array.from({ length: setCount }, (_, index) => ({
                  setNum: index + 1,
                  reps,
                  weightKg,
                  completed: true,
                })),
              },
            ],
          });

          setForm({ ...form, notes: "" });
        }}
      >
        <Field label="Exercise">
          <Select value={form.exerciseId} onChange={(e) => setForm({ ...form, exerciseId: e.target.value })}>
            {EXERCISE_DATABASE.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date">
          <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Sets">
          <TextInput type="number" min="1" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })} />
        </Field>
        <Field label="Reps per set">
          <TextInput type="number" min="0" value={form.reps} onChange={(e) => setForm({ ...form, reps: e.target.value })} />
        </Field>
        <Field label="Weight (kg)">
          <TextInput type="number" step="0.5" min="0" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
        </Field>
        <Field label="Duration (min)">
          <TextInput
            type="number"
            min="0"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
          />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </InlineForm>
    </Section>
  );
}

function HistoryTab() {
  const snapshot = useFeySnapshot();
  const sessions = [...snapshot.sessions].sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));

  return (
    <Section title="Session history" subtitle="Newest first, with the sets recorded in each">
      {sessions.length === 0 && <EmptyState title="No sessions logged yet" hint="Use Log a workout or one of the training tracks." />}
      <div className="space-y-2">
        {sessions.slice(0, 25).map((session) => (
          <ListRow
            key={session.id}
            title={session.planTitle ?? session.exercises?.[0]?.exerciseName ?? "Session"}
            subtitle={session.exercises?.map((exercise) => exercise.exerciseName ?? exercise.name).join(", ")}
            meta={`${formatDate(String(session.completedAt))} · ${formatNumber(session.totalVolumeKg ?? 0)} kg`}
          >
            <div className="flex flex-wrap gap-1.5">
              {(session.exercises ?? []).flatMap((exercise) =>
                (exercise.sets ?? []).map((set, index) => (
                  <span
                    key={`${session.id}-${exercise.exerciseId}-${index}`}
                    className="rounded-full border border-[#EAE3DE] bg-[#F8F5F2] px-2 py-0.5 font-mono text-[10px] text-[#6B2D3A]"
                  >
                    {(set.weightKg ?? set.weight ?? 0) > 0
                      ? `${set.weightKg ?? set.weight}kg × ${set.reps ?? 0}`
                      : `${set.reps ?? set.durationSec ?? 0}${set.reps ? " reps" : "s"}`}
                  </span>
                )),
              )}
            </div>
          </ListRow>
        ))}
      </div>
    </Section>
  );
}

function ProgressionTab() {
  const snapshot = useFeySnapshot();
  const records = useMemo(() => TrainingRepository.flattenSets(snapshot.sessions), [snapshot.sessions]);
  const exercises = useMemo(
    () => [...new Map(records.map((record) => [record.exerciseId, record.exerciseName])).entries()],
    [records],
  );
  const [exerciseId, setExerciseId] = useState<string>("");

  const active = exerciseId || exercises[0]?.[0] || "";
  const forExercise = records.filter((record) => record.exerciseId === active);

  const bestByDate = new Map<string, number>();
  for (const record of forExercise) {
    bestByDate.set(record.date, Math.max(bestByDate.get(record.date) ?? 0, record.weightKg));
  }
  const series = [...bestByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ label: formatShortDate(date), value }));

  return (
    <Section title="Exercise progression" subtitle="Top set per session for one exercise">
      {exercises.length === 0 ? (
        <EmptyState title="No exercise data yet" hint="Log a workout with weights to see progression." />
      ) : (
        <>
          <Field label="Exercise" className="max-w-sm">
            <Select value={active} onChange={(e) => setExerciseId(e.target.value)}>
              {exercises.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>

          <TrendChart data={series} unit=" kg" emptyLabel="No weighted sets for this exercise" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Best set" value={`${Math.max(0, ...forExercise.map((r) => r.weightKg))} kg`} />
            <StatTile label="Sessions" value={bestByDate.size} />
            <StatTile label="Total sets" value={forExercise.length} />
            <StatTile label="Total volume" value={`${formatNumber(forExercise.reduce((sum, r) => sum + r.volumeKg, 0))} kg`} />
          </div>
        </>
      )}
    </Section>
  );
}

function AnalyticsTab() {
  const snapshot = useFeySnapshot();

  const volumeByWeek = new Map<string, number>();
  const sessionsByWeek = new Map<string, number>();
  for (const session of snapshot.sessions) {
    const week = startOfWeek(toISODate(session.completedAt));
    volumeByWeek.set(week, (volumeByWeek.get(week) ?? 0) + (session.totalVolumeKg ?? 0));
    sessionsByWeek.set(week, (sessionsByWeek.get(week) ?? 0) + 1);
  }

  const volumeSeries = [...volumeByWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([week, value]) => ({ label: formatShortDate(week), value: Math.round(value) }));

  const sessionSeries = [...sessionsByWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([week, value]) => ({ label: formatShortDate(week), value }));

  const byCategory = new Map<string, number>();
  for (const record of TrainingRepository.flattenSets(snapshot.sessions)) {
    const category = EXERCISE_DATABASE.find((exercise) => exercise.id === record.exerciseId)?.category ?? "other";
    byCategory.set(category, (byCategory.get(category) ?? 0) + record.volumeKg);
  }

  return (
    <div className="space-y-6">
      <Section title="Volume per week">
        <TrendChart data={volumeSeries} kind="bar" unit=" kg" emptyLabel="Log sessions to build weekly volume" />
      </Section>

      <Section title="Sessions per week">
        <TrendChart data={sessionSeries} kind="line" emptyLabel="Log sessions to build weekly frequency" />
      </Section>

      <Section title="Volume by category">
        {byCategory.size === 0 ? (
          <EmptyState title="No category data yet" />
        ) : (
          <div className="space-y-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
            {[...byCategory.entries()]
              .sort(([, a], [, b]) => b - a)
              .map(([category, volume]) => (
                <ProgressBar
                  key={category}
                  value={percent(volume, Math.max(...byCategory.values()))}
                  label={category.replace(/_/g, " ")}
                  caption={`${formatNumber(volume)} kg`}
                />
              ))}
          </div>
        )}
      </Section>
    </div>
  );
}
