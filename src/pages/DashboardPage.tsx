import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { WEEKLY_CATEGORIES } from "@/db/workoutData";
import {
  Bell,
  Dumbbell,
  Zap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isClassDayMode, setIsClassDayMode] = useState(false);

  // Retrieve saved plans and sessions from Dexie
  const plans = useLiveQuery(() => db.plans.toArray()) || [];
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  // Calculate Total Planned Exercises across weekly split
  const totalPlannedExercises =
    plans.reduce((sum, p) => sum + (p.exercises?.length || 0), 0) || 15; // fallback target

  // Calculate Total Completed Unique Exercises logged
  const completedExercisesCount = sessions.length;

  // Percentage based on Weekly Plan Execution
  const weeklyCompletionPercent = Math.min(
    100,
    Math.round((completedExercisesCount / totalPlannedExercises) * 100),
  );

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs md:text-sm text-[#8C7B75] font-serif italic">
            Weekly Overview
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-[#6B2D3A] tracking-wider font-normal uppercase">
            FEY
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsClassDayMode(!isClassDayMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              isClassDayMode
                ? "bg-[#6B2D3A] text-[#F8F5F2] border-[#6B2D3A] shadow-md shadow-[#6B2D3A]/20"
                : "bg-[#FFFCFA] text-[#8C7B75] border-[#EAE3DE] hover:border-[#6B2D3A]"
            }`}
          >
            <Zap
              className={`w-4 h-4 ${
                isClassDayMode ? "fill-current text-[#F8F5F2]" : ""
              }`}
            />
            <span>{isClassDayMode ? "Class Day Mode" : "Standard Gym"}</span>
          </button>

          <button className="p-2.5 rounded-full bg-[#FFFCFA] border border-[#EAE3DE] text-[#6B2D3A] shadow-sm hover:bg-[#F2E8EA]/50 transition">
            <Bell className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </header>

      {/* Overall Weekly Progress Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
              WEEKLY PLAN PROGRESS
            </span>
            <span className="text-xs font-serif italic text-[#6B2D3A]">
              {completedExercisesCount} / {totalPlannedExercises} Exercises
              Completed
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
              onClick={() => navigate("/workout?session=custom")}
              className="bg-[#6B2D3A] text-[#F8F5F2] text-xs md:text-sm font-medium px-5 py-3 rounded-2xl shadow-md shadow-[#6B2D3A]/20 flex items-center gap-2 hover:bg-[#58242F] transition-all cursor-pointer"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Start Gym Session</span>
            </button>
          </div>
        </div>

        {/* Daily Non-Negotiable Habits Card */}
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
              EVERY VISIT HABITS
            </span>
            <Sparkles className="w-4 h-4 text-[#6B2D3A]" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5F2] border border-[#EAE3DE]">
              <div>
                <div className="font-serif text-sm font-bold text-[#1A1817]">
                  Posture Work
                </div>
                <div className="text-[10px] text-[#8C7B75]">
                  Chin Tucks, Wall Angels
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#6B2D3A]" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5F2] border border-[#EAE3DE]">
              <div>
                <div className="font-serif text-sm font-bold text-[#1A1817]">
                  Skill Practice
                </div>
                <div className="text-[10px] text-[#8C7B75]">
                  Pull-up, Push-up, Deep Squat
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#6B2D3A]" />
            </div>
          </div>
        </div>

        {/* Category Breakdown Grid */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
            CATEGORY BREAKDOWN
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {WEEKLY_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/workout?category=${cat.id}`)}
                className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#D9B7BE] rounded-3xl p-5 shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base text-[#1A1817]">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#6B2D3A]">
                    {weeklyCompletionPercent > 0 ? "In Progress" : "Pending"}
                  </span>
                </div>

                <div className="w-full bg-[#F2E8EA] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6B2D3A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${weeklyCompletionPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8C7B75]">
                  <span>
                    Target: {cat.targetCount} {cat.unitLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
