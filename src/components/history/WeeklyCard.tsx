import { Calendar, ChevronDown } from "lucide-react";
import SessionDetailCard from "./SessionDetailCard";

interface WeeklyCardProps {
  week: {
    weekKey: string;
    label: string;
    mondayDate: Date;
    sessions: any[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  selectedDayDetail: string | null;
  onSelectDayDetail: (id: string | null) => void;
}

export default function WeeklyCard({
  week,
  isExpanded,
  onToggle,
  selectedDayDetail,
  onSelectDayDetail,
}: WeeklyCardProps) {
  let totalSets = 0;
  let totalReps = 0;
  let gymSessionCount = 0;
  let dailyHabitCount = 0;

  week.sessions.forEach((sess) => {
    const isDailySess = sess.sessionType === "daily";
    if (isDailySess) dailyHabitCount++;
    else gymSessionCount++;

    sess.exercises?.forEach((ex: any) => {
      ex.sets?.forEach((s: any) => {
        totalSets++;
        totalReps += Number(s.reps) || 0;
      });
    });
  });

  return (
    <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl transition-all shadow-sm overflow-hidden">
      {/* Weekly Card Header */}
      <div
        onClick={onToggle}
        className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F5F2]/50 transition-colors"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
              Week Log
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2E8EA] text-[#6B2D3A] font-bold">
              {week.weekKey}
            </span>
          </div>
          <h2 className="font-serif font-bold text-lg text-[#1A1817] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#6B2D3A]" />
            <span>{week.label}</span>
          </h2>
        </div>

        {/* Summary Metric Pills */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE3DE]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F8F5F2] px-2.5 py-1.5 rounded-xl border border-[#EAE3DE]">
              <span className="block text-[9px] uppercase text-[#8C7B75] font-bold">
                Gym
              </span>
              <span className="font-serif font-bold text-xs text-[#6B2D3A]">
                {gymSessionCount}
              </span>
            </div>
            <div className="bg-[#F8F5F2] px-2.5 py-1.5 rounded-xl border border-[#EAE3DE]">
              <span className="block text-[9px] uppercase text-[#8C7B75] font-bold">
                Daily
              </span>
              <span className="font-serif font-bold text-xs text-[#6B2D3A]">
                {dailyHabitCount}
              </span>
            </div>
            <div className="bg-[#F8F5F2] px-2.5 py-1.5 rounded-xl border border-[#EAE3DE]">
              <span className="block text-[9px] uppercase text-[#8C7B75] font-bold">
                Volume
              </span>
              <span className="font-serif font-bold text-xs text-[#1A1817]">
                {totalSets}s / {totalReps}r
              </span>
            </div>
          </div>

          <div
            className={`p-1.5 rounded-full bg-[#F2E8EA] text-[#6B2D3A] transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Collapsible Daily Breakdown View */}
      {isExpanded && (
        <div className="border-t border-[#EAE3DE] bg-[#F8F5F2]/40 p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8C7B75] border-b border-[#EAE3DE] pb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Logged Days Breakdown
            </span>
            <span>{week.sessions.length} sessions logged</span>
          </div>

          <div className="space-y-3">
            {week.sessions.map((sess, idx) => {
              const sessionId = sess.id ? String(sess.id) : `sess-${idx}`;
              const isDayExpanded = selectedDayDetail === sessionId;

              return (
                <SessionDetailCard
                  key={sessionId}
                  session={sess}
                  sessionId={sessionId}
                  isExpanded={isDayExpanded}
                  onToggle={() =>
                    onSelectDayDetail(isDayExpanded ? null : sessionId)
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}