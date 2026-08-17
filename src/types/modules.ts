/**
 * Domain types for the non-training FEY modules.
 * Training/workout types live in `@/types/index.ts` and `@/db/dexie.ts`.
 */

export type ModuleId =
  | "dashboard"
  | "training"
  | "faith"
  | "health"
  | "library"
  | "perfumery"
  | "wealth"
  | "life"
  | "character"
  | "progress";

/** Modules that can generate character experience. */
export type XpModule = Exclude<ModuleId, "dashboard" | "character" | "progress">;

export type AttributeId =
  | "discipline"
  | "devotion"
  | "strength"
  | "vitality"
  | "knowledge"
  | "craft"
  | "stewardship"
  | "connection";

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface SyncMetadata {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  remoteId?: string | number;
}

/* ------------------------------- Character -------------------------------- */

export interface XpEvent extends SyncMetadata {
  module: XpModule;
  activity: string;
  amount: number;
  attribute: AttributeId;
  /** ISO date (YYYY-MM-DD) the activity happened on. */
  date: string;
  /** Optional local session id this XP is attributed to */
  sessionId?: string;
}

export interface AchievementRecord extends SyncMetadata {
  unlockedAt: string;
}

/* --------------------------------- Faith ---------------------------------- */

export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export interface PrayerLog extends SyncMetadata {
  /** ISO date, one record per day. */
  date: string;
  prayers: Record<PrayerName, boolean>;
  notes?: string;
}

export interface QuranReadingLog extends SyncMetadata {
  date: string;
  surah: string;
  fromAyah: number;
  toAyah: number;
  pages?: number;
  minutes?: number;
  reflection?: string;
}

export type MemorizationStatus = "learning" | "memorized" | "needs-work";

export interface MemorizationEntry extends SyncMetadata {
  surah: string;
  fromAyah: number;
  toAyah: number;
  status: MemorizationStatus;
  startedAt: string;
  lastReviewedAt?: string;
}

export interface RevisionLog extends SyncMetadata {
  date: string;
  surah: string;
  /** Self-assessed recall quality, 1 (shaky) to 5 (solid). */
  quality: number;
  notes?: string;
}

export interface AdhkarLog extends SyncMetadata {
  /** ISO date, one record per day. */
  date: string;
  morning: boolean;
  evening: boolean;
  afterPrayer: boolean;
  istighfarCount: number;
  /** Array of completed item keys in format "category_id" */
  completedItems?: string[];
}

export interface MissedFast extends SyncMetadata {
  /** Date the fast was missed. */
  missedOn: string;
  reason?: string;
  madeUpOn?: string | null;
}

/* --------------------------------- Health --------------------------------- */

export interface Measurement extends SyncMetadata {
  date: string;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  thighCm?: number;
  armCm?: number;
  notes?: string;
}

export interface WeightLog extends SyncMetadata {
  date: string;
  weightKg: number;
  notes?: string;
}

export interface SleepLog extends SyncMetadata {
  /** Date the night started. */
  date: string;
  /** Start time in HH:MM format */
  startTime: string;
  /** End time in HH:MM format */
  endTime: string;
  /** Calculated hours (derived from start/end times) */
  hours: number;
  /** Self-assessed quality, 1 to 5. */
  quality: number;
  notes?: string;
}

export interface CycleLog extends SyncMetadata {
  startDate: string;
  endDate?: string | null;
  symptoms?: string;
  /** Self-assessed flow, 1 (light) to 5 (heavy). */
  flow?: number;
  /** Average cycle length learned from previous cycles */
  learnedAverageCycle?: number;
}

export interface CycleSymptomLog extends SyncMetadata {
  date: string;
  cycleId?: string;
  /** Current phase at the time of logging */
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  /** Energy level 1-5 */
  energy?: number;
  /** Mood level 1-5 (1=low, 5=high) */
  mood?: number;
  /** Physical symptoms (cramps, headaches, etc.) */
  physicalSymptoms?: string[];
  /** Flow intensity 1-5 */
  flowIntensity?: number;
  /** Custom notes */
  notes?: string;
}

export interface HealthNote extends SyncMetadata {
  date: string;
  category: "symptom" | "appointment" | "medication" | "general";
  title: string;
  details?: string;
}

/* -------------------------------- Library --------------------------------- */

export type BookStatus = "reading" | "finished" | "waiting";

export interface Book extends SyncMetadata {
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  startedAt?: string;
  finishedAt?: string | null;
  rating?: number;
  notes?: string;
  /** Waiting Room: sequel not yet released. */
  seriesName?: string;
  sequelTo?: string;
  expectedReleaseDate?: string;
  /** Favorite quotes and footnotes while reading */
  quotes?: string[];
  footnotes?: string[];
}

export interface ReadingSession extends SyncMetadata {
  bookId: string;
  bookRemoteId?: string | number;
  date: string;
  pagesRead: number;
  minutes?: number;
}

/* ------------------------------- Perfumery -------------------------------- */

export interface PerfumeIngredient {
  name: string;
  /** Note family of the ingredient. */
  note: "top" | "heart" | "base";
  /** Amount in drops or grams, unit is recorded on the version. */
  amount: number;
  /** Dilution percentage (e.g., 20 means 20% scent, 80% alcohol/carrier) */
  dilution?: number;
}

export interface PerfumeFormula extends SyncMetadata {
  name: string;
  inspiration?: string;
  archived?: boolean;
}

export interface PerfumeVersion extends SyncMetadata {
  formulaId: string;
  formulaRemoteId?: string | number;
  version: string;
  date: string;
  unit: "drops" | "g" | "ml";
  ingredients: PerfumeIngredient[];
  /** Total alcohol amount in the formula */
  alcoholAmount?: number;
  /** Development history / what changed and how it smelled. */
  observations?: string;
  rating?: number;
}

/* --------------------------------- Wealth --------------------------------- */

export interface SavingsEntry extends SyncMetadata {
  date: string;
  amount: number;
  /** Optional goal this deposit belongs to. */
  goalId?: string | null;
  goalRemoteId?: string | number | null;
  note?: string;
  /** Currency code (e.g., USD, EUR, NGN, MYR) */
  currency?: string;
  /** Location where savings are stored (account, e-wallet, cash) */
  location?: string;
}

export interface SavingsGoal extends SyncMetadata {
  name: string;
  targetAmount: number;
  targetDate?: string;
  completedAt?: string | null;
}

export interface PurchasePlan extends SyncMetadata {
  name: string;
  price: number;
  priority: "low" | "medium" | "high";
  purchasedAt?: string | null;
  notes?: string;
}

export interface Debt extends SyncMetadata {
  name: string;
  amount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate?: string | null;
  paidFromSavings: boolean;
  notes?: string;
}

export interface WealthProfile extends SyncMetadata {
  currency: string;
  hourlyRate: number;
  monthlySavingsTarget: number;
}

/* ---------------------------------- Life ---------------------------------- */

export interface JournalEntry extends SyncMetadata {
  date: string;
  title: string;
  body: string;
  mood?: number;
  gratitude?: string;
}

export interface Person extends SyncMetadata {
  name: string;
  relationship: string;
  /** How often (in days) I want to reach out. */
  cadenceDays: number;
  lastContactedAt?: string | null;
  notes?: string;
}

export interface CallReminder extends SyncMetadata {
  personId: string;
  personRemoteId?: string | number;
  dueDate: string;
  completedAt?: string | null;
  note?: string;
}

export interface TimelineEvent extends SyncMetadata {
  date: string;
  title: string;
  category: "milestone" | "memory" | "decision" | "travel" | "other";
  description?: string;
}
