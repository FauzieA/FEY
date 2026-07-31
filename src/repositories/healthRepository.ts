import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import type { CycleLog, HealthNote, Measurement, SleepLog, WeightLog } from "@/types/modules";

export const HealthRepository = {
  async logWeight(entry: Omit<WeightLog, "id">): Promise<void> {
    await db.weights.add(entry);
    await logActivity("weight_logged", { date: entry.date });
    syncService.queueSync('weight', entry);
  },

  async addMeasurement(entry: Omit<Measurement, "id">): Promise<void> {
    await db.measurements.add(entry);
    await logActivity("measurement_logged", { date: entry.date });
    syncService.queueSync('measurement', entry);
  },

  async logSleep(entry: Omit<SleepLog, "id">): Promise<void> {
    await db.sleepLogs.add(entry);
    await logActivity("sleep_logged", { date: entry.date });
    syncService.queueSync('sleep', entry);
  },

  async startCycle(entry: Omit<CycleLog, "id">): Promise<void> {
    await db.cycleLogs.add(entry);
    await logActivity("cycle_logged", { date: entry.startDate });
    syncService.queueSync('cycle', entry);
  },

  async endCycle(id: number, endDate = today()): Promise<void> {
    await db.cycleLogs.update(id, { endDate });
    syncService.queueSync('cycle', { id, endDate });
  },

  async addHealthNote(entry: Omit<HealthNote, "id">): Promise<void> {
    await db.healthNotes.add(entry);
    await logActivity("health_note", { date: entry.date });
    syncService.queueSync('health_note', entry);
  },

  async remove(table: "weights" | "sleepLogs" | "measurements" | "healthNotes", id: number): Promise<void> {
    await db[table].delete(id);
    syncService.queueSync('delete', { table, id });
  },

  async removeCycle(id: number): Promise<void> {
    await db.cycleLogs.delete(id);
    syncService.queueSync('delete_cycle', id);
  },

  async updateCycle(id: number, startDate: string, endDate?: string): Promise<void> {
    if (endDate) {
      await db.cycleLogs.update(id, { startDate, endDate });
      syncService.queueSync('cycle', { id, startDate, endDate });
    } else {
      await db.cycleLogs.update(id, { startDate });
      syncService.queueSync('cycle', { id, startDate });
    }
  },
};
