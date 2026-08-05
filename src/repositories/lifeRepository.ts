import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { addDays, today } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";
import type { CallReminder, JournalEntry, Person, TimelineEvent } from "@/types/modules";

export const LifeRepository = {
  async addJournalEntry(entry: Omit<JournalEntry, "id">): Promise<void> {
    const record: JournalEntry = {
      id: generateUUID(),
      ...entry,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.journalEntries.add(record);
    await logActivity("journal_entry", { date: entry.date });
    syncService.queueSync('journal', record, 'create');
  },

  async addPerson(person: Omit<Person, "id">): Promise<string> {
    const record: Person = {
      id: generateUUID(),
      ...person,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    const id = await db.people.add(record);
    await db.callReminders.add({
      id: generateUUID(),
      personId: record.id,
      dueDate: addDays(today(), person.cadenceDays),
      completedAt: null,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    });
    syncService.queueSync('person', record, 'create');
    syncService.queueSync('call_reminder', { personId: record.id, dueDate: addDays(today(), person.cadenceDays), completedAt: null }, 'create');
    return record.id;
  },

  /** Marks a check-in done and schedules the next one from the person's cadence. */
  async completeReminder(reminderId: string): Promise<void> {
    const reminder = await db.callReminders.get(reminderId);
    if (!reminder) return;

    await db.callReminders.update(reminderId, { completedAt: today(), updatedAt: today(), syncStatus: 'pending' });
    await db.people.update(reminder.personId, { lastContactedAt: today(), updatedAt: today(), syncStatus: 'pending' });

    const person = await db.people.get(reminder.personId);
    if (person) {
      const newReminder = {
        id: generateUUID(),
        personId: person.id,
        dueDate: addDays(today(), person.cadenceDays),
        completedAt: null,
        createdAt: today(),
        updatedAt: today(),
        syncStatus: 'pending',
      };
      await db.callReminders.add(newReminder);
      syncService.queueSync('call_reminder', newReminder, 'create');
    }
    await logActivity("person_contacted");
    syncService.queueSync('call_reminder_complete', { id: reminderId, completedAt: today() });
  },

  async addReminder(reminder: Omit<CallReminder, "id">): Promise<void> {
    const record: CallReminder = {
      id: generateUUID(),
      ...reminder,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.callReminders.add(record);
    syncService.queueSync('call_reminder', record, 'create');
  },

  async addTimelineEvent(event: Omit<TimelineEvent, "id">): Promise<void> {
    const record: TimelineEvent = {
      id: generateUUID(),
      ...event,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.timelineEvents.add(record);
    await logActivity("timeline_event", { date: event.date });
    syncService.queueSync('timeline', record, 'create');
  },

  async removePerson(id: string): Promise<void> {
    await db.callReminders.where("personId").equals(id).delete();
    await db.people.delete(id);
    syncService.queueSync('delete_person', id);
  },
};
