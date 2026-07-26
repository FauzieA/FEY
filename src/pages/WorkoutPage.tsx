import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { db } from "@/db/dexie";
import {
  ChevronLeft,
  Check,
  Plus,
  Minus,
  MoreHorizontal,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Timer,
} from "lucide-react";

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
    [exerciseId],
  );

  const todayStr = useMemo(() => new Date().toDateString(), []);

  // Load previous completion log for this exercise today if it exists
  const existingLog = useLiveQuery(async () => {
    const logs = await db.sessions
      .where("id")
      .startsWith(`session_${exercise.id}_`)
      .toArray();
    return logs.find(
      (l) => new Date(l.completedAt).toDateString() === todayStr,
    );
  }, [exercise.id, todayStr]);

  const [sets, setSets] = useState([
    {
      setNum: 1,
      weightKg: exercise.defaultWeightKg || 0,
      reps: 10,
      durationSec: exercise.defaultTimeSeconds || 60,
      completed: false,
    },
    {
      setNum: 2,
      weightKg: exercise.defaultWeightKg || 0,
      reps: 10,
      durationSec: exercise.defaultTimeSeconds || 60,
      completed: false,
    },
    {
      setNum: 3,
      weightKg: exercise.defaultWeightKg || 0,
      reps: 10,
      durationSec: exercise.defaultTimeSeconds || 60,
      completed: false,
    },
  ]);

  const [notes, setNotes] = useState("Felt solid today. Kept good form.");

  // Sync state cleanly when existing database log is fetched
  useEffect(() => {
    if (existingLog?.exercises?.[0]?.sets) {
      setSets(existingLog.exercises[0].sets);
      if (existingLog.exercises[0].notes) {
        setNotes(existingLog.exercises[0].notes);
      }
    }
  }, [existingLog]);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [isRestActive, setIsRestActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRestActive && restSeconds > 0) {
      timer = setInterval(() => setRestSeconds((prev) => prev - 1), 1000);
    } else if (restSeconds === 0) {
      setIsRestActive(false);
    }
    return () => clearInterval(timer);
  }, [isRestActive, restSeconds]);

  const toggleRestTimer = () => {
    if (restSeconds === 0) setRestSeconds(90);
    setIsRestActive((prev) => !prev);
  };

  const resetRestTimer = () => {
    setIsRestActive(false);
    setRestSeconds(90);
  };

  const handleToggleSet = (index: number) => {
    const updated = [...sets];
    updated[index].completed = !updated[index].completed;
    setSets(updated);

    // Auto trigger rest timer on set completion
    if (updated[index].completed) {
      setRestSeconds(90);
      setIsRestActive(true);
    }
  };

  const handleUpdateSet = (
    index: number,
    field: "weightKg" | "reps" | "durationSec",
    delta: number,
  ) => {
    const updated = [...sets];
    updated[index][field] = Math.max(0, updated[index][field] + delta);
    setSets(updated);
  };

  const handleCompleteSession = async () => {
    try {
      const totalVolume = sets.reduce(
        (acc, s) => acc + (s.completed ? s.weightKg * s.reps : 0),
        0,
      );

      // Save session keeping exact set completion state
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
            sets: sets, // Preserves true completed states
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
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate(returnTo)}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center space-y-0.5 px-2">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-lg sm:text-xl md:text-2xl font-serif text-[#1A1817] line-clamp-1">
              {exercise.name}
            </h1>
            {isFullyCompleted && (
              <span className="bg-[#6B2D3A] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                Done ✓
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-[#8C7B75] italic">
            Target: {exercise.defaultSets} sets × {exercise.repRange}
          </p>
        </div>

        <button className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* Rest Timer Floating Bar */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-[#6B2D3A]" />
          <span className="text-xs font-serif font-bold text-[#1A1817]">
            Rest Timer:
          </span>
          <span className="font-mono text-base font-bold text-[#6B2D3A]">
            {Math.floor(restSeconds / 60)}:
            {String(restSeconds % 60).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleRestTimer}
            className="p-2 rounded-xl bg-[#F2E8EA] text-[#6B2D3A] hover:bg-[#D9B7BE]/40 transition cursor-pointer"
          >
            {isRestActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={resetRestTimer}
            className="p-2 rounded-xl bg-[#F8F5F2] border border-[#EAE3DE] text-[#8C7B75] hover:text-[#1A1817] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exercise Specs */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
            Exercise Tier & Category
          </span>
          <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 border-t border-[#EAE3DE] pt-3 text-xs">
          <div>
            <span className="text-[#8C7B75] block text-[10px] uppercase font-bold">
              Category
            </span>
            <span className="font-serif font-bold text-[#1A1817] capitalize">
              {exercise.category?.replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-[#8C7B75] block text-[10px] uppercase font-bold">
              Tier
            </span>
            <span className="font-serif font-bold text-[#6B2D3A] capitalize">
              {exercise.tier?.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Sets Logging Table */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] block">
          SETS LOG
        </span>

        <div className="space-y-3">
          {sets.map((st, idx) => (
            <div
              key={st.setNum}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                st.completed
                  ? "bg-[#F2E8EA]/60 border-[#6B2D3A] text-[#1A1817]"
                  : "bg-[#F8F5F2] border-[#EAE3DE] text-[#1A1817]"
              }`}
            >
              <span className="font-serif font-bold text-xs sm:text-sm shrink-0 w-12">
                Set {st.setNum}
              </span>

              {/* Adjusters Flex Wrapper */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1 px-1">
                {exercise.type === "weight_reps" && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={() => handleUpdateSet(idx, "weightKg", -1)}
                      className="w-7 h-7 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs sm:text-sm font-bold min-w-[36px] text-center">
                      {st.weightKg}kg
                    </span>
                    <button
                      onClick={() => handleUpdateSet(idx, "weightKg", 1)}
                      className="w-7 h-7 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {exercise.type !== "time" && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={() => handleUpdateSet(idx, "reps", -1)}
                      className="w-7 h-7 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs sm:text-sm font-bold min-w-[28px] text-center">
                      {st.reps} reps
                    </span>
                    <button
                      onClick={() => handleUpdateSet(idx, "reps", 1)}
                      className="w-7 h-7 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Complete Toggle Checkbox */}
              <button
                onClick={() => handleToggleSet(idx)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  st.completed
                    ? "bg-[#6B2D3A] text-white shadow-sm"
                    : "border bg-white text-transparent"
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] block">
          EXERCISE NOTES
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl p-3 text-xs text-[#4A423E] focus:outline-none focus:border-[#6B2D3A]"
        />
      </div>

      {/* Complete Session Button */}
      <button
        onClick={handleCompleteSession}
        className="w-full bg-[#6B2D3A] text-[#F8F5F2] hover:bg-[#58242F] font-serif text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#6B2D3A]/20 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        <span>Complete Exercise Session</span>
      </button>
    </div>
  );
}
