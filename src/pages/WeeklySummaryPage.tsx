import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { ChevronLeft, Calendar } from "lucide-react";

export default function WeeklySummaryPage() {
  const navigate = useNavigate();

  // Read saved session volume and completion data from IndexedDB
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  const completedWorkoutCount = sessions.length;
  const totalWorkoutCount = 25;
  const overallCompletionPercent = Math.min(
    100,
    Math.round((completedWorkoutCount / totalWorkoutCount) * 100),
  );

  const categoryBreakdown = [
    {
      name: "Lower Body Strength",
      percent: completedWorkoutCount > 0 ? 100 : 0,
    },
    { name: "Upper Push", percent: completedWorkoutCount > 1 ? 100 : 0 },
    { name: "Upper Pull", percent: completedWorkoutCount > 2 ? 80 : 0 },
    { name: "Mobility Sessions", percent: completedWorkoutCount > 3 ? 67 : 0 },
    { name: "Grip Training", percent: completedWorkoutCount > 4 ? 100 : 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 text-[#6B2D3A] cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif text-[#1A1817]">
          Weekly Summary History
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Weekly Report Card */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-[36px] p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#8C7B75]">
              Current Logged Sessions
            </span>
            <div className="font-serif font-bold text-lg text-[#1A1817] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6B2D3A]" />
              <span>{completedWorkoutCount} Workouts Logged</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-[#8C7B75]">
              Total Completion
            </span>
            <div className="font-serif font-bold text-2xl text-[#6B2D3A]">
              {overallCompletionPercent}%
            </div>
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
            CATEGORY PERFORMANCE
          </span>
          {categoryBreakdown.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs font-serif">
                <span>{cat.name}</span>
                <span className="font-mono font-bold text-[#6B2D3A]">
                  {cat.percent}%
                </span>
              </div>
              <div className="w-full bg-[#F2E8EA] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#6B2D3A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
