import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";
import type { PurchasePlan, SavingsEntry, SavingsGoal, WealthProfile } from "@/types/modules";

export const DEFAULT_WEALTH_PROFILE: WealthProfile = {
  id: "wealth",
  currency: "GBP",
  hourlyRate: 12,
  monthlySavingsTarget: 300,
  createdAt: today(),
  updatedAt: today(),
  syncStatus: 'pending',
};

export const WealthRepository = {
  async getProfile(): Promise<WealthProfile> {
    return (await db.wealthProfile.get("wealth")) ?? DEFAULT_WEALTH_PROFILE;
  },

  async saveProfile(patch: Partial<WealthProfile>): Promise<void> {
    const current = await WealthRepository.getProfile();
    await db.wealthProfile.put({ ...current, ...patch, id: "wealth", updatedAt: today(), syncStatus: 'pending' });
    syncService.queueSync('wealth_profile', { ...DEFAULT_WEALTH_PROFILE, ...patch });
  },

  async addSavings(entry: Omit<SavingsEntry, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<void> {
    const record: SavingsEntry = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.savingsEntries.add(record);
    await logActivity("savings_deposit", { date: entry.date });
    syncService.queueSync('savings', record, 'create');
    if (entry.goalId) await WealthRepository.settleGoal(entry.goalId);
  },

  async addGoal(goal: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<void> {
    const record: SavingsGoal = {
      id: generateUUID(),
      ...goal,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.savingsGoals.add(record);
    await logActivity("goal_created");
    syncService.queueSync('savings_goal', record, 'create');
  },

  /** Marks a goal complete once its deposits cover the target. */
  async settleGoal(goalId: string): Promise<void> {
    const goal = await db.savingsGoals.get(goalId);
    if (!goal || goal.completedAt) return;
    const deposits = await db.savingsEntries.where("goalId").equals(goalId).toArray();
    const saved = deposits.reduce((sum, entry) => sum + entry.amount, 0);
    if (saved >= goal.targetAmount) {
      await db.savingsGoals.update(goalId, { completedAt: today(), updatedAt: today(), syncStatus: 'pending' });
      await logActivity("goal_completed", { difficulty: "medium" as const });
      syncService.queueSync('savings_goal', { id: goalId, completedAt: today() });
    }
  },

  async addPurchasePlan(plan: Omit<PurchasePlan, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<void> {
    const record: PurchasePlan = {
      id: generateUUID(),
      ...plan,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.purchasePlans.add(record);
    await logActivity("purchase_planned");
    syncService.queueSync('purchase_plan', record, 'create');
  },

  async markPurchased(id: string): Promise<void> {
    await db.purchasePlans.update(id, { purchasedAt: today(), updatedAt: today(), syncStatus: 'pending' });
    syncService.queueSync('purchase_plan', { id, purchasedAt: today() });
  },

  async removePurchasePlan(id: string): Promise<void> {
    await db.purchasePlans.delete(id);
    syncService.queueSync('delete_purchase_plan', id);
  },
};

/** Hours of work required to afford a price at a given hourly rate. */
export function hoursOfWork(price: number, hourlyRate: number): number {
  if (hourlyRate <= 0) return 0;
  return price / hourlyRate;
}
