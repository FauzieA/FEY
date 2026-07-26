import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sun,
  RotateCcw,
} from "lucide-react";

export default function DailyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  // Simulated daily completion state (keyed by exercise id)
  const [dailyCompleted, setDailyCompleted] = useState<Record<string, boolean>>(
    {
      day_chin_tuck: true,
    },
  );

  // Filter daily exercises
  const dailyExercises = EXERCISE_DATABASE.filter(
    (ex) =>
      ex.tier === "daily" &&
      (activeCategory === "all" || ex.category === activeCategory),
  );

  const totalDaily = EXERCISE_DATABASE.filter(
    (ex) => ex.tier === "daily",
  ).length;
  const completedCount = Object.values(dailyCompleted).filter(Boolean).length;

  const categories = ["all", "posture", "skill", "mobility"];

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/workout")}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-serif text-[#1A1817]">Daily Workouts</h1>
          <p className="text-xs text-[#8C7B75] italic">
            Resets every night at midnight
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress Card */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
              Today's Progress
            </span>
            <div className="font-serif font-bold text-lg text-[#1A1817]">
              {completedCount} of {totalDaily} Completed
            </div>
          </div>
        </div>
        <button
          onClick={() => setDailyCompleted({})}
          className="p-2 text-[#8C7B75] hover:text-[#6B2D3A] transition-colors"
          title="Manual Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSearchParams({ category: cat })}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-[#6B2D3A] text-[#F8F5F2] shadow-sm"
                : "bg-[#FFFCFA] border border-[#EAE3DE] text-[#8C7B75] hover:border-[#6B2D3A]"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        {dailyExercises.map((ex) => {
          const isDone = dailyCompleted[ex.id] || false;
          const returnUrl = encodeURIComponent(
            `/daily?category=${activeCategory}`,
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
                  <span className="text-[10px] bg-[#F8F5F2] text-[#8C7B75] border border-[#EAE3DE] px-2 py-0.5 rounded-full font-mono capitalize">
                    {ex.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8C7B75]">
                  <span>{ex.defaultSets} sets</span>
                  <span>•</span>
                  <span>{ex.repRange}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 text-[#6B2D3A]" />
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
