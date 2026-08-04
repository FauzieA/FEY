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

/* ------------------------------- Character -------------------------------- */

export interface XpEvent {
  id?: number;
  module: XpModule;
  activity: string;
  amount: number;
  attribute: AttributeId;
  /** ISO date (YYYY-MM-DD) the activity happened on. */
  date: string;
  createdAt: string;
  /** Optional local session id this XP is attributed to */
  sessionId?: string;
}

export interface AchievementRecord {
  id: string;
  unlockedAt: string;
}

/* --------------------------------- Faith ---------------------------------- */

export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export interface PrayerLog {
  /** ISO date, one record per day. */
  date: string;
  prayers: Record<PrayerName, boolean>;
  notes?: string;
}

export interface QuranReadingLog {
  id?: number;
  date: string;
  surah: string;
  fromAyah: number;
  toAyah: number;
  pages?: number;
  minutes?: number;
  reflection?: string;
}

export type MemorizationStatus = "learning" | "memorized" | "needs-work";

export interface MemorizationEntry {
  id?: number;
  surah: string;
  fromAyah: number;
  toAyah: number;
  status: MemorizationStatus;
  startedAt: string;
  lastReviewedAt?: string;
}

export interface RevisionLog {
  id?: number;
  date: string;
  surah: string;
  /** Self-assessed recall quality, 1 (shaky) to 5 (solid). */
  quality: number;
  notes?: string;
}

export interface AdhkarLog {
  /** ISO date, one record per day. */
  date: string;
  morning: boolean;
  evening: boolean;
  afterPrayer: boolean;
  istighfarCount: number;
  /** Array of completed item keys in format "category_id" */
  completedItems?: string[];
}

export interface MissedFast {
  id?: number;
  /** Date the fast was missed. */
  missedOn: string;
  reason?: string;
  madeUpOn?: string | null;
}

/* --------------------------------- Health --------------------------------- */

export interface Measurement {
  id?: number;
  date: string;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  thighCm?: number;
  armCm?: number;
  notes?: string;
}

export interface WeightLog {
  id?: number;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface SleepLog {
  id?: number;
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

export interface CycleLog {
  id?: number;
  startDate: string;
  endDate?: string | null;
  symptoms?: string;
  /** Self-assessed flow, 1 (light) to 5 (heavy). */
  flow?: number;
  /** Average cycle length learned from previous cycles */
  learnedAverageCycle?: number;
}

export interface CycleSymptomLog {
  id?: number;
  date: string;
  cycleId?: number;
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

export interface HealthNote {
  id?: number;
  date: string;
  category: "symptom" | "appointment" | "medication" | "general";
  title: string;
  details?: string;
}

/* -------------------------------- Library --------------------------------- */

export type BookStatus = "reading" | "finished" | "waiting";

export interface Book {
  id?: number;
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

export interface ReadingSession {
  id?: number;
  bookId: number;
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

export interface PerfumeFormula {
  id?: number;
  name: string;
  inspiration?: string;
  createdAt: string;
  archived?: boolean;
}

export interface PerfumeVersion {
  id?: number;
  formulaId: number;
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

export interface SavingsEntry {
  id?: number;
  date: string;
  amount: number;
  /** Optional goal this deposit belongs to. */
  goalId?: number | null;
  note?: string;
  /** Currency code (e.g., USD, EUR, NGN, MYR) */
  currency?: string;
  /** Location where savings are stored (account, e-wallet, cash) */
  location?: string;
}

export interface SavingsGoal {
  id?: number;
  name: string;
  targetAmount: number;
  targetDate?: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface PurchasePlan {
  id?: number;
  name: string;
  price: number;
  priority: "low" | "medium" | "high";
  createdAt: string;
  purchasedAt?: string | null;
  notes?: string;
}

export interface WealthProfile {
  id: string;
  currency: string;
  hourlyRate: number;
  monthlySavingsTarget: number;
}

/* ---------------------------------- Life ---------------------------------- */

export interface JournalEntry {
  id?: number;
  date: string;
  title: string;
  body: string;
  mood?: number;
  gratitude?: string;
}

export interface Person {
  id?: number;
  name: string;
  relationship: string;
  /** How often (in days) I want to reach out. */
  cadenceDays: number;
  lastContactedAt?: string | null;
  notes?: string;
}

export interface CallReminder {
  id?: number;
  personId: number;
  dueDate: string;
  completedAt?: string | null;
  note?: string;
}

export interface TimelineEvent {
  id?: number;
  date: string;
  title: string
  category: "milestone" | "memory" | "decision" | "travel" | "other";
  description?: string;
}
