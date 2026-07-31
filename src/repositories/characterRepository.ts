import { db } from '@/db/dexie';
import { syncService } from '@/services/syncService';
import type { CharacterProfile, AppSettings } from '@/db/dexie';

export class CharacterRepository {
  static async getProfile(): Promise<CharacterProfile | undefined> {
    // First try local Dexie
    const localProfile = await db.character.get('user');
    if (localProfile) {
      // Trigger background sync
      syncService.syncProfile();
      return localProfile;
    }
    
    // If no local data, try to fetch from backend
    try {
      await syncService.syncProfile();
      return await db.character.get('user');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return undefined;
    }
  }

  static async saveProfile(profile: CharacterProfile): Promise<string> {
    // Save to local Dexie immediately
    const id = await db.character.put(profile);
    
    // Queue sync to backend
    syncService.queueSync('profile', profile);
    
    return id;
  }

  static async getSettings(): Promise<AppSettings | undefined> {
    // First try local Dexie
    const localSettings = await db.settings.get('app_settings');
    if (localSettings) {
      // Trigger background sync
      syncService.syncSettings();
      return localSettings;
    }
    
    // If no local data, try to fetch from backend
    try {
      await syncService.syncSettings();
      return await db.settings.get('app_settings');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return undefined;
    }
  }

  static async saveSettings(settings: AppSettings): Promise<string> {
    // Save to local Dexie immediately
    const id = await db.settings.put(settings);
    
    // Queue sync to backend
    syncService.queueSync('settings', settings);
    
    return id;
  }
}