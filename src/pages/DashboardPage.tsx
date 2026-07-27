import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { WEEKLY_CATEGORIES, EXERCISE_DATABASE } from "@/db/workoutData";
import {
  Bell,
  Dumbbell,
  Zap,
  Sun,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isClassDayMode, setIsClassDayMode] = useState(false);
  const todayStr = new Date().toDateString();

  // Selected default IDs for daily queue matching DailyPage.tsx
  const dailySelectedIds = [
    "day_chin_tuck",
    "day_wall_angels",
    "day_farmer_carry",
    "day_deep_squat",
  ];

  // Retrieve saved plans and sessions from Dexie
  const plans = useLiveQuery(() => db.plans.toArray()) || [];
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  // Calculate set of completed unique exercise IDs across all logged sessions
  const completedExerciseIds = new Set<string>();
  sessions.forEach((s) => {
    s.exercises?.forEach((ex: any) => {
      if (ex.exerciseId) completedExerciseIds.add(ex.exerciseId);
    });
  });

  // Calculate exercises completed TODAY specifically
  const todayCompletedIds = new Set<string>();
  sessions.forEach((s) => {
    if (new Date(s.completedAt).toDateString() === todayStr) {
      s.exercises?.forEach((ex: any) => {
        if (ex.exerciseId) todayCompletedIds.add(ex.exerciseId);
      });
    }
  });

  // Daily Workout Queue calculations
  const activeDailyPlan = EXERCISE_DATABASE.filter((ex) =>
    dailySelectedIds.includes(ex.id)
  );
  const dailyCompletedCount = activeDailyPlan.filter((ex) =>
    todayCompletedIds.has(ex.id)
  ).length;
  const dailyTotalCount = activeDailyPlan.length;
  const isDailyAllDone =
    dailyCompletedCount > 0 && dailyCompletedCount === dailyTotalCount;

  // Calculate Total Planned Exercises across weekly split
  const totalPlannedExercises =
    plans.reduce((sum, p) => sum + (p.exercises?.length || 0), 0) || EXERCISE_DATABASE.length;

  const completedExercisesCount = completedExerciseIds.size;

  // Percentage based on Weekly Plan Execution
  const weeklyCompletionPercent = Math.min(
    100,
    Math.round((completedExercisesCount / (totalPlannedExercises || 1)) * 100)
  );

  // Route Helper function to send users to the exact category list page
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

          <button className="p-2.5 rounded-full bg-[#FFFCFA] border border-[#EAE3DE] text-[#6B2D3A] shadow-sm hover:bg-[#F2E8EA]/50 transition cursor-pointer">
            <Bell className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Overall Weekly Progress Card */}
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
              onClick={() => navigate("/workout?session=custom")}
              className="bg-[#6B2D3A] text-[#F8F5F2] text-xs md:text-sm font-medium px-5 py-3 rounded-2xl shadow-md shadow-[#6B2D3A]/20 flex items-center gap-2 hover:bg-[#58242F] transition-all cursor-pointer"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Start Gym Session</span>
            </button>
          </div>
        </div>

        {/* Dynamic Daily Workout Queue Card */}
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

        {/* Category Breakdown Grid */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
            CATEGORY BREAKDOWN
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {WEEKLY_CATEGORIES.map((cat) => {
              // Find exercises matching this category
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
      </div>
    </div>
  );
}