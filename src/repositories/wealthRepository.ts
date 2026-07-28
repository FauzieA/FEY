import { db } from "@/db/dexie";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import type { PurchasePlan, SavingsEntry, SavingsGoal, WealthProfile } from "@/types/modules";

export const DEFAULT_WEALTH_PROFILE: WealthProfile = {
  id: "wealth",
  currency: "GBP",
  hourlyRate: 12,
  monthlySavingsTarget: 300,
};

export const WealthRepository = {
  async getProfile(): Promise<WealthProfile> {
    return (await db.wealthProfile.get("wealth")) ?? DEFAULT_WEALTH_PROFILE;
  },

  async saveProfile(patch: Partial<WealthProfile>): Promise<void> {
    const current = await WealthRepository.getProfile();
    await db.wealthProfile.put({ ...current, ...patch, id: "wealth" });
  },

  async addSavings(entry: Omit<SavingsEntry, "id">): Promise<void> {
    await db.savingsEntries.add(entry);
    await logActivity("savings_deposit", { date: entry.date });
    if (entry.goalId) await WealthRepository.settleGoal(entry.goalId);
  },

  async addGoal(goal: Omit<SavingsGoal, "id" | "createdAt">): Promise<void> {
    await db.savingsGoals.add({ ...goal, createdAt: today() });
    await logActivity("goal_created");
  },

  /** Marks a goal complete once its deposits cover the target. */
  async settleGoal(goalId: number): Promise<void> {
    const goal = await db.savingsGoals.get(goalId);
    if (!goal || goal.completedAt) return;
    const deposits = await db.savingsEntries.where("goalId").equals(goalId).toArray();
    const saved = deposits.reduce((sum, entry) => sum + entry.amount, 0);
    if (saved >= goal.targetAmount) {
      await db.savingsGoals.update(goalId, { completedAt: today() });
      await logActivity("goal_completed");
    }
  },

  async addPurchasePlan(plan: Omit<PurchasePlan, "id" | "createdAt">): Promise<void> {
    await db.purchasePlans.add({ ...plan, createdAt: today() });
    await logActivity("purchase_planned");
  },

  async markPurchased(id: number): Promise<void> {
    await db.purchasePlans.update(id, { purchasedAt: today() });
  },

  async removePurchasePlan(id: number): Promise<void> {
    await db.purchasePlans.delete(id);
  },
};

/** Hours of work required to afford a price at a given hourly rate. */
export function hoursOfWork(price: number, hourlyRate: number): number {
  if (hourlyRate <= 0) return 0;
  return price / hourlyRate;
}
