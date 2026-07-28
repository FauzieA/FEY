import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { db } from "@/db/dexie";
import { Check } from "lucide-react";

import WorkoutHeader from "@/components/workout/WorkoutHeader";
import RestTimerBar from "@/components/workout/RestTimerBar";
import SetsTable, {type SetItem } from "@/components/workout/SetsTable";
import ExerciseNotes from "@/components/workout/ExerciseNotes";
import DailyHabitsModal from "@/components/workout/DailyHabitsModal";

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const exerciseId = searchParams.get("id") || "lb_squat";
  const rawFrom = searchParams.get("from");
  const returnTo = rawFrom ? decodeURIComponent(rawFrom) : "/workout";

  const exercise = useMemo(
    () =>
      EXERCISE_DATABASE.find((e) => e.id === exerciseId) ||
      EXERCISE_DATABASE[0],
    [exerciseId]
  );

  const todayStr = useMemo(() => new Date().toDateString(), []);

  const existingLog = useLiveQuery(async () => {
    const logs = await db.sessions
      .where("id")
      .startsWith(`session_${exercise.id}_`)
      .toArray();
    return logs.find(
      (l) => new Date(l.completedAt).toDateString() === todayStr
    );
  }, [exercise.id, todayStr]);

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
  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);

  // Active Set Timer State
  const [activeTimerIndex, setActiveTimerIndex] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetReachedSet, setTargetReachedSet] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Global Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [isRestActive, setIsRestActive] = useState(false);

  useEffect(() => {
    if (!existingLog) {
      const count = exercise.defaultSets || 3;
      setSets(
        Array.from({ length: count }, (_, i) => ({
          setNum: i + 1,
          weightKg: exercise.defaultWeightKg || 0,
          reps: 10,
          durationSec: exercise.defaultTimeSeconds || 10,
          completed: false,
        }))
      );
    }
  }, [exercise, existingLog]);

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

  const toggleSetTimer = (index: number) => {
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

  const handleUpdateSet = (index: number, field: "weightKg" | "reps" | "durationSec", value: number) => {
    const updated = [...sets];
    updated[index][field] = Math.max(0, value);
    setSets(updated);
  };

  const handleFinishSession = async () => {
    try {
      const totalVolume = sets.reduce(
        (acc, s) => acc + (s.completed ? s.weightKg * s.reps : 0),
        0
      );
      const dateKey = new Date().toISOString().slice(0, 10);
      const sessionId = `session_${exercise.id}_${dateKey}`;

      await db.sessions.put({
        id: sessionId,
        planTitle: exercise.name,
        completedAt: new Date().toISOString(),
        durationMinutes: 5,
        totalVolumeKg: totalVolume,
        xpEarned: 100,
        exercises: [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: sets,
            notes: notes,
          },
        ],
      });

      setIsHabitsModalOpen(false);
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
        onClick={() => setIsHabitsModalOpen(true)}
        className="w-full bg-[#6B2D3A] text-[#F8F5F2] hover:bg-[#58242F] font-serif text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#6B2D3A]/20 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        <span>Complete Exercise Session</span>
      </button>

      <DailyHabitsModal
        isOpen={isHabitsModalOpen}
        onClose={handleFinishSession}
      />
    </div>
  );
}