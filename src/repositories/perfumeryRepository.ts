import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";
import type { PerfumeFormula, PerfumeVersion } from "@/types/modules";

export const PerfumeryRepository = {
  async createFormula(formula: Omit<PerfumeFormula, "id" | "createdAt">): Promise<string> {
    const record: PerfumeFormula = {
      id: generateUUID(),
      ...formula,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.perfumeFormulas.add(record);
    await logActivity("formula_created");
    syncService.queueSync('perfume_formula', record, 'create');
    return record.id;
  },

  async addVersion(version: Omit<PerfumeVersion, "id">): Promise<void> {
    const record: PerfumeVersion = {
      id: generateUUID(),
      ...version,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.perfumeVersions.add(record);
    await logActivity("version_logged", { date: version.date });
    syncService.queueSync('perfume_version', record, 'create');
  },

  async archiveFormula(id: string, archived: boolean): Promise<void> {
    await db.perfumeFormulas.update(id, { archived, updatedAt: today(), syncStatus: 'pending' });
    syncService.queueSync('perfume_formula', { id, archived });
  },

  async deleteFormula(id: string): Promise<void> {
    await db.perfumeVersions.where("formulaId").equals(id).delete();
    await db.perfumeFormulas.delete(id);
    syncService.queueSync('delete_perfume_formula', id);
  },

  /** Next version label for a formula, e.g. v1 → v2. */
  async nextVersionLabel(formulaId: string): Promise<string> {
    const count = await db.perfumeVersions.where("formulaId").equals(formulaId).count();
    return `v${count + 1}`;
  },
};
