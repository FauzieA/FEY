import { db } from "./dexie";

export async function initializeDatabase() {
  const existingChar = await db.character.get("user");

  if (!existingChar) {
    // Initial Character Profile
    await db.character.put({
      id: "user",
      level: 1,
      currentXp: 0,
      nextLevelXp: 1000,
      currentStreak: 0,
      lastWorkoutDate: null,
      attributes: {
        STR: 10,
        END: 10,
        VOL: 10,
        CON: 10,
      },
    });

    // Default App Settings
    await db.settings.put({
      id: "app_settings",
      defaultRestSeconds: 90,
      soundEnabled: true,
      vibrationEnabled: true,
    });

    // Default 7-Day Workout Split
    await db.plans.bulkPut([
      {
        id: "plan_mon",
        title: "Chest & Triceps Focus",
        dayOfWeek: 1,
        targetMuscles: ["Chest", "Triceps"],
        exercises: [
          {
            exerciseId: "bench_press",
            exerciseName: "Barbell Bench Press",
            targetSets: 4,
            targetReps: 8,
          },
          {
            exerciseId: "incline_db_press",
            exerciseName: "Incline Dumbbell Press",
            targetSets: 3,
            targetReps: 10,
          },
          {
            exerciseId: "tricep_pushdown",
            exerciseName: "Cable Tricep Pushdown",
            targetSets: 3,
            targetReps: 12,
          },
        ],
      },
      {
        id: "plan_tue",
        title: "Back & Biceps Focus",
        dayOfWeek: 2,
        targetMuscles: ["Back", "Biceps"],
        exercises: [
          {
            exerciseId: "lat_pulldown",
            exerciseName: "Lat Pulldown",
            targetSets: 4,
            targetReps: 10,
          },
          {
            exerciseId: "bent_over_row",
            exerciseName: "Barbell Bent Over Row",
            targetSets: 3,
            targetReps: 8,
          },
          {
            exerciseId: "bicep_curl",
            exerciseName: "Dumbbell Bicep Curl",
            targetSets: 3,
            targetReps: 12,
          },
        ],
      },
      {
        id: "plan_wed",
        title: "Active Recovery & Mobility",
        dayOfWeek: 3,
        targetMuscles: ["Core", "Mobility"],
        exercises: [
          {
            exerciseId: "plank",
            exerciseName: "Plank Hold",
            targetSets: 3,
            targetReps: 60,
          },
        ],
      },
      {
        id: "plan_thu",
        title: "Legs & Shoulders Focus",
        dayOfWeek: 4,
        targetMuscles: ["Quads", "Hamstrings", "Shoulders"],
        exercises: [
          {
            exerciseId: "barbell_squat",
            exerciseName: "Barbell Squat",
            targetSets: 4,
            targetReps: 8,
          },
          {
            exerciseId: "overhead_press",
            exerciseName: "Overhead Press",
            targetSets: 3,
            targetReps: 8,
          },
          {
            exerciseId: "leg_curl",
            exerciseName: "Lying Leg Curl",
            targetSets: 3,
            targetReps: 12,
          },
        ],
      },
      {
        id: "plan_fri",
        title: "Full Body Power",
        dayOfWeek: 5,
        targetMuscles: ["Full Body"],
        exercises: [
          {
            exerciseId: "deadlift",
            exerciseName: "Barbell Deadlift",
            targetSets: 3,
            targetReps: 5,
          },
          {
            exerciseId: "pushups",
            exerciseName: "Weighted Pushups",
            targetSets: 3,
            targetReps: 15,
          },
        ],
      },
      {
        id: "plan_sat",
        title: "Cardio & Conditioning",
        dayOfWeek: 6,
        targetMuscles: ["Cardio", "Endurance"],
        exercises: [],
      },
      {
        id: "plan_sun",
        title: "Rest & Regeneration",
        dayOfWeek: 7,
        targetMuscles: ["Rest"],
        exercises: [],
      },
    ]);
  }
}