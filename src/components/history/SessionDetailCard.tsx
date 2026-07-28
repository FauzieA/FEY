import { CheckCircle2, ChevronDown } from "lucide-react";
import { EXERCISE_DATABASE } from "@/db/workoutData";

interface SessionDetailCardProps {
  session: any;
  sessionId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function SessionDetailCard({
  session,
  isExpanded,
  onToggle,
}: SessionDetailCardProps) {
  const dateObj = new Date(session.completedAt);
  const dayName = dateObj.toLocaleDateString(undefined, { weekday: "short" });
  const dateNum = dateObj.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const isDaily = session.sessionType === "daily";
  const sessionName = session.name || "Gym Session";

  return (
    <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl overflow-hidden transition-all shadow-2xs">
      {/* Day Bar */}
      <div
        onClick={onToggle}
        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F2E8EA]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl text-xs font-bold text-center min-w-12 ${
              isDaily ? "bg-[#F2E8EA] text-[#6B2D3A]" : "bg-[#6B2D3A] text-white"
            }`}
          >
            <span className="block text-[9px] uppercase opacity-80 leading-tight">
              {dayName}
            </span>
            <span className="font-serif">{dateNum}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-sm text-[#1A1817]">
                {isDaily ? "Daily Routine" : sessionName}
              </h4>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                  isDaily
                    ? "bg-[#F8F5F2] text-[#8C7B75] border-[#EAE3DE]"
                    : "bg-[#F2E8EA] text-[#6B2D3A] border-[#D9B7BE]/40"
                }`}
              >
                {isDaily ? "Daily Reset" : "Gym Split"}
              </span>
            </div>
            <p className="text-[11px] text-[#8C7B75] mt-0.5">
              {session.exercises?.length || 0} exercises completed
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#8C7B75] transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Exercises Drill-Down */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#EAE3DE]/60 bg-[#F8F5F2]/20 space-y-3">
          {session.exercises?.map((ex: any, eIdx: number) => {
            const dbEx = EXERCISE_DATABASE.find(
              (item) => item.id === ex.exerciseId
            );
            const exName =
              dbEx?.name || ex.exerciseId || `Exercise ${eIdx + 1}`;

            return (
              <div
                key={eIdx}
                className="p-3 bg-[#FFFCFA] rounded-xl border border-[#EAE3DE] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-serif font-bold text-[#1A1817]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6B2D3A]" />
                    {exName}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C7B75]">
                    {ex.sets?.length || 0} sets
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                  {ex.sets?.map((set: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="bg-[#F8F5F2] px-2 py-1 rounded-lg border border-[#EAE3DE] text-center"
                    >
                      <span className="text-[9px] text-[#8C7B75] block uppercase">
                        Set {sIdx + 1}
                      </span>
                      <span className="font-semibold text-[#1A1817]">
                        {set.reps || 0} reps
                        {set.weight ? ` @ ${set.weight}kg` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}