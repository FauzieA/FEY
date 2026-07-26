import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EXERCISE_DATABASE, WEEKLY_CATEGORIES } from "@/db/workoutData";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  Dumbbell,
} from "lucide-react";

export default function WeeklyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  // Simulated weekly completion counts
  const [weeklyCompletedCounts, setWeeklyCompletedCounts] = useState<
    Record<string, number>
  >({
    lb_squat: 1,
    ca_cable_crunch: 1,
  });

  const weeklyExercises = EXERCISE_DATABASE.filter(
    (ex) =>
      ex.tier === "weekly" &&
      (activeCategory === "all" || ex.category === activeCategory),
  );

  const categoryTabs = [
    { id: "all", name: "All Categories" },
    ...WEEKLY_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
  ];

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
            onClick={() => setSearchParams({ category: cat.id })}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-[#6B2D3A] text-[#F8F5F2] shadow-sm"
                : "bg-[#FFFCFA] border border-[#EAE3DE] text-[#8C7B75] hover:border-[#6B2D3A]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {weeklyExercises.map((ex) => {
          const currentCount = weeklyCompletedCounts[ex.id] || 0;
          const target = ex.requiredPerWeek || 1;
          const isDone = currentCount >= target;
          const returnUrl = encodeURIComponent(
            `/weekly?category=${activeCategory}`,
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
                  {ex.defaultWeightKg && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[#6B2D3A]">
                        {ex.defaultWeightKg} kg
                      </span>
                    </>
                  )}
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
