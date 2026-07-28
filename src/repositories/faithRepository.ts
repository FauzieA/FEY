import { db } from "@/db/dexie";
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
    return (await db.prayerLogs.get(date)) ?? { date, prayers: emptyPrayers() };
  },

  async togglePrayer(date: string, prayer: PrayerName): Promise<void> {
    const log = await FaithRepository.getPrayerLog(date);
    const nowChecked = !log.prayers[prayer];
    await db.prayerLogs.put({ ...log, prayers: { ...log.prayers, [prayer]: nowChecked } });
    if (nowChecked) await logActivity("prayer_logged", { date });
  },

  async logQuranReading(entry: Omit<QuranReadingLog, "id">): Promise<void> {
    await db.quranReading.add(entry);
    await logActivity("quran_reading", { date: entry.date });
  },

  async addMemorization(entry: Omit<MemorizationEntry, "id">): Promise<void> {
    await db.memorization.add(entry);
    if (entry.status === "memorized") await logActivity("quran_memorization", { date: entry.startedAt });
  },

  async setMemorizationStatus(id: number, status: MemorizationStatus): Promise<void> {
    const entry = await db.memorization.get(id);
    if (!entry) return;
    await db.memorization.update(id, { status, lastReviewedAt: today() });
    if (status === "memorized" && entry.status !== "memorized") {
      await logActivity("quran_memorization");
    }
  },

  async logRevision(entry: Omit<RevisionLog, "id">): Promise<void> {
    await db.revisions.add(entry);
    await db.memorization
      .where("surah")
      .equals(entry.surah)
      .modify({ lastReviewedAt: entry.date });
    await logActivity("quran_revision", { date: entry.date });
  },

  async getAdhkarLog(date = today()): Promise<AdhkarLog> {
    return (
      (await db.adhkarLogs.get(date)) ?? {
        date,
        morning: false,
        evening: false,
        afterPrayer: false,
        istighfarCount: 0,
      }
    );
  },

  async toggleAdhkar(date: string, field: "morning" | "evening" | "afterPrayer"): Promise<void> {
    const log = await FaithRepository.getAdhkarLog(date);
    const nowChecked = !log[field];
    await db.adhkarLogs.put({ ...log, [field]: nowChecked });
    if (nowChecked) await logActivity("adhkar_logged", { date });
  },

  async addIstighfar(date: string, count: number): Promise<void> {
    const log = await FaithRepository.getAdhkarLog(date);
    await db.adhkarLogs.put({ ...log, istighfarCount: log.istighfarCount + count });
  },

  async addMissedFast(entry: Omit<MissedFast, "id">): Promise<void> {
    await db.missedFasts.add(entry);
  },

  async markFastMadeUp(id: number, date = today()): Promise<void> {
    await db.missedFasts.update(id, { madeUpOn: date });
    await logActivity("fast_made_up", { date });
  },
};
