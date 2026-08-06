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
    // 1. Initial Character Profile - start from 0
    await db.character.put({
      id: "user",
      level: 1,
      currentXp: 0,
      nextLevelXp: 250,
      currentStreak: 0,
      lastWorkoutDate: null,
      attributes: {
        STR: 0,
        END: 0,
        VOL: 0,
        CON: 0,
      },
    });

    // 2. Default App Settings
    await db.settings.put({
      id: "app_settings",
      defaultRestSeconds: 90,
      soundEnabled: true,
      vibrationEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
    });
  }
}
