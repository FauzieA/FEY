import { useNavigate, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE, WEEKLY_CATEGORIES } from "@/db/workoutData";
import { toISODate, startOfWeek } from "@/utils/date";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  Dumbbell,
  RotateCcw,
} from "lucide-react";

export default function WeeklyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const statusFilter = searchParams.get("status") || "all";

  // 🔄 LIVE QUERY: Read sessions directly from Dexie
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  // Calculate completion counts per exercise ID
  const exerciseCompletionCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    // Only count sessions that occurred in the current week
    const sessionDateIso = toISODate(s.completedAt ?? s.startedAt ?? new Date());
    const weekStart = startOfWeek();
    if (sessionDateIso >= weekStart) {
      s.exercises?.forEach((ex: any) => {
        if (ex.exerciseId) {
          exerciseCompletionCounts[ex.exerciseId] =
            (exerciseCompletionCounts[ex.exerciseId] || 0) + 1;
        }
      });
    }
  });

  // 🗑️ UNDO FUNCTION: Deletes the most recent session for this specific exercise
  const handleUndoWorkout = async (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation(); // Prevents navigating to the workout session page

    // Find the latest session containing this exercise
    const targetSession = [...sessions]
      .reverse()
      .find((s) =>
        s.exercises?.some((ex: any) => ex.exerciseId === exerciseId)
      );

    if (targetSession?.id) {
      await db.sessions.delete(targetSession.id);
    }
  };

  const weeklyExercises = EXERCISE_DATABASE.filter(
    (ex) =>
      ex.tier === "weekly" &&
      (activeCategory === "all" || ex.category === activeCategory)
  );

  const filteredExercises = weeklyExercises.filter((ex) => {
    const currentCount = exerciseCompletionCounts[ex.id] || 0;
    const target = ex.requiredPerWeek || 1;
    if (statusFilter === "completed") return currentCount >= target;
    if (statusFilter === "pending") return currentCount < target;
    return true;
  });

  const categoryTabs = [
    { id: "all", name: "All Categories" },
    ...WEEKLY_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
  ];

  const statusTabs = [
    { id: "all", name: "All" },
    { id: "pending", name: "Remaining" },
    { id: "completed", name: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/training")}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-serif text-[#1A1817]">Weekly Gym Plan</h1>
          <p className="text-xs text-[#8C7B75] italic">
            5 Gym Sessions • Weekly Progressive Overload
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Overview Banner */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
              Target System
            </span>
            <div className="font-serif font-bold text-base text-[#1A1817]">
              5 Gym Sessions / Week
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryTabs.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("category", cat.id);
              setSearchParams(params);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-[#6B2D3A] text-[#F8F5F2] shadow-sm"
                : "bg-[#FFFCFA] border border-[#EAE3DE] text-[#8C7B75] hover:border-[#6B2D3A]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Completion Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((status) => (
          <button
            key={status.id}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("status", status.id);
              setSearchParams(params);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === status.id
                ? "bg-[#6B2D3A] text-[#F8F5F2] shadow-sm"
                : "bg-[#FFFCFA] border border-[#EAE3DE] text-[#8C7B75] hover:border-[#6B2D3A]"
            }`}
          >
            {status.name}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {filteredExercises.map((ex) => {
          const currentCount = exerciseCompletionCounts[ex.id] || 0;
          const target = ex.requiredPerWeek || 1;
          const isDone = currentCount >= target;
          const returnUrl = encodeURIComponent(
            `/weekly?category=${activeCategory}&status=${statusFilter}`
          );

          return (
            <div
              key={ex.id}
              onClick={() =>
                navigate(`/workout/session?id=${ex.id}&from=${returnUrl}`)
              }
              className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#D9B7BE] rounded-3xl p-5 shadow-sm transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors">
                    {ex.name}
                  </h3>
                  <span className="text-[10px] bg-[#F8F5F2] text-[#8C7B75] border border-[#EAE3DE] px-2 py-0.5 rounded-full font-mono">
                    {currentCount}/{target} Wk
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8C7B75]">
                  <span>{ex.defaultSets} sets</span>
                  <span>•</span>
                  <span>{ex.repRange}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isDone ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUndoWorkout(e, ex.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F2E8EA] hover:bg-[#E2CFD3] text-[#6B2D3A] text-xs font-semibold transition-colors cursor-pointer"
                      title="Undo completed session"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>
                    <CheckCircle2 className="w-6 h-6 text-[#6B2D3A]" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-[#D9B7BE]" />
                )}
                <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}