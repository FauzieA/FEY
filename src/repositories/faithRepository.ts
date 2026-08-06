import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";
import type {
  AdhkarLog,
  MemorizationEntry,
  MemorizationStatus,
  MissedFast,
  PrayerLog,
  PrayerName,
  QuranReadingLog,
  RevisionLog,
} from "@/types/modules";
import { PRAYER_NAMES } from "@/types/modules";

const emptyPrayers = (): Record<PrayerName, boolean> =>
  PRAYER_NAMES.reduce(
    (acc, name) => ({ ...acc, [name]: false }),
    {} as Record<PrayerName, boolean>,
  );

export const FaithRepository = {
  async getPrayerLog(date = today()): Promise<PrayerLog> {
    const defaultLog: PrayerLog = {
      id: generateUUID(),
      date,
      prayers: emptyPrayers(),
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    // First try local Dexie by date index
    const localLog = await db.prayerLogs.where('date').equals(date).first();
    if (localLog) {
      // Trigger background sync
      syncService.syncPrayerLogs();
      return localLog;
    }

    // If no local data, try to fetch from backend
    try {
      await syncService.syncPrayerLogs();
      return (await db.prayerLogs.where('date').equals(date).first()) ?? defaultLog;
    } catch (error) {
      console.error('Failed to fetch prayer log:', error);
      return defaultLog;
    }
  },

  async togglePrayer(date: string, prayer: PrayerName): Promise<void> {
    const log = await FaithRepository.getPrayerLog(date);
    const nowChecked = !log.prayers[prayer];
    const nextPrayers = { ...log.prayers, [prayer]: nowChecked };
    
    // Update local Dexie immediately
    await db.prayerLogs.put({
      ...log,
      prayers: nextPrayers,
      updatedAt: today(),
      syncStatus: 'pending',
    });
    
    // Queue sync to backend with the full prayer payload expected by the API
    const prayerPayload = PRAYER_NAMES.reduce((acc, prayerName) => {
      acc[prayerName] = nextPrayers[prayerName] ? 'on_time' : 'missed';
      return acc;
    }, {} as Record<PrayerName, 'on_time' | 'missed'>);
    syncService.queueSync('prayer', { id: log.id, date, ...prayerPayload }, 'update');
    
    if (nowChecked) await logActivity("prayer_logged", { date });
  },

  async logQuranReading(entry: Omit<QuranReadingLog, "id">): Promise<void> {
    const record: QuranReadingLog = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    // Save to local Dexie immediately
    await db.quranReading.add(record);
    
    // Queue sync to backend
    syncService.queueSync('quran_reading', record, 'create');
    
    await logActivity("quran_reading", { date: entry.date });
  },

  async addMemorization(entry: Omit<MemorizationEntry, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<void> {
    const record: MemorizationEntry = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    // Save to local Dexie immediately
    await db.memorization.add(record);
    
    // Queue sync to backend
    syncService.queueSync('memorization', record, 'create');
    
    if (entry.status === "memorized") await logActivity("quran_memorization", { date: entry.startedAt });
  },

  async setMemorizationStatus(id: string, status: MemorizationStatus): Promise<void> {
    const entry = await db.memorization.get(id);
    if (!entry) return;
    
    // Update local Dexie immediately
    await db.memorization.update(id, { status, lastReviewedAt: today(), updatedAt: today(), syncStatus: 'pending' });
    
    // Queue sync to backend
    syncService.queueSync('memorization', { id, status, lastReviewedAt: today() });
    
    if (status === "memorized" && entry.status !== "memorized") {
      await logActivity("quran_memorization", { difficulty: "milestone" as const });
    }
  },

  async logRevision(entry: Omit<RevisionLog, "id">): Promise<void> {
    const record: RevisionLog = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    // Save to local Dexie immediately
    await db.revisions.add(record);
    
    // Queue sync to backend
    syncService.queueSync('revision', record, 'create');
    
    await db.memorization
      .where("surah")
      .equals(entry.surah)
      .modify({ lastReviewedAt: entry.date });
    
    await logActivity("quran_revision", { date: entry.date });
  },

  async getAdhkarLog(date = today()): Promise<AdhkarLog> {
    const localLog = await db.adhkarLogs.where('date').equals(date).first();
    if (localLog) {
      return localLog;
    }

    return {
      id: generateUUID(),
      date,
      morning: false,
      evening: false,
      afterPrayer: false,
      istighfarCount: 0,
      completedItems: [],
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };
  },

  async toggleAdhkarItem(date: string, categoryId: string, itemId: string): Promise<void> {
    const log = await FaithRepository.getAdhkarLog(date);
    const itemKey = `${categoryId}_${itemId}`;
    const completedItems = log.completedItems || [];
    const nowCompleted = !completedItems.includes(itemKey);
    
    let newCompletedItems: string[];
    if (nowCompleted) {
      newCompletedItems = [...completedItems, itemKey];
    } else {
      newCompletedItems = completedItems.filter((key) => key !== itemKey);
    }
    
    // Update local Dexie immediately
    await db.adhkarLogs.put({ ...log, completedItems: newCompletedItems, updatedAt: today(), syncStatus: 'pending' });
    
    // Queue sync to backend
    syncService.queueSync('adhkar', { id: log.id, date, completedItems: newCompletedItems }, 'update');
    
    if (nowCompleted) await logActivity("adhkar_logged", { date });
  },

  async addIstighfar(date: string, count: number): Promise<void> {
    const log = await FaithRepository.getAdhkarLog(date);
    
    // Update local Dexie immediately
    await db.adhkarLogs.put({ ...log, istighfarCount: log.istighfarCount + count, updatedAt: today(), syncStatus: 'pending' });
    
    // Queue sync to backend
    syncService.queueSync('adhkar', { id: log.id, date, istighfarCount: log.istighfarCount + count }, 'update');
  },

  async addMissedFast(entry: Omit<MissedFast, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<void> {
    const record: MissedFast = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    // Save to local Dexie immediately
    await db.missedFasts.add(record);
    
    // Queue sync to backend
    syncService.queueSync('missed_fast', record, 'create');
  },

  async markFastMadeUp(id: string, date = today()): Promise<void> {
    // Update local Dexie immediately
    await db.missedFasts.update(id, { madeUpOn: date, updatedAt: today(), syncStatus: 'pending' });
    
    // Queue sync to backend
    syncService.queueSync('missed_fast', { id, madeUpOn: date });
    
    await logActivity("fast_made_up", { date });
  },

  async deleteMissedFast(id: string): Promise<void> {
    // Delete from local Dexie immediately
    await db.missedFasts.delete(id);
    
    // Queue sync to backend
    syncService.queueSync('delete_missed_fast', id);
  },

  async deleteMemorization(id: string): Promise<void> {
    // Delete from local Dexie immediately
    await db.memorization.delete(id);
    
    // Queue sync to backend
    syncService.queueSync('delete_memorization', id);
  },

  async deleteAdhkarLog(date: string): Promise<void> {
    // Delete from local Dexie immediately using date index
    const existing = await db.adhkarLogs.where('date').equals(date).first();
    if (existing) {
      await db.adhkarLogs.delete(existing.id);
      syncService.queueSync('delete_adhkar_log', date);
    }
  },
};
