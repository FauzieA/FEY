import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
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
    // First try local Dexie
    const localLog = await db.prayerLogs.get(date);
    if (localLog) {
      // Trigger background sync
      syncService.syncPrayerLogs();
      return localLog;
    }
    
    // If no local data, try to fetch from backend
    try {
      await syncService.syncPrayerLogs();
      return (await db.prayerLogs.get(date)) ?? { date, prayers: emptyPrayers() };
    } catch (error) {
      console.error('Failed to fetch prayer log:', error);
      return { date, prayers: emptyPrayers() };
    }
  },

  async togglePrayer(date: string, prayer: PrayerName): Promise<void> {
    const log = await FaithRepository.getPrayerLog(date);
    const nowChecked = !log.prayers[prayer];
    
    // Update local Dexie immediately
    await db.prayerLogs.put({ ...log, prayers: { ...log.prayers, [prayer]: nowChecked } });
    
    // Queue sync to backend
    syncService.queueSync('prayer', { date, [prayer]: nowChecked ? 'on_time' : 'missed' });
    
    if (nowChecked) await logActivity("prayer_logged", { date });
  },

  async logQuranReading(entry: Omit<QuranReadingLog, "id">): Promise<void> {
    // Save to local Dexie immediately
    await db.quranReading.add(entry);
    
    // Queue sync to backend
    syncService.queueSync('quran_reading', entry);
    
    await logActivity("quran_reading", { date: entry.date });
  },

  async addMemorization(entry: Omit<MemorizationEntry, "id">): Promise<void> {
    // Save to local Dexie immediately
    await db.memorization.add(entry);
    
    // Queue sync to backend
    syncService.queueSync('memorization', entry);
    
    if (entry.status === "memorized") await logActivity("quran_memorization", { date: entry.startedAt });
  },

  async setMemorizationStatus(id: number, status: MemorizationStatus): Promise<void> {
    const entry = await db.memorization.get(id);
    if (!entry) return;
    
    // Update local Dexie immediately
    await db.memorization.update(id, { status, lastReviewedAt: today() });
    
    // Queue sync to backend
    syncService.queueSync('memorization', { id, status, lastReviewedAt: today() });
    
    if (status === "memorized" && entry.status !== "memorized") {
      await logActivity("quran_memorization");
    }
  },

  async logRevision(entry: Omit<RevisionLog, "id">): Promise<void> {
    // Save to local Dexie immediately
    await db.revisions.add(entry);
    
    // Queue sync to backend
    syncService.queueSync('revision', entry);
    
    await db.memorization
      .where("surah")
      .equals(entry.surah)
      .modify({ lastReviewedAt: entry.date });
    
    await logActivity("quran_revision", { date: entry.date });
  },

  async getAdhkarLog(date = today()): Promise<AdhkarLog> {
    // First try local Dexie
    const localLog = await db.adhkarLogs.get(date);
    if (localLog) {
      return localLog;
    }
    
    return {
      date,
      morning: false,
      evening: false,
      afterPrayer: false,
      istighfarCount: 0,
    };
  },

  async toggleAdhkar(date: string, field: "morning" | "evening" | "afterPrayer"): Promise<void> {
    const log = await FaithRepository.getAdhkarLog(date);
    const nowChecked = !log[field];
    
    // Update local Dexie immediately
    await db.adhkarLogs.put({ ...log, [field]: nowChecked });
    
    // Queue sync to backend
    syncService.queueSync('adhkar', { date, [field]: nowChecked });
    
    if (nowChecked) await logActivity("adhkar_logged", { date });
  },

  async addIstighfar(date: string, count: number): Promise<void> {
    const log = await FaithRepository.getAdhkarLog(date);
    
    // Update local Dexie immediately
    await db.adhkarLogs.put({ ...log, istighfarCount: log.istighfarCount + count });
    
    // Queue sync to backend
    syncService.queueSync('adhkar', { date, istighfarCount: log.istighfarCount + count });
  },

  async addMissedFast(entry: Omit<MissedFast, "id">): Promise<void> {
    // Save to local Dexie immediately
    await db.missedFasts.add(entry);
    
    // Queue sync to backend
    syncService.queueSync('missed_fast', entry);
  },

  async markFastMadeUp(id: number, date = today()): Promise<void> {
    // Update local Dexie immediately
    await db.missedFasts.update(id, { madeUpOn: date });
    
    // Queue sync to backend
    syncService.queueSync('missed_fast', { id, madeUpOn: date });
    
    await logActivity("fast_made_up", { date });
  },
};
