import { db } from '@/db/dexie';
import type { CharacterProfile, AppSettings } from '@/db/dexie';

export class CharacterRepository {
  static async getProfile(): Promise<CharacterProfile | undefined> {
    return await db.character.get('user');
  }

  static async saveProfile(profile: CharacterProfile): Promise<string> {
    return await db.character.put(profile);
  }

  static async getSettings(): Promise<AppSettings | undefined> {
    return await db.settings.get('app_settings');
  }

  static async saveSettings(settings: AppSettings): Promise<string> {
    return await db.settings.put(settings);
  }
}