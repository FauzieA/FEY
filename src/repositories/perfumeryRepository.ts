import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import type { PerfumeFormula, PerfumeVersion } from "@/types/modules";

export const PerfumeryRepository = {
  async createFormula(formula: Omit<PerfumeFormula, "id" | "createdAt">): Promise<number> {
    const id = await db.perfumeFormulas.add({ ...formula, createdAt: today() });
    await logActivity("formula_created");
    syncService.queueSync('perfume_formula', { ...formula, createdAt: today() }, 'create');
    return id;
  },

  async addVersion(version: Omit<PerfumeVersion, "id">): Promise<void> {
    await db.perfumeVersions.add(version);
    await logActivity("version_logged", { date: version.date });
    syncService.queueSync('perfume_version', version, 'create');
  },

  async archiveFormula(id: number, archived: boolean): Promise<void> {
    await db.perfumeFormulas.update(id, { archived });
    syncService.queueSync('perfume_formula', { id, archived });
  },

  async deleteFormula(id: number): Promise<void> {
    await db.perfumeVersions.where("formulaId").equals(id).delete();
    await db.perfumeFormulas.delete(id);
    syncService.queueSync('delete_perfume_formula', id);
  },

  /** Next version label for a formula, e.g. v1 → v2. */
  async nextVersionLabel(formulaId: number): Promise<string> {
    const count = await db.perfumeVersions.where("formulaId").equals(formulaId).count();
    return `v${count + 1}`;
  },
};
