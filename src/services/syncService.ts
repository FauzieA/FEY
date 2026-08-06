import { db } from '@/db/dexie';
import { api } from './api';

interface SyncQueueItem {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

class SyncService {
  private queue: SyncQueueItem[] = [];
  private isSyncing = false;
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private immediateSyncTimeout: NodeJS.Timeout | null = null;
  private lastSyncedAt: string | null = null;
  private fullSyncPromise: Promise<void> | null = null;

  constructor() {
    this.loadQueue();
    this.loadLastSyncedAt();
    this.setupEventListeners();
    this.startAutoSync();
    
    // Process any pending queue immediately on load if online
    if (this.isOnline && this.queue.length > 0) {
      this.processQueue();
      // Also refresh remote data after attempting to push local changes
      this.syncAll();
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored, processing sync queue...');
      this.processQueue();
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Connection lost, queueing operations locally');
    });
  }

  private async loadQueue() {
    try {
      const stored = localStorage.getItem('sync_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`Loaded ${this.queue.length} pending sync operations`);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private loadLastSyncedAt() {
    try {
      const stored = localStorage.getItem('last_synced_at');
      if (stored) {
        this.lastSyncedAt = stored;
        console.log(`Last synced at: ${this.lastSyncedAt}`);
      }
    } catch (error) {
      console.error('Failed to load last synced at:', error);
    }
  }

  private saveLastSyncedAt() {
    try {
      if (this.lastSyncedAt) {
        localStorage.setItem('last_synced_at', this.lastSyncedAt);
      }
    } catch (error) {
      console.error('Failed to save last synced at:', error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  queueSync(type: string, data: any, action: 'create' | 'update' | 'delete' = 'update') {
    const item: SyncQueueItem = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(item);
    this.saveQueue();

    // Immediately try to sync if online
    if (this.isOnline) {
      this.scheduleImmediateSync();
    }
  }

  private scheduleImmediateSync() {
    if (this.immediateSyncTimeout) {
      clearTimeout(this.immediateSyncTimeout);
    }
    
    // Longer delay to batch operations and reduce sync frequency
    this.immediateSyncTimeout = setTimeout(() => {
      if (!this.isSyncing) {
        this.processQueue();
      }
    }, 2000); // 2 seconds instead of 100ms
  }

  public async processQueue() {
    if (this.isSyncing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log(`Processing ${this.queue.length} sync operations...`);

    try {
      while (this.queue.length > 0 && this.isOnline) {
        const item = this.queue[0];
        
        try {
          await this.processItem(item);
          this.queue.shift();
          this.saveQueue();
          console.log(`Successfully synced ${item.type} operation`);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retries++;
          
          if (item.retries >= 5) {
            console.error(`Max retries reached for item ${item.id}, removing from queue`);
            this.queue.shift();
            this.saveQueue();
          } else {
            // Move to end of queue to try other items first
            this.queue.shift();
            this.queue.push(item);
            this.saveQueue();
            
            // Exponential backoff for retries
            const backoffTime = Math.min(1000 * Math.pow(2, item.retries), 10000);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }
    } finally {
      // After pushing local operations, refresh from backend to ensure local DB
      // contains the authoritative records (helps cross-device consistency).
      try {
        if (this.isOnline) await this.syncAll();
      } catch (err) {
        console.error('Failed to refresh after queue processing:', err);
      }

      this.isSyncing = false;
      console.log('Sync queue processing complete');
    }
  }

  private async processItem(item: SyncQueueItem) {
    const { type, action, data } = item;

    switch (type) {
      case 'profile':
        await this.syncProfileItem(action, data);
        break;
      case 'settings':
        await this.syncSettingsItem(action, data);
        break;
      case 'prayer':
        await this.syncPrayerItem(action, data);
        break;
      case 'workout':
        await this.syncWorkoutItem(action, data);
        break;
      case 'xp':
        await this.syncXpItem(action, data);
        break;
      case 'weight':
        await this.syncWeightItem(action, data);
        break;
      case 'measurement':
        await this.syncMeasurementItem(action, data);
        break;
      case 'sleep':
        await this.syncSleepItem(action, data);
        break;
      case 'cycle':
        await this.syncCycleItem(action, data);
        break;
      case 'health_note':
        await this.syncHealthNoteItem(action, data);
        break;
      case 'book':
        await this.syncBookItem(action, data);
        break;
      case 'reading_session':
        await this.syncReadingSessionItem(action, data);
        break;
      case 'perfume_formula':
        await this.syncPerfumeFormulaItem(action, data);
        break;
      case 'perfume_version':
        await this.syncPerfumeVersionItem(action, data);
        break;
      case 'savings':
        await this.syncSavingsItem(action, data);
        break;
      case 'savings_goal':
        await this.syncSavingsGoalItem(action, data);
        break;
      case 'purchase_plan':
        await this.syncPurchasePlanItem(action, data);
        break;
      case 'wealth_profile':
        await this.syncWealthProfileItem(action, data);
        break;
      case 'journal':
        await this.syncJournalItem(action, data);
        break;
      case 'person':
        await this.syncPersonItem(action, data);
        break;
      case 'call_reminder_complete':
        await this.syncCallReminderCompleteItem(action, data);
        break;
      case 'delete_book':
        await this.syncDeleteBookItem(action, data);
        break;
      case 'delete_person':
        await this.syncDeletePersonItem(action, data);
        break;
      case 'delete_purchase_plan':
        await this.syncDeletePurchasePlanItem(action, data);
        break;
      case 'delete_perfume_formula':
        await this.syncDeletePerfumeFormulaItem(action, data);
        break;
      case 'delete':
        await this.syncGenericDeleteItem(action, data);
        break;
      case 'call_reminder':
        await this.syncCallReminderItem(action, data);
        break;
      case 'timeline':
        await this.syncTimelineItem(action, data);
        break;
      case 'personal_record':
        await this.syncPersonalRecordItem(action, data);
        break;
      case 'quran_reading':
        await this.syncQuranReadingItem(action, data);
        break;
      case 'memorization':
        await this.syncMemorizationItem(action, data);
        break;
      case 'revision':
        await this.syncRevisionItem(action, data);
        break;
      case 'adhkar':
        await this.syncAdhkarItem(action, data);
        break;
      case 'missed_fast':
        await this.syncMissedFastItem(action, data);
        break;
      case 'delete_cycle':
        await this.syncDeleteCycleItem(action, data);
        break;
      case 'delete_missed_fast':
        await this.syncDeleteMissedFastItem(action, data);
        break;
      case 'delete_memorization':
        await this.syncDeleteMemorizationItem(action, data);
        break;
      case 'delete_adhkar_log':
        await this.syncDeleteAdhkarLogItem(action, data);
        break;
      default:
        console.warn(`Unknown sync type: ${type}`);
    }
  }

  private async syncProfileItem(action: string, data: any) {
    if (action === 'update') {
      const payload = { ...data };
      delete payload.id;

      const profiles = await api.get<any[]>('/profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await api.put(`/profile/${profiles[0].id}/`, payload);
      } else {
        await api.post('/profile/', payload);
      }
    }
  }

  private async syncSettingsItem(action: string, data: any) {
    if (action === 'update') {
      const payload = { ...data };
      delete payload.id;

      const settings = await api.get<any[]>('/settings/').catch(() => []);
      if (settings && settings.length > 0) {
        await api.put(`/settings/${settings[0].id}/`, payload);
      } else {
        await api.post('/settings/', payload);
      }
    }
  }

  private async syncPrayerItem(action: string, data: any) {
    if (action === 'update') {
      const logs = await api.get<any[]>('/salah/').catch(() => []);
      const existing = logs.find((l: any) => l.date === data.date);
      if (existing) {
        await api.patch(`/salah/${existing.id}/`, data);
      } else {
        await api.post('/salah/', data);
      }
    }
  }

  private async syncWorkoutItem(_action: string, data: any) {
    const payload = { ...data };
    const idIsValid = this.isUuid(data?.id);
    if (payload.id && !idIsValid) {
      delete payload.id;
    }

    if (idIsValid) {
      try {
        const response: any = await api.put(`/workouts/${data.id}/`, payload);
        await db.sessions.update(data.id, {
          syncStatus: 'synced',
          updatedAt: response.updated_at || data.updatedAt,
        });
        return;
      } catch (error) {
        // If the UUID path cannot be updated, fall back to create
      }
    }

    try {
      const response: any = await api.post('/workouts/', payload);
      await db.sessions.update(data.id, {
        syncStatus: 'synced',
        updatedAt: response.updated_at || data.updatedAt,
      });
    } catch (postError) {
      console.error('Failed to sync workout:', postError);
      await db.sessions.update(data.id, { syncStatus: 'failed' });
      throw postError;
    }
  }

  private async syncXpItem(action: string, data: any) {
    if (action === 'delete' && data?.sessionId) {
      const events = await api.get<any[]>('/xp-events/').catch(() => []);
      const toDelete = events.filter((event: any) => event.session_id === data.sessionId);
      for (const event of toDelete) {
        await api.delete(`/xp-events/${event.id}/`);
      }
      return;
    }

    const payload = { ...data };
    const idIsValid = this.isUuid(data?.id);
    if (payload.id && !idIsValid) {
      delete payload.id;
    }

    if (idIsValid) {
      try {
        const response: any = await api.put(`/xp-events/${data.id}/`, payload);
        await db.xpEvents.update(data.id, {
          syncStatus: 'synced',
          updatedAt: response.updated_at || data.updatedAt,
        });
        return;
      } catch (error) {
        // If the UUID path cannot be updated, fall back to create
      }
    }

    try {
      const response: any = await api.post('/xp-events/', payload);
      await db.xpEvents.update(data.id, {
        syncStatus: 'synced',
        updatedAt: response.updated_at || data.updatedAt,
      });
    } catch (postError) {
      console.error('Failed to sync xp event:', postError);
      await db.xpEvents.update(data.id, { syncStatus: 'failed' });
      throw postError;
    }
  }

  private async syncWeightItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/weight-logs/', data);
    }
  }

  private async syncMeasurementItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/measurements/', data);
    }
  }

  private async syncCallReminderCompleteItem(action: string, data: any) {
    if (action === 'update' && data?.id) {
      await api.patch(`/call-reminders/${data.id}/`, { completed_at: data.completedAt });
    }
  }

  private async syncDeleteBookItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/books/${data}/`);
    }
  }

  private async syncDeletePersonItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/people/${data}/`);
    }
  }

  private async syncDeletePurchasePlanItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/purchase-plans/${data}/`);
    }
  }

  private async syncDeletePerfumeFormulaItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/perfume-formulas/${data}/`);
    }
  }

  private async syncGenericDeleteItem(action: string, data: any) {
    if (action !== 'delete' || !data) return;

    if (data.table === 'weights') {
      await api.delete(`/weight-logs/${data.id}/`);
    } else if (data.table === 'sleepLogs') {
      await api.delete(`/sleep-logs/${data.id}/`);
    } else if (data.table === 'measurements') {
      await api.delete(`/measurements/${data.id}/`);
    } else if (data.table === 'healthNotes') {
      await api.delete(`/health-notes/${data.id}/`);
    }
  }

  private async syncSleepItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/sleep-logs/', data);
    }
  }

  private async syncCycleItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/cycle-logs/', data);
    } else if (action === 'update') {
      const logs = await api.get<any[]>('/cycle-logs/').catch(() => []);
      const existing = logs.find((l: any) => l.id === data.id);
      if (existing) {
        await api.patch(`/cycle-logs/${existing.id}/`, { endDate: data.endDate });
      }
    }
  }

  private async syncHealthNoteItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/health-notes/', data);
    }
  }

  private async syncBookItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/books/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/books/${data.id}/`, data);
    }
  }

  private async syncReadingSessionItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/reading-sessions/', data);
    }
  }

  private async syncPerfumeFormulaItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/perfume-formulas/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/perfume-formulas/${data.id}/`, data);
    }
  }

  private async syncPerfumeVersionItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/perfume-versions/', data);
    }
  }

  private async syncSavingsItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/savings-entries/', data);
    }
  }

  private async syncSavingsGoalItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/savings-goals/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/savings-goals/${data.id}/`, data);
    }
  }

  private async syncPurchasePlanItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/purchase-plans/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/purchase-plans/${data.id}/`, data);
    }
  }

  private async syncWealthProfileItem(action: string, data: any) {
    if (action === 'update') {
      const payload = { ...data };
      delete payload.id;

      const profiles = await api.get<any[]>('/wealth-profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await api.put(`/wealth-profile/${profiles[0].id}/`, payload);
      } else {
        await api.post('/wealth-profile/', payload);
      }
    }
  }

  private async syncJournalItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/journal-entries/', data);
    }
  }

  private async syncPersonItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/people/', data);
    }
  }

  private async syncCallReminderItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/call-reminders/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/call-reminders/${data.id}/`, data);
    }
  }

  private async syncTimelineItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/timeline-events/', data);
    }
  }

  private async syncPersonalRecordItem(action: string, data: any) {
    const payload = { ...data };
    const hasValidId = !!data?.id && this.isUuid(data.id);

    if (!hasValidId) {
      delete payload.id;
    }

    if (action === 'update' && hasValidId) {
      try {
        const response: any = await api.put(`/personal-records/${data.id}/`, payload);
        await db.personalRecords.update(data.id, {
          syncStatus: 'synced',
          updatedAt: response.updated_at || data.updatedAt,
        });
        return;
      } catch (error) {
        // If PUT fails (record doesn't exist), fall back to create
      }
    }

    try {
      const response: any = await api.post('/personal-records/', payload);
      const syncedId = data?.id ?? response?.id ?? null;
      if (syncedId) {
        await db.personalRecords.update(syncedId, {
          syncStatus: 'synced',
          updatedAt: response.updated_at || data.updatedAt,
        });
      } else {
        await db.personalRecords.put({
          ...payload,
          id: response?.id ?? crypto.randomUUID(),
          syncStatus: 'synced',
          updatedAt: response.updated_at || data.updatedAt,
        });
      }
    } catch (error) {
      console.error('Failed to sync personal record:', error);
      if (data?.id) {
        await db.personalRecords.update(data.id, { syncStatus: 'failed' });
      }
      throw error;
    }
  }

  private async syncQuranReadingItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/quran-reading/', data);
    }
  }

  private async syncMemorizationItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/memorization-entries/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/memorization-entries/${data.id}/`, data);
    }
  }

  private async syncRevisionItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/revisions/', data);
    }
  }

  private async syncAdhkarItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/adhkar/', data);
    } else if (action === 'update') {
      const logs = await api.get<any[]>('/adhkar/').catch(() => []);
      const existing = logs.find((l: any) => l.date === data.date);
      if (existing) {
        await api.patch(`/adhkar/${existing.id}/`, data);
      } else {
        await api.post('/adhkar/', data);
      }
    }
  }

  private async syncMissedFastItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/missed-fasts/', data);
    } else if (action === 'update' && data.id) {
      await api.patch(`/missed-fasts/${data.id}/`, data);
    }
  }

  private async syncDeleteCycleItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/cycle-logs/${data}/`);
    }
  }

  private async syncDeleteMissedFastItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/missed-fasts/${data}/`);
    }
  }

  private async syncDeleteMemorizationItem(action: string, data: any) {
    if (action === 'delete') {
      await api.delete(`/memorization-entries/${data}/`);
    }
  }

  private async syncDeleteAdhkarLogItem(action: string, data: any) {
    if (action === 'delete') {
      const logs = await api.get<any[]>('/adhkar/').catch(() => []);
      const existing = logs.find((l: any) => l.date === data);
      if (existing) {
        await api.delete(`/adhkar/${existing.id}/`);
      }
    }
  }

  private isUuid(value: unknown): boolean {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  async syncProfile() {
    if (!this.isOnline) return;
    
    try {
      const profiles = await api.get<any[]>('/profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await db.character.put({
          ...this.createSyncedRecord(profiles[0]),
          id: 'user',
        });
      }
    } catch (error) {
      console.error('Failed to sync profile:', error);
    }
  }

  async syncSettings() {
    if (!this.isOnline) return;
    
    try {
      const settings = await api.get<any[]>('/settings/').catch(() => []);
      if (settings && settings.length > 0) {
        await db.settings.put({
          ...this.createSyncedRecord(settings[0]),
          id: 'app_settings',
        });
      }
    } catch (error) {
      console.error('Failed to sync settings:', error);
    }
  }

  async syncBooks() {
    if (!this.isOnline) return;

    try {
      const books = await api.get<any[]>('/books/').catch(() => []);
      const localBooks = await db.books.toArray();
      const localBookMap = new Map(localBooks.map((item: any) => [item.id, item]));

      for (const book of books) {
        const existing = localBookMap.get(book.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.books.put(this.createSyncedRecord(book));
        }
      }
    } catch (error) {
      console.error('Failed to sync books:', error);
    }
  }

  private normalizeRemoteRelationships(remote: any, relationshipMap: Record<string, string>) {
    const normalized = { ...remote };
    Object.entries(relationshipMap).forEach(([remoteKey, localKey]) => {
      if (normalized[remoteKey] !== undefined) {
        normalized[localKey] = normalized[remoteKey];
        delete normalized[remoteKey];
      }
    });
    return normalized;
  }

  private createSyncedRecord(remote: any) {
    return {
      ...remote,
      createdAt: remote.createdAt ?? new Date().toISOString(),
      updatedAt: remote.updatedAt ?? new Date().toISOString(),
      syncStatus: 'synced',
    };
  }

  async syncPrayerLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/salah/').catch(() => []);
      const localLogs = await db.prayerLogs.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.date, item]));

      for (const log of logs) {
        const remotePrayerLog = this.createSyncedRecord({
          id: log.id,
          date: log.date,
          prayers: {
            fajr: log.fajr !== 'pending' && log.fajr !== 'missed',
            dhuhr: log.dhuhr !== 'pending' && log.dhuhr !== 'missed',
            asr: log.asr !== 'pending' && log.asr !== 'missed',
            maghrib: log.maghrib !== 'pending' && log.maghrib !== 'missed',
            isha: log.isha !== 'pending' && log.isha !== 'missed',
          },
        });

        const existing = localLogMap.get(log.date);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.prayerLogs.put(remotePrayerLog);
        }
      }
    } catch (error) {
      console.error('Failed to sync prayer logs:', error);
    }
  }

  async syncWorkouts() {
    if (!this.isOnline) return;
    
    try {
      const workouts = await api.get<any[]>('/workouts/').catch(() => []);
      
      for (const workout of workouts) {
        const local = await db.sessions.get(workout.id);
        const localUpdatedAt = local?.updatedAt;
        const remoteUpdatedAt = workout.updatedAt;
        const syncedWorkout = this.createSyncedRecord(workout);

        if (!local || (remoteUpdatedAt && localUpdatedAt && new Date(remoteUpdatedAt) > new Date(localUpdatedAt))) {
          await db.sessions.put(syncedWorkout);
        }
      }
      
      this.lastSyncedAt = new Date().toISOString();
      this.saveLastSyncedAt();
    } catch (error) {
      console.error('Failed to sync workouts:', error);
    }
  }

  async syncXpEvents() {
    if (!this.isOnline) return;
    
    try {
      const events = await api.get<any[]>('/xp-events/').catch(() => []);
      const localEvents = await db.xpEvents.toArray();
      const localEventMap = new Map(localEvents.map((item: any) => [item.id, item]));

      for (const event of events) {
        const existing = localEventMap.get(event.id);

        if (!existing || existing.syncStatus !== 'pending') {
          await db.xpEvents.put(this.createSyncedRecord(event));
        }
      }
    } catch (error) {
      console.error('Failed to sync XP events:', error);
    }
  }

  async syncPersonalRecords() {
    if (!this.isOnline) return;

    try {
      const records = await api.get<any[]>('/personal-records/').catch(() => []);
      const localRecords = await db.personalRecords.toArray();
      const localRecordMap = new Map(localRecords.map((item: any) => [item.id, item]));

      for (const record of records) {
        const existing = localRecordMap.get(record.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.personalRecords.put(this.createSyncedRecord(record));
        }
      }
    } catch (error) {
      console.error('Failed to sync personal records:', error);
    }
  }

  async syncQuranReadingLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/quran-reading/').catch(() => []);
      const localLogs = await db.quranReading.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.id, item]));

      for (const log of logs) {
        const existing = localLogMap.get(log.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.quranReading.put(this.createSyncedRecord(log));
        }
      }
    } catch (error) {
      console.error('Failed to sync Quran reading logs:', error);
    }
  }

  async syncMemorizationEntries() {
    if (!this.isOnline) return;
    
    try {
      const entries = await api.get<any[]>('/memorization-entries/').catch(() => []);
      const localEntries = await db.memorization.toArray();
      const localEntryMap = new Map(localEntries.map((item: any) => [item.id, item]));

      for (const entry of entries) {
        const existing = localEntryMap.get(entry.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.memorization.put(this.createSyncedRecord(entry));
        }
      }
    } catch (error) {
      console.error('Failed to sync memorization entries:', error);
    }
  }

  async syncRevisionLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/revisions/').catch(() => []);
      const localLogs = await db.revisions.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.id, item]));

      for (const log of logs) {
        const existing = localLogMap.get(log.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.revisions.put(this.createSyncedRecord(log));
        }
      }
    } catch (error) {
      console.error('Failed to sync revision logs:', error);
    }
  }

  async syncAdhkarLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/adhkar/').catch(() => []);
      const localLogs = await db.adhkarLogs.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.id, item]));

      for (const log of logs) {
        const existing = localLogMap.get(log.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.adhkarLogs.put(this.createSyncedRecord(log));
        }
      }
    } catch (error) {
      console.error('Failed to sync adhkar logs:', error);
    }
  }

  async syncMissedFasts() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/missed-fasts/').catch(() => []);
      const localLogs = await db.missedFasts.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.id, item]));

      for (const log of logs) {
        const existing = localLogMap.get(log.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.missedFasts.put(this.createSyncedRecord(log));
        }
      }
    } catch (error) {
      console.error('Failed to sync missed fasts:', error);
    }
  }

  async syncMeasurements() {
    if (!this.isOnline) return;
    
    try {
      const measurements = await api.get<any[]>('/measurements/').catch(() => []);
      const localMeasurements = await db.measurements.toArray();
      const localMeasurementMap = new Map(localMeasurements.map((item: any) => [item.id, item]));

      for (const measurement of measurements) {
        const existing = localMeasurementMap.get(measurement.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.measurements.put(this.createSyncedRecord(measurement));
        }
      }
    } catch (error) {
      console.error('Failed to sync measurements:', error);
    }
  }

  async syncWeightLogs() {
    if (!this.isOnline) return;
    
    try {
      const weights = await api.get<any[]>('/weight-logs/').catch(() => []);
      const localWeights = await db.weights.toArray();
      const localWeightMap = new Map(localWeights.map((item: any) => [item.id, item]));

      for (const weight of weights) {
        const existing = localWeightMap.get(weight.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.weights.put(this.createSyncedRecord(weight));
        }
      }
    } catch (error) {
      console.error('Failed to sync weight logs:', error);
    }
  }

  async syncSleepLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/sleep-logs/').catch(() => []);
      const localLogs = await db.sleepLogs.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.id, item]));

      for (const log of logs) {
        const existing = localLogMap.get(log.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.sleepLogs.put(this.createSyncedRecord(log));
        }
      }
    } catch (error) {
      console.error('Failed to sync sleep logs:', error);
    }
  }

  async syncCycleLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/cycle-logs/').catch(() => []);
      const localLogs = await db.cycleLogs.toArray();
      const localLogMap = new Map(localLogs.map((item: any) => [item.id, item]));

      for (const log of logs) {
        const existing = localLogMap.get(log.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.cycleLogs.put(this.createSyncedRecord(log));
        }
      }
    } catch (error) {
      console.error('Failed to sync cycle logs:', error);
    }
  }

  async syncHealthNotes() {
    if (!this.isOnline) return;
    
    try {
      const notes = await api.get<any[]>('/health-notes/').catch(() => []);
      const localNotes = await db.healthNotes.toArray();
      const localNoteMap = new Map(localNotes.map((item: any) => [item.id, item]));

      for (const note of notes) {
        const existing = localNoteMap.get(note.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.healthNotes.put(this.createSyncedRecord(note));
        }
      }
    } catch (error) {
      console.error('Failed to sync health notes:', error);
    }
  }

  async syncPerfumeFormulas() {
    if (!this.isOnline) return;
    
    try {
      const formulas = await api.get<any[]>('/perfume-formulas/').catch(() => []);
      const localFormulas = await db.perfumeFormulas.toArray();
      const localFormulaMap = new Map(localFormulas.map((item: any) => [item.id, item]));

      for (const formula of formulas) {
        const existing = localFormulaMap.get(formula.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.perfumeFormulas.put(this.createSyncedRecord(formula));
        }
      }
    } catch (error) {
      console.error('Failed to sync perfume formulas:', error);
    }
  }

  async syncSavingsGoals() {
    if (!this.isOnline) return;
    
    try {
      const goals = await api.get<any[]>('/savings-goals/').catch(() => []);
      const localGoals = await db.savingsGoals.toArray();
      const localGoalMap = new Map(localGoals.map((item: any) => [item.id, item]));

      for (const goal of goals) {
        const existing = localGoalMap.get(goal.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.savingsGoals.put(this.createSyncedRecord(goal));
        }
      }
    } catch (error) {
      console.error('Failed to sync savings goals:', error);
    }
  }

  async syncPurchasePlans() {
    if (!this.isOnline) return;
    
    try {
      const plans = await api.get<any[]>('/purchase-plans/').catch(() => []);
      const localPlans = await db.purchasePlans.toArray();
      const localPlanMap = new Map(localPlans.map((item: any) => [item.id, item]));

      for (const plan of plans) {
        const existing = localPlanMap.get(plan.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.purchasePlans.put(this.createSyncedRecord(plan));
        }
      }
    } catch (error) {
      console.error('Failed to sync purchase plans:', error);
    }
  }

  async syncWealthProfile() {
    if (!this.isOnline) return;
    
    try {
      const profiles = await api.get<any[]>('/wealth-profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await db.wealthProfile.put({
          ...this.createSyncedRecord(profiles[0]),
          id: 'wealth',
        });
      }
    } catch (error) {
      console.error('Failed to sync wealth profile:', error);
    }
  }

  async syncJournalEntries() {
    if (!this.isOnline) return;
    
    try {
      const entries = await api.get<any[]>('/journal-entries/').catch(() => []);
      const localEntries = await db.journalEntries.toArray();
      const localEntryMap = new Map(localEntries.map((item: any) => [item.id, item]));

      for (const entry of entries) {
        const existing = localEntryMap.get(entry.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.journalEntries.put(this.createSyncedRecord(entry));
        }
      }
    } catch (error) {
      console.error('Failed to sync journal entries:', error);
    }
  }

  async syncPeople() {
    if (!this.isOnline) return;
    
    try {
      const people = await api.get<any[]>('/people/').catch(() => []);
      const localPeople = await db.people.toArray();
      const localPersonMap = new Map(localPeople.map((item: any) => [item.id, item]));

      for (const person of people) {
        const existing = localPersonMap.get(person.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.people.put(this.createSyncedRecord(person));
        }
      }
    } catch (error) {
      console.error('Failed to sync people:', error);
    }
  }

  async syncTimelineEvents() {
    if (!this.isOnline) return;
    
    try {
      const events = await api.get<any[]>('/timeline-events/').catch(() => []);
      const localEvents = await db.timelineEvents.toArray();
      const localEventMap = new Map(localEvents.map((item: any) => [item.id, item]));

      for (const event of events) {
        const existing = localEventMap.get(event.id);
        if (!existing || existing.syncStatus !== 'pending') {
          await db.timelineEvents.put(this.createSyncedRecord(event));
        }
      }
    } catch (error) {
      console.error('Failed to sync timeline events:', error);
    }
  }

  async syncReadingSessions() {
    if (!this.isOnline) return;
    
    try {
      const sessions = await api.get<any[]>('/reading-sessions/').catch(() => []);
      const localSessions = await db.readingSessions.toArray();
      const localSessionMap = new Map(localSessions.map((item: any) => [item.id, item]));

      for (const session of sessions) {
        const existing = localSessionMap.get(session.id);
        const normalized = this.normalizeRemoteRelationships(session, { book: 'bookId' });

        if (!existing || existing.syncStatus !== 'pending') {
          await db.readingSessions.put(this.createSyncedRecord(normalized));
        }
      }
    } catch (error) {
      console.error('Failed to sync reading sessions:', error);
    }
  }

  async syncPerfumeVersions() {
    if (!this.isOnline) return;
    
    try {
      const versions = await api.get<any[]>('/perfume-versions/').catch(() => []);
      const localVersions = await db.perfumeVersions.toArray();
      const localVersionMap = new Map(localVersions.map((item: any) => [item.id, item]));

      for (const version of versions) {
        const existing = localVersionMap.get(version.id);
        const normalized = this.normalizeRemoteRelationships(version, { formula: 'formulaId' });

        if (!existing || existing.syncStatus !== 'pending') {
          await db.perfumeVersions.put(this.createSyncedRecord(normalized));
        }
      }
    } catch (error) {
      console.error('Failed to sync perfume versions:', error);
    }
  }

  async syncSavingsEntries() {
    if (!this.isOnline) return;
    
    try {
      const entries = await api.get<any[]>('/savings-entries/').catch(() => []);
      const localEntries = await db.savingsEntries.toArray();
      const localEntryMap = new Map(localEntries.map((item: any) => [item.id, item]));

      for (const entry of entries) {
        const existing = localEntryMap.get(entry.id);
        const normalized = this.normalizeRemoteRelationships(entry, { goal: 'goalId' });

        if (!existing || existing.syncStatus !== 'pending') {
          await db.savingsEntries.put(this.createSyncedRecord(normalized));
        }
      }
    } catch (error) {
      console.error('Failed to sync savings entries:', error);
    }
  }

  async syncCallReminders() {
    if (!this.isOnline) return;
    
    try {
      const reminders = await api.get<any[]>('/call-reminders/').catch(() => []);
      const localReminders = await db.callReminders.toArray();
      const localReminderMap = new Map(localReminders.map((item: any) => [item.id, item]));

      for (const reminder of reminders) {
        const existing = localReminderMap.get(reminder.id);
        const normalized = this.normalizeRemoteRelationships(reminder, { person: 'personId' });

        if (!existing || existing.syncStatus !== 'pending') {
          await db.callReminders.put(this.createSyncedRecord(normalized));
        }
      }
    } catch (error) {
      console.error('Failed to sync call reminders:', error);
    }
  }

  async syncAll() {
    if (!this.isOnline) return;

    if (this.fullSyncPromise) {
      return this.fullSyncPromise;
    }

    this.fullSyncPromise = (async () => {
      console.log('Starting full sync from backend...');
      const promises = [
        this.syncProfile(),
        this.syncSettings(),
        this.syncPrayerLogs(),
        this.syncWorkouts(),
        this.syncXpEvents(),
        this.syncPersonalRecords(),
        this.syncBooks(),
        this.syncReadingSessions(),
        this.syncPerfumeFormulas(),
        this.syncPerfumeVersions(),
        this.syncQuranReadingLogs(),
        this.syncMemorizationEntries(),
        this.syncRevisionLogs(),
        this.syncAdhkarLogs(),
        this.syncMissedFasts(),
        this.syncMeasurements(),
        this.syncWeightLogs(),
        this.syncSleepLogs(),
        this.syncCycleLogs(),
        this.syncHealthNotes(),
        this.syncSavingsEntries(),
        this.syncSavingsGoals(),
        this.syncPurchasePlans(),
        this.syncWealthProfile(),
        this.syncJournalEntries(),
        this.syncPeople(),
        this.syncCallReminders(),
        this.syncTimelineEvents(),
      ];

      await Promise.allSettled(promises);
      console.log('Full sync complete');
    })();

    try {
      return await this.fullSyncPromise;
    } finally {
      this.fullSyncPromise = null;
    }
  }

  private startAutoSync() {
    // Sync every 10 seconds when online for more frequent updates
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll();
        this.processQueue();
      }
    }, 10000); // 10000ms = 10 seconds
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.immediateSyncTimeout) {
      clearTimeout(this.immediateSyncTimeout);
      this.immediateSyncTimeout = null;
    }
  }

  getQueueSize() {
    return this.queue.length;
  }

  isSyncInProgress() {
    return this.isSyncing;
  }

  forceSync() {
    if (this.isOnline) {
      this.processQueue();
      this.syncAll();
    }
  }
}

export const syncService = new SyncService();
