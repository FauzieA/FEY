import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";
import type { CycleLog, HealthNote, Measurement, SleepLog, WeightLog } from "@/types/modules";

export const HealthRepository = {
  async logWeight(entry: Omit<WeightLog, "id">): Promise<void> {
    const record: WeightLog = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.weights.add(record);
    await logActivity("weight_logged", { date: entry.date });
    syncService.queueSync('weight', record, 'create');
  },

  async addMeasurement(entry: Omit<Measurement, "id">): Promise<void> {
    const record: Measurement = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.measurements.add(record);
    await logActivity("measurement_logged", { date: entry.date });
    syncService.queueSync('measurement', record, 'create');
  },

  async logSleep(entry: Omit<SleepLog, "id">): Promise<void> {
    const record: SleepLog = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.sleepLogs.add(record);
    await logActivity("sleep_logged", { date: entry.date });
    syncService.queueSync('sleep', record, 'create');
  },

  async startCycle(entry: Omit<CycleLog, "id">): Promise<void> {
    const record: CycleLog = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.cycleLogs.add(record);
    await logActivity("cycle_logged", { date: entry.startDate });
    syncService.queueSync('cycle', record, 'create');
  },

  async endCycle(id: string, endDate = today()): Promise<void> {
    await db.cycleLogs.update(id, { endDate, updatedAt: today(), syncStatus: 'pending' });
    syncService.queueSync('cycle', { id, endDate });
  },

  async addHealthNote(entry: Omit<HealthNote, "id">): Promise<void> {
    const record: HealthNote = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.healthNotes.add(record);
    await logActivity("health_note", { date: entry.date });
    syncService.queueSync('health_note', record, 'create');
  },

  async remove(table: "weights" | "sleepLogs" | "measurements" | "healthNotes", id: string): Promise<void> {
    await db[table].delete(id);
    syncService.queueSync('delete', { table, id });
  },

  async removeCycle(id: string): Promise<void> {
    await db.cycleLogs.delete(id);
    syncService.queueSync('delete_cycle', id);
  },

  async updateCycle(id: string, startDate: string, endDate?: string): Promise<void> {
    if (endDate) {
      await db.cycleLogs.update(id, { startDate, endDate, updatedAt: today(), syncStatus: 'pending' });
      syncService.queueSync('cycle', { id, startDate, endDate });
    } else {
      await db.cycleLogs.update(id, { startDate, updatedAt: today(), syncStatus: 'pending' });
      syncService.queueSync('cycle', { id, startDate });
    }
  },
};
