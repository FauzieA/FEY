import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { db } from "@/db/dexie";
import { TrainingRepository } from "@/repositories/trainingRepository";
import { generateUUID } from "@/utils/uuid";
import { Check } from "lucide-react";

import WorkoutHeader from "@/components/workout/WorkoutHeader";
import RestTimerBar from "@/components/workout/RestTimerBar";
import SetsTable, {type SetItem } from "@/components/workout/SetsTable";
import ExerciseNotes from "@/components/workout/ExerciseNotes";

function parseRepRange(repRange: string) {
  const match = repRange.match(/(\d+)(?:-(\d+))?/);
  if (!match) return 10;
  const low = Number(match[1]);
  const high = match[2] ? Number(match[2]) : low;
  return Math.max(low, high, 10);
}

function getExerciseHistoryDefaults(exercise: typeof EXERCISE_DATABASE[number], logs: any[]) {
  const sets = logs.flatMap((session) =>
    (session.exercises ?? [])
      .filter((exerciseEntry: any) => exerciseEntry.exerciseId === exercise.id)
      .flatMap((exerciseEntry: any) => exerciseEntry.sets ?? [])
  );

  const highestWeightKg = Math.max(
    exercise.defaultWeightKg ?? 0,
    ...sets.map((set: any) => set.weightKg ?? set.weight ?? 0)
  );
  const highestReps = Math.max(
    parseRepRange(exercise.repRange),
    ...sets.map((set: any) => set.reps ?? 0)
  );
  const highestDurationSec = Math.max(
    exercise.defaultTimeSeconds ?? 0,
    ...sets.map((set: any) => set.durationSec ?? 0)
  );

  return {
    weightKg: highestWeightKg,
    reps: highestReps,
    durationSec: Math.max(highestDurationSec, 10),
  };
}

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const exerciseId = searchParams.get("id") || "lb_squat";
  const rawFrom = searchParams.get("from");
  const returnTo = rawFrom ? decodeURIComponent(rawFrom) : "/training";

  const exercise = useMemo(
    () =>
      EXERCISE_DATABASE.find((e) => e.id === exerciseId) ||
      EXERCISE_DATABASE[0],
    [exerciseId]
  );

  const todayStr = useMemo(() => new Date().toDateString(), []);

  const existingLog = useLiveQuery(async () => {
    const logs = await db.sessions.toArray();
    return logs.find(
      (l) =>
        new Date(l.completedAt).toDateString() === todayStr &&
        Array.isArray(l.exercises) &&
        l.exercises.some((ex) => ex.exerciseId === exercise.id)
    );
  }, [exercise.id, todayStr]);

  const exerciseLogs = useLiveQuery(async () => {
    const logs = await db.sessions.toArray();
    return logs.filter(
      (l) =>
        Array.isArray(l.exercises) &&
        l.exercises.some((ex) => ex.exerciseId === exercise.id)
    );
  }, [exercise.id]);

  const [sets, setSets] = useState<SetItem[]>(() => {
    const count = exercise.defaultSets || 3;
    return Array.from({ length: count }, (_, i) => ({
      setNum: i + 1,
      weightKg: exercise.defaultWeightKg || 0,
      reps: 10,
      durationSec: exercise.defaultTimeSeconds || 10,
      completed: false,
    }));
  });

  const [notes, setNotes] = useState("Felt solid today. Kept good form.");

  // Active Set Timer State
  const [activeTimerIndex, setActiveTimerIndex] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetReachedSet, setTargetReachedSet] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Global Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [isRestActive, setIsRestActive] = useState(false);

  useEffect(() => {
    if (existingLog || !exerciseLogs) return;

    const bestDefaults = getExerciseHistoryDefaults(exercise, exerciseLogs);
    const count = exercise.defaultSets || 3;

    setSets(
      Array.from({ length: count }, (_, i) => ({
        setNum: i + 1,
        weightKg: bestDefaults.weightKg,
        reps: bestDefaults.reps,
        durationSec:
          exercise.type === "time"
            ? bestDefaults.durationSec
            : exercise.defaultTimeSeconds || 10,
        completed: false,
      }))
    );
  }, [exercise, existingLog, exerciseLogs]);

  useEffect(() => {
    if (existingLog?.exercises?.[0]?.sets) {
      setSets(
        existingLog.exercises[0].sets.map((s, i) => ({
          setNum: s.setNum ?? i + 1,
          weightKg: s.weightKg ?? 0,
          reps: s.reps ?? 0,
          durationSec: s.durationSec ?? 10,
          completed: s.completed ?? false,
        }))
      );
      if (existingLog.exercises[0].notes) {
        setNotes(existingLog.exercises[0].notes);
      }
    }
  }, [existingLog]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRestActive && restSeconds > 0) {
      timer = setInterval(() => setRestSeconds((prev) => prev - 1), 1000);
    } else if (restSeconds === 0) {
      setIsRestActive(false);
    }
    return () => clearInterval(timer);
  }, [isRestActive, restSeconds]);

  useEffect(() => {
    if (activeTimerIndex !== null) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          const target = sets[activeTimerIndex]?.durationSec || 10;
          if (next === target) {
            setTargetReachedSet(activeTimerIndex);
            if ("vibrate" in navigator) {
              navigator.vibrate([100, 50, 100]);
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimerIndex, sets]);

  const toggleSetTimer = async (index: number) => {
    if (activeTimerIndex === index) {
      if (timerRef.current) clearInterval(timerRef.current);
      const updated = [...sets];
      updated[index].durationSec = elapsedSeconds > 0 ? elapsedSeconds : updated[index].durationSec;
      updated[index].completed = true;
      setSets(updated);
      setActiveTimerIndex(null);
      setElapsedSeconds(0);
      setRestSeconds(90);
      setIsRestActive(true);

      // Auto-save to IndexedDB to prevent sync from overwriting edits
      if (existingLog) {
        const now = new Date().toISOString();
        await TrainingRepository.saveSession({
          ...existingLog,
          updatedAt: now,
          syncStatus: 'pending',
          exercises: [
            {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              sets: updated,
              notes: notes,
            },
          ],
        });
      }
    } else {
      setActiveTimerIndex(index);
      setElapsedSeconds(0);
      setTargetReachedSet(null);
    }
  };

  const handleAddSet = () => {
    setSets((prev) => {
      const lastSet = prev[prev.length - 1];
      return [
        ...prev,
        {
          setNum: prev.length + 1,
          weightKg: lastSet ? lastSet.weightKg : exercise.defaultWeightKg || 0,
          reps: lastSet ? lastSet.reps : 10,
          durationSec: lastSet ? lastSet.durationSec : exercise.defaultTimeSeconds || 10,
          completed: false,
        },
      ];
    });
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets((prev) =>
      prev.filter((_, i) => i !== index).map((st, i) => ({ ...st, setNum: i + 1 }))
    );
  };

  const handleToggleSet = (index: number) => {
    const updated = [...sets];
    updated[index].completed = !updated[index].completed;
    setSets(updated);
    if (updated[index].completed) {
      setRestSeconds(90);
      setIsRestActive(true);
    }
  };

  const handleUpdateSet = async (index: number, field: "weightKg" | "reps" | "durationSec", value: number) => {
    const updated = [...sets];
    updated[index][field] = Math.max(0, value);
    setSets(updated);

    // Auto-save to IndexedDB to prevent sync from overwriting edits
    if (existingLog) {
      const now = new Date().toISOString();
      await TrainingRepository.saveSession({
        ...existingLog,
        updatedAt: now,
        syncStatus: 'pending',
        exercises: [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: updated,
            notes: notes,
          },
        ],
      });
    }
  };

  const handleFinishSession = async () => {
    try {
      const now = new Date().toISOString();
      const sessionId = existingLog?.id || generateUUID();

      await TrainingRepository.saveSession({
        id: sessionId,
        planTitle: exercise.name,
        completedAt: new Date().toISOString(),
        durationMinutes: 5,
        xpEarned: 100,
        createdAt: existingLog?.createdAt || now,
        updatedAt: now,
        syncStatus: 'pending',
        exercises: [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: sets,
            notes: notes,
          },
        ],
      });

      navigate(returnTo);
    } catch (error) {
      console.error("Error saving exercise session:", error);
      navigate(returnTo);
    }
  };

  const isFullyCompleted = sets.every((s) => s.completed) || !!existingLog;

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-3 sm:p-6 md:p-8 pb-32 max-w-3xl mx-auto space-y-4 sm:space-y-6 relative">
      <WorkoutHeader
        exerciseName={exercise.name}
        isFullyCompleted={isFullyCompleted}
        defaultSets={exercise.defaultSets}
        exerciseType={exercise.type}
        defaultTimeSeconds={exercise.defaultTimeSeconds}
        repRange={exercise.repRange}
        onBack={() => navigate(returnTo)}
      />

      <RestTimerBar
        restSeconds={restSeconds}
        isRestActive={isRestActive}
        onToggleRest={() => {
          if (restSeconds === 0) setRestSeconds(90);
          setIsRestActive((prev) => !prev);
        }}
        onResetRest={() => {
          setIsRestActive(false);
          setRestSeconds(90);
        }}
      />

      <SetsTable
        sets={sets}
        exerciseType={exercise.type}
        activeTimerIndex={activeTimerIndex}
        elapsedSeconds={elapsedSeconds}
        targetReachedSet={targetReachedSet}
        onAddSet={handleAddSet}
        onRemoveSet={handleRemoveSet}
        onToggleSet={handleToggleSet}
        onUpdateSet={handleUpdateSet}
        onToggleSetTimer={toggleSetTimer}
      />

      <ExerciseNotes notes={notes} onChangeNotes={setNotes} />

      <button
        onClick={handleFinishSession}
        className="w-full bg-[#6B2D3A] text-[#F8F5F2] hover:bg-[#58242F] font-serif text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#6B2D3A]/20 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        <span>Complete Workout Day</span>
      </button>
    </div>
  );
}