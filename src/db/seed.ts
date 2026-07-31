import { db } from "./dexie";

/** Guards against the concurrent calls made by app bootstrap and StrictMode. */
let initialization: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  initialization ??= runInitialization();
  return initialization;
}

async function runInitialization() {
  const existingChar = await db.character.get("user");

  // Only run if the database has not been initialized yet
  if (!existingChar) {
    // 1. Initial Character Profile
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

    // 2. Default App Settings
    await db.settings.put({
      id: "app_settings",
      defaultRestSeconds: 90,
      soundEnabled: true,
      vibrationEnabled: true,
    });

    // 3. Default Workout Plans (Preset templates using valid exercise IDs)
    await db.plans.bulkPut([
      {
        id: "plan_mon",
        title: "Chest & Triceps Focus",
        dayOfWeek: 1,
        targetMuscles: ["Chest", "Triceps"],
        exercises: [
          { exerciseId: "ex_dumbbell_bench", exerciseName: "Dumbbell Bench Press", targetSets: 4, targetReps: 8 },
          { exerciseId: "ex_shoulder_press", exerciseName: "Shoulder Press", targetSets: 3, targetReps: 10 },
        ],
      },
      {
        id: "plan_tue",
        title: "Back & Biceps Focus",
        dayOfWeek: 2,
        targetMuscles: ["Back", "Biceps"],
        exercises: [
          { exerciseId: "ex_lat_pulldown", exerciseName: "Lat Pulldown", targetSets: 4, targetReps: 10 },
          { exerciseId: "ex_seated_row", exerciseName: "Seated Row", targetSets: 3, targetReps: 8 },
        ],
      },
      {
        id: "plan_thu",
        title: "Legs & Lower Focus",
        dayOfWeek: 4,
        targetMuscles: ["Quads", "Hamstrings"],
        exercises: [
          { exerciseId: "ex_back_squat", exerciseName: "Back Squat", targetSets: 4, targetReps: 8 },
          { exerciseId: "ex_romanian_deadlift", exerciseName: "Romanian Deadlift", targetSets: 3, targetReps: 8 },
        ],
      },
    ]);
  }
}
