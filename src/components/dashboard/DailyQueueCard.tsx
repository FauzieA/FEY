import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sun, ChevronRight } from "lucide-react";

interface DailyQueueCardProps {
  dailyCompletedCount: number;
  dailyTotalCount: number;
  isDailyAllDone: boolean;
}

export default function DailyQueueCard({
  dailyCompletedCount,
  dailyTotalCount,
  isDailyAllDone,
}: DailyQueueCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/daily")}
      className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#D9B7BE] rounded-3xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
          TODAY'S DAILY WORKOUT
        </span>
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
            isDailyAllDone
              ? "bg-[#F2E8EA] text-[#6B2D3A] border-[#D9B7BE]"
              : "bg-[#F8F5F2] text-[#8C7B75] border-[#EAE3DE]"
          }`}
        >
          {isDailyAllDone ? "Complete! ✓" : `${dailyCompletedCount}/${dailyTotalCount} Done`}
        </span>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div
          className={`p-3.5 rounded-2xl transition-colors ${
            isDailyAllDone
              ? "bg-[#6B2D3A] text-white"
              : "bg-[#F2E8EA] text-[#6B2D3A]"
          }`}
        >
          {isDailyAllDone ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Sun className="w-7 h-7" />
          )}
        </div>

        <div className="space-y-1">
          <h2 className="font-serif font-bold text-lg text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors">
            Daily Routine Queue
          </h2>
          <p className="text-xs text-[#8C7B75]">
            {dailyCompletedCount} of {dailyTotalCount} exercises finished today
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-[#EAE3DE]/60 flex items-center justify-between text-xs text-[#6B2D3A] font-semibold">
        <span>Open Daily Checklist</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}