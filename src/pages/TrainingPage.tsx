import { useState } from "react";
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
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { TrainingRepository } from "@/repositories/trainingRepository";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { formatDate, startOfWeek, toISODate, today, weekDates, weekdayLabel } from "@/utils/date";
import { formatNumber, percent } from "@/utils/format";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "log", label: "Log a workout" },
  { id: "history", label: "Exercise history" },
  { id: "weekly-summary", label: "Weekly Summary" },
  { id: "evolution", label: "Evolution" },
];

const TRACKS = [
  { path: "/weekly", title: "Weekly Gym Plan", blurb: "Structured progressive overload across push, pull, lower and core." },
  { path: "/daily", title: "Daily Movement Queue", blurb: "Posture, grip and movement-skill work to do every day." },
  { path: "/class-day", title: "Class Day", blurb: "Low-fatigue routines for active recovery and quick energy burn." },
  { path: "/history", title: "Weekly Summary & Logs", blurb: "Past sessions, volume totals and historical achievements." },
];

export default function TrainingPage() {
  const [tab, setTab] = useState("overview");
  const snapshot = useFeySnapshot();

  const weekStart = startOfWeek();
  const sessionsThisWeek = snapshot.sessions.filter((session) => toISODate(session.completedAt) >= weekStart);
  const weeklyCompletionPercent = percent(sessionsThisWeek.length, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Body & Capacity"
        title="Training"
        description="Everything from the original workout tracker, plus logging, history, progression and analytics."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Weekly completion" value={`${weeklyCompletionPercent}%`} tone="burgundy" />
        <StatTile label="Sessions this week" value={`${sessionsThisWeek.length} / 5`} />
        <StatTile label="All-time sessions" value={snapshot.sessions.length} />
        <StatTile label="Personal records" value={snapshot.xpEvents.filter((e) => e.activity === "personal_record").length} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" && <OverviewTab />}
      {tab === "log" && <LogTab />}
      {tab === "history" && <HistoryTab />}
      {tab === "weekly-summary" && <WeeklySummaryTab />}
      {tab === "evolution" && <EvolutionTab />}
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

function WeeklySummaryTab() {
  const navigate = useNavigate();
  const snapshot = useFeySnapshot();

  const weekStart = startOfWeek();
  const sessionsThisWeek = snapshot.sessions.filter((session) => toISODate(session.completedAt) >= weekStart);

  const totalVolume = sessionsThisWeek.reduce((sum, session) => sum + (session.totalVolumeKg ?? 0), 0);
  const totalSets = sessionsThisWeek.reduce((sum, session) => {
    return sum + (session.exercises ?? []).reduce((exSum, ex) => exSum + (ex.sets ?? []).length, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <Section title="This week's summary">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Sessions" value={sessionsThisWeek.length} tone="burgundy" />
          <StatTile label="Volume" value={`${formatNumber(totalVolume)} kg`} />
          <StatTile label="Total sets" value={totalSets} />
          <StatTile label="Completion" value={`${percent(sessionsThisWeek.length, 5)}%`} />
        </div>
      </Section>

      <Section title="Recent sessions">
        <div className="space-y-2">
          {sessionsThisWeek.slice(0, 5).map((session) => (
            <ListRow
              key={session.id}
              title={session.planTitle ?? session.exercises?.[0]?.exerciseName ?? "Session"}
              subtitle={formatDate(String(session.completedAt))}
              meta={`${formatNumber(session.totalVolumeKg ?? 0)} kg`}
            />
          ))}
          {sessionsThisWeek.length === 0 && (
            <EmptyState title="No sessions this week" hint="Complete workouts to see your weekly summary." />
          )}
        </div>
      </Section>

      <button
        onClick={() => navigate("/history")}
        className="w-full py-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] text-[#6B2D3A] hover:bg-[#F2E8EA] transition-colors cursor-pointer"
      >
        View Full History
      </button>
    </div>
  );
}

function EvolutionTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Section title="Evolution Dashboard" subtitle="Muscle map, performance trends and then-versus-now">
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-6 text-center">
          <p className="text-[#8C7B75] mb-4">Access the full evolution dashboard with detailed analytics</p>
          <button
            onClick={() => navigate("/evolution")}
            className="px-6 py-3 rounded-2xl bg-[#6B2D3A] text-white hover:bg-[#58242F] transition-colors cursor-pointer"
          >
            Open Evolution Page
          </button>
        </div>
      </Section>
    </div>
  );
}
