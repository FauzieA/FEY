import { db } from '@/db/dexie';
import type { CharacterState, AppSettings } from '@/types';

export class CharacterRepository {
  static async getCharacter(): Promise<CharacterState | undefined> {
    return await db.character.get('user');
  }

  static async updateCharacter(updates: Partial<CharacterState>): Promise<void> {
    await db.character.update('user', updates);
  }

  static async getSettings(): Promise<AppSettings | undefined> {
    return await db.settings.get('app_settings');
  }

  static async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    await db.settings.update('app_settings', updates);
  }
}