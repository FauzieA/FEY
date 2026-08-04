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

  constructor() {
    this.loadQueue();
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
      const profiles = await api.get<any[]>('/profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await api.put(`/profile/${profiles[0].id}/`, data);
      } else {
        await api.post('/profile/', data);
      }
    }
  }

  private async syncSettingsItem(action: string, data: any) {
    if (action === 'update') {
      const settings = await api.get<any[]>('/settings/').catch(() => []);
      if (settings && settings.length > 0) {
        await api.put(`/settings/${settings[0].id}/`, data);
      } else {
        await api.post('/settings/', data);
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

  private async syncWorkoutItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/workouts/', data);
    }
  }

  private async syncXpItem(action: string, data: any) {
    if (action === 'create') {
      await api.post('/xp-events/', data);
    } else if (action === 'delete' && data && data.sessionId) {
      // Delete all XP events on the backend that are attributed to this sessionId
      const events = await api.get<any[]>('/xp-events/').catch(() => []);
      const toDelete = events.filter((e) => e.sessionId === data.sessionId);
      for (const ev of toDelete) {
        try {
          await api.delete(`/xp-events/${ev.id}/`);
        } catch (err) {
          console.error('Failed to delete xp-event on backend:', ev.id, err);
        }
      }
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
      const profiles = await api.get<any[]>('/wealth-profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await api.put(`/wealth-profile/${profiles[0].id}/`, data);
      } else {
        await api.post('/wealth-profile/', data);
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
    if (action === 'create') {
      await api.post('/personal-records/', data);
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

  async syncProfile() {
    if (!this.isOnline) return;
    
    try {
      const profiles = await api.get<any[]>('/profile/').catch(() => []);
      if (profiles && profiles.length > 0) {
        await db.character.put(profiles[0]);
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
        await db.settings.put(settings[0]);
      }
    } catch (error) {
      console.error('Failed to sync settings:', error);
    }
  }

  async syncPrayerLogs() {
    if (!this.isOnline) return;
    
    try {
      const logs = await api.get<any[]>('/salah/').catch(() => []);
      const prayerLogs = logs.map((log: any) => ({
        date: log.date,
        prayers: {
          fajr: log.fajr !== 'pending' && log.fajr !== 'missed',
          dhuhr: log.dhuhr !== 'pending' && log.dhuhr !== 'missed',
          asr: log.asr !== 'pending' && log.asr !== 'missed',
          maghrib: log.maghrib !== 'pending' && log.maghrib !== 'missed',
          isha: log.isha !== 'pending' && log.isha !== 'missed',
        }
      }));
      
      await db.prayerLogs.bulkPut(prayerLogs);
    } catch (error) {
      console.error('Failed to sync prayer logs:', error);
    }
  }

  async syncWorkouts() {
    if (!this.isOnline) return;
    
    try {
      const workouts = await api.get<any[]>('/workouts/').catch(() => []);
      await db.sessions.bulkPut(workouts);
    } catch (error) {
      console.error('Failed to sync workouts:', error);
    }
  }

  async syncXpEvents() {
    if (!this.isOnline) return;
    
    try {
      const events = await api.get<any[]>('/xp-events/').catch(() => []);
      await db.xpEvents.bulkPut(events);
    } catch (error) {
      console.error('Failed to sync XP events:', error);
    }
  }

  async syncAll() {
    if (!this.isOnline) return;
    
    console.log('Starting full sync from backend...');
    const promises = [
      this.syncProfile(),
      this.syncSettings(),
      this.syncPrayerLogs(),
      this.syncWorkouts(),
      this.syncXpEvents(),
    ];

    await Promise.allSettled(promises);
    console.log('Full sync complete');
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
