import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function ClassDayPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  // Standalone completion state for on-demand sessions
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>(
    {},
  );

  const classDayExercises = EXERCISE_DATABASE.filter(
    (ex) =>
      ex.tier === "class_day" &&
      (activeCategory === "all" || ex.category === activeCategory),
  );

  const categories = ["all", "mobility", "balance"];

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
          <h1 className="text-xl font-serif text-[#1A1817]">
            Class Day Workouts
          </h1>
          <p className="text-xs text-[#8C7B75] italic">
            On-Demand • Flexible Mobility & Balance
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Info Card */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-[#1A1817]">
              High-Intensity Class Supplement
            </h2>
            <p className="text-xs text-[#8C7B75]">
              Select and execute these exercises whenever you attend a
              high-intensity class.
            </p>
          </div>
        </div>
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
        {classDayExercises.map((ex) => {
          const isDone = completedToday[ex.id] || false;
          const returnUrl = encodeURIComponent(
            `/class-day?category=${activeCategory}`,
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
