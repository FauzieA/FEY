import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WeeklyProgressCard from "@/components/dashboard/WeeklyProgressCard";
import DailyQueueCard from "@/components/dashboard/DailyQueueCard";
import CategoryBreakdownGrid from "@/components/dashboard/CategoryBreakdownGrid";

export default function DashboardPage() {
  const [isClassDayMode, setIsClassDayMode] = useState(false);
  const todayStr = new Date().toDateString();

  // Selected default IDs for daily queue matching DailyPage.tsx
  const dailySelectedIds = [
    "day_chin_tuck",
    "day_wall_angels",
    "day_farmer_carry",
    "day_deep_squat",
  ];

  // Retrieve saved sessions from Dexie
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

  // Weekly workout calculations matching WorkoutHubPage.tsx
  const weeklyExercises = EXERCISE_DATABASE.filter(
    (ex) => ex.tier === "weekly"
  );
  const totalPlannedExercises = weeklyExercises.length || 1;
  const completedExercisesCount = weeklyExercises.filter((ex) =>
    completedExerciseIds.has(ex.id)
  ).length;

  // Percentage based on Weekly Plan Execution
  const weeklyCompletionPercent = Math.min(
    100,
    Math.round((completedExercisesCount / (totalPlannedExercises || 1)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-6xl mx-auto space-y-6">
      <DashboardHeader
        isClassDayMode={isClassDayMode}
        setIsClassDayMode={setIsClassDayMode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <WeeklyProgressCard
          completedExercisesCount={completedExercisesCount}
          totalPlannedExercises={totalPlannedExercises}
          weeklyCompletionPercent={weeklyCompletionPercent}
        />

        <DailyQueueCard
          dailyCompletedCount={dailyCompletedCount}
          dailyTotalCount={dailyTotalCount}
          isDailyAllDone={isDailyAllDone}
        />

        <CategoryBreakdownGrid completedExerciseIds={completedExerciseIds} />
      </div>
    </div>
  );
}