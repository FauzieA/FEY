import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { TrainingRepository } from "@/repositories/trainingRepository";
import { type WorkoutSession } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { addDays, formatDate, startOfWeek, toISODate, today, weekDates, weekdayLabel } from "@/utils/date";
import { percent } from "@/utils/format";
import { generateUUID } from "@/utils/uuid";
import HeroOverview from "@/components/evolution/HeroOverview";
import MuscleMap from "@/components/evolution/MuscleMap";
import PerformanceTrends from "@/components/evolution/PerformanceTrends";


const TABS = [
  { id: "overview", label: "Overview" },
  { id: "log", label: "Log a workout" },
  { id: "history", label: "Exercise history" },
  { id: "evolution", label: "Evolution" },
];

const TRACKS = [
  { path: "/weekly", title: "Weekly Gym Plan", blurb: "Structured progressive overload across push, pull, lower and core." },
  { path: "/daily", title: "Daily Movement Queue", blurb: "Posture, grip and movement-skill work to do every day." },
  { path: "/class-day", title: "Class Day", blurb: "Low-fatigue routines for active recovery and quick energy burn." },
];

interface WorkoutDayGroup {
  date: string;
  workoutCount: number;
  sessions: WorkoutSession[];
}

interface WorkoutWeekGroup {
  weekStart: string;
  weekEnd: string;
  completedDays: number;
  targetDays: number;
  dayGroups: WorkoutDayGroup[];
}

function buildWorkoutDayGroups(sessions: WorkoutSession[]): WorkoutDayGroup[] {
  const grouped = new Map<string, WorkoutSession[]>();

  sessions.forEach((session) => {
    const date = toISODate(session.completedAt ?? session.startedAt ?? new Date());
    const next = grouped.get(date) ?? [];
    next.push(session);
    grouped.set(date, next);
  });

  return Array.from(grouped.entries())
    .map(([date, daySessions]) => ({
      date,
      workoutCount: daySessions.length,
      sessions: daySessions.sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt))),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function buildWorkoutWeekGroups(sessions: WorkoutSession[]): WorkoutWeekGroup[] {
  const dayGroups = buildWorkoutDayGroups(sessions);
  const grouped = new Map<string, WorkoutDayGroup[]>();

  dayGroups.forEach((dayGroup) => {
    const weekStart = startOfWeek(dayGroup.date);
    const next = grouped.get(weekStart) ?? [];
    next.push(dayGroup);
    grouped.set(weekStart, next);
  });

  return Array.from(grouped.entries())
    .map(([weekStart, dayGroupsForWeek]) => ({
      weekStart,
      weekEnd: addDays(weekStart, 6),
      completedDays: dayGroupsForWeek.length,
      targetDays: 5,
      dayGroups: dayGroupsForWeek.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

function getExerciseTierLabel(exerciseId?: string): string {
  const definition = EXERCISE_DATABASE.find((item) => item.id === exerciseId);
  if (!definition?.tier) return "workout";
  return definition.tier.replace(/_/g, " ");
}

export default function TrainingPage() {
  const [tab, setTab] = useState("overview");
  const snapshot = useFeySnapshot();

  const weekStart = startOfWeek();
  const sessionsThisWeek = snapshot.sessions.filter((session) => toISODate(session.completedAt ?? session.startedAt ?? new Date()) >= weekStart);
  const workoutDaysThisWeek = new Set(
    sessionsThisWeek.map((session) => toISODate(session.completedAt ?? session.startedAt ?? new Date())),
  ).size;
  const weeklyCompletionPercent = percent(workoutDaysThisWeek, 5);
  const weeklyExerciseDefinitions = EXERCISE_DATABASE.filter((exercise) => exercise.tier === "weekly");
  const completedWeeklyExerciseIds = new Set<string>();
  sessionsThisWeek.forEach((session) => {
    session.exercises?.forEach((exercise: any) => {
      if (exercise.exerciseId && weeklyExerciseDefinitions.some((definition) => definition.id === exercise.exerciseId)) {
        completedWeeklyExerciseIds.add(exercise.exerciseId);
      }
    });
  });
  const completedWeeklyExercisesCount = completedWeeklyExerciseIds.size;
  const allTimeWorkoutDays = new Set(
    snapshot.sessions.map((session) => toISODate(session.completedAt ?? session.startedAt ?? new Date())),
  ).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Body & Capacity"
        title="Training"
        description="Everything from the original workout tracker, plus logging, history, progression and analytics."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Weekly completion" value={`${weeklyCompletionPercent}%`} tone="burgundy" />
        <StatTile label="Workout days" value={`${workoutDaysThisWeek} / 5`} />
        <StatTile label="All-time sessions" value={allTimeWorkoutDays} />
        <StatTile label="Weekly workouts" value={`${completedWeeklyExercisesCount} / ${weeklyExerciseDefinitions.length}`} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" && <OverviewTab />}
      {tab === "log" && <LogTab />}
      {tab === "history" && <HistoryTab />}
      {tab === "evolution" && <EvolutionTab />}
    </div>
  );
}

function OverviewTab() {
  const navigate = useNavigate();
  const snapshot = useFeySnapshot();

  const workoutDaysByDate = new Map<string, boolean>();
  snapshot.sessions.forEach((session) => {
    const date = toISODate(session.completedAt ?? session.startedAt ?? new Date());
    workoutDaysByDate.set(date, true);
  });

  const days = weekDates().map((date) => ({
    date,
    workoutDay: workoutDaysByDate.has(date),
  }));

  return (
    <div className="space-y-6">
      <Section title="This week">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div
              key={day.date}
              className={`rounded-2xl border p-2 text-center ${
                day.workoutDay ? "border-[#6B2D3A]/30 bg-[#F2E8EA]" : "border-[#EAE3DE] bg-[#FFFCFA]"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-widest text-[#8C7B75]">{weekdayLabel(day.date)}</span>
              <span className="font-serif text-lg text-[#6B2D3A]">{day.workoutDay ? "●" : "·"}</span>
            </div>
          ))}
        </div>
        <ProgressBar
          value={percent(days.filter((day) => day.workoutDay).length, 5)}
          label="Weekly target"
          caption={`${days.filter((day) => day.workoutDay).length} / 5 training days`}
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

          const now = new Date().toISOString();
          await TrainingRepository.saveSession({
            id: generateUUID(),
            planTitle: exercise.name,
            completedAt: new Date(`${form.date}T12:00:00`).toISOString(),
            durationMinutes: Number(form.durationMinutes) || 0,
            completed: true,
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
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
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<Record<string, string[]>>({});
  const weeklyGroups = useMemo(() => buildWorkoutWeekGroups(snapshot.sessions), [snapshot.sessions]);

  const toggleWeek = (weekStart: string) => {
    setExpandedWeeks((current) => (current.includes(weekStart) ? current.filter((value) => value !== weekStart) : [...current, weekStart]));
  };

  const toggleDay = (weekStart: string, dayDate: string) => {
    setExpandedDays((current) => ({
      ...current,
      [weekStart]: current[weekStart]?.includes(dayDate)
        ? current[weekStart].filter((value) => value !== dayDate)
        : [...(current[weekStart] ?? []), dayDate],
    }));
  };

  return (
    <Section title="Exercise history" subtitle="Weeks collapse by default, days expand underneath them, and workouts expand beneath each day">
      {weeklyGroups.length === 0 && <EmptyState title="No workout days logged yet" hint="Use Log a workout or one of the training tracks to start building your history." />}
      <div className="space-y-3">
        {weeklyGroups.map((week) => {
          const isWeekExpanded = expandedWeeks.includes(week.weekStart);
          const expandedDayDates = expandedDays[week.weekStart] ?? [];

          return (
            <div key={week.weekStart} className="rounded-[24px] border border-[#EAE3DE] bg-white p-4 shadow-xs">
              <button
                type="button"
                onClick={() => toggleWeek(week.weekStart)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div>
                  <div className="font-serif text-sm text-[#1A1817]">
                    Week of {formatDate(week.weekStart)}{week.weekEnd !== week.weekStart ? ` – ${formatDate(week.weekEnd)}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-[#8C7B75]">
                    {week.completedDays} workout day{week.completedDays === 1 ? "" : "s"} • {week.dayGroups.length} logged day{week.dayGroups.length === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#F2E8EA] px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#6B2D3A]">
                    {week.completedDays} / {week.targetDays}
                  </span>
                  <span className="text-sm text-[#8C7B75]">{isWeekExpanded ? "▴" : "▾"}</span>
                </div>
              </button>

              {isWeekExpanded && (
                <>
                  <div className="mt-3">
                    <ProgressBar
                      value={percent(week.completedDays, week.targetDays)}
                      label="Workout days"
                      caption={`${week.completedDays} of ${week.targetDays} planned workout days`}
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    {week.dayGroups.map((dayGroup) => {
                      const isDayExpanded = expandedDayDates.includes(dayGroup.date);
                      return (
                        <div key={dayGroup.date} className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA]">
                          <button
                            type="button"
                            onClick={() => toggleDay(week.weekStart, dayGroup.date)}
                            className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left"
                          >
                            <div>
                              <div className="font-serif text-sm text-[#1A1817]">{formatDate(dayGroup.date)}</div>
                              <div className="mt-1 text-xs text-[#8C7B75]">{weekdayLabel(dayGroup.date)} • {dayGroup.workoutCount} workout{dayGroup.workoutCount === 1 ? "" : "s"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#F2E8EA] px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#6B2D3A]">
                                {dayGroup.workoutCount} logged
                              </span>
                              <span className="text-sm text-[#8C7B75]">{isDayExpanded ? "▴" : "▾"}</span>
                            </div>
                          </button>

                          {isDayExpanded && (
                            <div className="border-t border-[#EAE3DE] p-3 space-y-3">
                              {dayGroup.sessions.map((session) => (
                                <div key={session.id} className="rounded-2xl border border-[#EAE3DE] bg-white p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="font-serif text-sm text-[#1A1817]">
                                        {session.planTitle ?? session.exercises?.[0]?.exerciseName ?? "Workout"}
                                      </div>
                                      <div className="mt-1 text-xs text-[#8C7B75]">{formatDate(String(session.completedAt))}</div>
                                    </div>
                                    <div className="rounded-full border border-[#EAE3DE] px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#8C7B75]">
                                      {session.durationMinutes ?? 0} min
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(session.exercises ?? []).map((exercise, index) => (
                                      <span
                                        key={`${session.id}-${exercise.exerciseId ?? index}`}
                                        className="rounded-full border border-[#EAE3DE] bg-[#F8F5F2] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#6B2D3A]"
                                      >
                                        {getExerciseTierLabel(exercise.exerciseId)}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="mt-3 space-y-2">
                                    {(session.exercises ?? []).map((exercise, index) => (
                                      <div key={`${session.id}-${exercise.exerciseId ?? index}`} className="rounded-xl bg-[#F8F5F2] p-2.5">
                                        <div className="text-sm font-medium text-[#1A1817]">
                                          {exercise.exerciseName ?? exercise.name ?? "Exercise"}
                                        </div>
                                        {(exercise.sets ?? []).length > 0 ? (
                                          <div className="mt-2 flex flex-wrap gap-1.5">
                                            {(exercise.sets ?? []).map((set, setIndex) => (
                                              <span
                                                key={`${session.id}-${exercise.exerciseId ?? index}-${setIndex}`}
                                                className="rounded-full border border-[#EAE3DE] bg-white px-2 py-0.5 font-mono text-[10px] text-[#6B2D3A]"
                                              >
                                                {(set.weightKg ?? set.weight ?? 0) > 0
                                                  ? `${set.weightKg ?? set.weight}kg × ${set.reps ?? 0}`
                                                  : `${set.reps ?? set.durationSec ?? 0}${set.reps ? " reps" : "s"}`}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="mt-2 text-xs text-[#8C7B75]">No sets logged</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function EvolutionTab() {
  const [timeFilter, setTimeFilter] = useState<"30D" | "3M" | "1Y" | "ALL">("30D");

  return (
    <div className="space-y-6">
      <Section title="Evolution Dashboard" subtitle="Muscle map, performance trends and then-versus-now">
        <div className="bg-white rounded-full p-1 border border-[#EAE3DE] flex shadow-xs w-fit mb-4">
          {(["30D", "3M", "1Y", "ALL"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                timeFilter === filter
                  ? "bg-[#6B2D3A] text-white shadow-xs"
                  : "text-[#8C7B75] hover:text-[#2C2A29]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="space-y-8">
          <HeroOverview timeFilter={timeFilter} />
          <MuscleMap />
          <PerformanceTrends />
        </div>
      </Section>
    </div>
  );
}
 