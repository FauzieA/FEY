import { useNavigate } from "react-router-dom";
import { WEEKLY_CATEGORIES, EXERCISE_DATABASE } from "@/db/workoutData";
import { ChevronRight } from "lucide-react";

interface CategoryBreakdownGridProps {
  completedExerciseIds: Set<string>;
}

export default function CategoryBreakdownGrid({
  completedExerciseIds,
}: CategoryBreakdownGridProps) {
  const navigate = useNavigate();

  const getCategoryRoute = (catId: string) => {
    switch (catId) {
      case "lower_body":
      case "upper_push":
      case "upper_pull":
      case "grip":
        return `/weekly?category=${catId}`;
      case "posture":
      case "skill":
      case "mobility":
        return `/daily?category=${catId}`;
      case "balance":
        return `/class-day?category=${catId}`;
      default:
        return `/weekly?category=${catId}`;
    }
  };

  return (
    <div className="lg:col-span-3 space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
        CATEGORY BREAKDOWN
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {WEEKLY_CATEGORIES.map((cat) => {
          const categoryExercises = EXERCISE_DATABASE.filter(
            (ex) => ex.category === cat.id
          );

          const totalCatWorkouts = categoryExercises.length || cat.targetCount || 1;
          const completedCatWorkouts = categoryExercises.filter((ex) =>
            completedExerciseIds.has(ex.id)
          ).length;

          const catPercent = Math.min(
            100,
            Math.round((completedCatWorkouts / totalCatWorkouts) * 100)
          );

          return (
            <div
              key={cat.id}
              onClick={() => navigate(getCategoryRoute(cat.id))}
              className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#D9B7BE] rounded-3xl p-5 shadow-sm transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors">
                  {cat.name}
                </h3>
                <span className="font-mono text-xs font-bold text-[#6B2D3A]">
                  {completedCatWorkouts} / {totalCatWorkouts}
                </span>
              </div>

              <div className="w-full bg-[#F2E8EA] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#6B2D3A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${catPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C7B75]">
                <span>
                  {catPercent === 100 ? "Completed" : `${catPercent}% Completed`}
                </span>
                <ChevronRight className="w-4 h-4 text-[#8C7B75] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}