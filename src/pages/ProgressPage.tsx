import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { ChevronLeft, Trophy, Target } from "lucide-react";

export default function ProgressPage() {
  const navigate = useNavigate();

  // Retrieve saved sessions from Dexie database
  const savedSessions = useLiveQuery(() => db.sessions.toArray()) || [];

  const personalRecords = [
    {
      name: "Assisted Pull-up",
      best: "15 kg Assistance",
      lastPerformed: "May 12",
      status: "Ready for 12.5 kg",
    },
    {
      name: "Dumbbell Bench Press",
      best: "17.5 kg × 12",
      lastPerformed: "May 10",
      status: "Ready to increase weight",
    },
    {
      name: "Barbell Back Squat",
      best: "45 kg × 10",
      lastPerformed: "May 08",
      status: "Building rep range (8–12)",
    },
    {
      name: "Plank Practice",
      best: "02:15 hold",
      lastPerformed: "May 11",
      status: "Core stability PR",
    },
  ];

  const athleticGoals = [
    {
      goal: "Unassisted Pull-up",
      progress: 75,
      detail: "Currently at 15kg assistance",
    },
    {
      goal: "Standard Push-ups",
      progress: 90,
      detail: "10 clean reps on floor",
    },
    {
      goal: "Deep Squat Comfort",
      progress: 85,
      detail: "60s relaxed hold reached",
    },
    {
      goal: "Splits & High Leg Extension",
      progress: 40,
      detail: "Working on 90/90 & Hamstring mobility",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1817] font-normal">
            Progress & PRs
          </h1>
          <p className="text-xs md:text-sm text-[#8C7B75] italic">
            Overload tracking & athletic milestones
          </p>
        </div>

        <div className="w-10" />
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Logged Sessions in Database */}
        {savedSessions.length > 0 && (
          <div className="lg:col-span-2 bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] block">
              LOGGED SESSIONS IN DEXIE DATABASE ({savedSessions.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {savedSessions.slice(-3).map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl space-y-1 text-xs"
                >
                  <div className="font-serif font-bold text-[#1A1817]">
                    {session.planTitle}
                  </div>
                  <div className="text-[10px] text-[#8C7B75]">
                    {new Date(session.completedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[#6B2D3A] font-mono font-bold text-[11px]">
                    Volume: {session.totalVolumeKg} kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Records & Progressive Overload Memory */}
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
              PROGRESSIVE OVERLOAD RECORDS
            </span>
            <Trophy className="w-5 h-5 text-[#6B2D3A]" />
          </div>

          <div className="space-y-3">
            {personalRecords.map((pr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F8F5F2] border border-[#EAE3DE] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#1A1817]">
                    {pr.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#6B2D3A]">
                    {pr.best}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8C7B75]">
                  <span>Last: {pr.lastPerformed}</span>
                  <span className="text-[10px] bg-[#F2E8EA] text-[#6B2D3A] px-2 py-0.5 rounded-full font-medium">
                    {pr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Long-Term Athletic & Mobility Milestones */}
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
              ATHLETIC SKILL MILESTONES
            </span>
            <Target className="w-5 h-5 text-[#6B2D3A]" />
          </div>

          <div className="space-y-4">
            {athleticGoals.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-semibold text-[#1A1817] text-sm">
                    {item.goal}
                  </span>
                  <span className="font-mono text-[#6B2D3A] font-bold">
                    {item.progress}%
                  </span>
                </div>
                <div className="w-full bg-[#F2E8EA] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6B2D3A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#8C7B75] italic">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
