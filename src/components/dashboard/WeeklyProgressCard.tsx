import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";

interface WeeklyProgressCardProps {
  completedExercisesCount: number;
  totalPlannedExercises: number;
  weeklyCompletionPercent: number;
}

export default function WeeklyProgressCard({
  completedExercisesCount,
  totalPlannedExercises,
  weeklyCompletionPercent,
}: WeeklyProgressCardProps) {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-2 bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
          WEEKLY PLAN PROGRESS
        </span>
        <span className="text-xs font-serif italic text-[#6B2D3A]">
          {completedExercisesCount} / {totalPlannedExercises} Exercises Completed
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-5xl md:text-6xl font-serif text-[#1A1817] tracking-tight">
          {weeklyCompletionPercent}%
        </span>
        <span className="text-xs md:text-sm text-[#8C7B75]">
          of overall weekly plan achieved
        </span>
      </div>

      <div className="w-full bg-[#F2E8EA] h-3 rounded-full overflow-hidden p-0.5 border border-[#D9B7BE]/20">
        <div
          className="bg-[#6B2D3A] h-full rounded-full transition-all duration-700"
          style={{ width: `${weeklyCompletionPercent}%` }}
        />
      </div>

      <div className="pt-2 flex items-center justify-between">
        <div className="text-xs text-[#8C7B75]">
          Select exercises freely from your split.
        </div>
        <button
          onClick={() => navigate("/training")}
          className="bg-[#6B2D3A] text-[#F8F5F2] text-xs md:text-sm font-medium px-5 py-3 rounded-2xl shadow-md shadow-[#6B2D3A]/20 flex items-center gap-2 hover:bg-[#58242F] transition-all cursor-pointer"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Start Gym Session</span>
        </button>
      </div>
    </div>
  );
}