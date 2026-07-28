import { db } from "@/db/dexie";
import { logActivity } from "@/services/xpService";
import { addDays, today } from "@/utils/date";
import type { CallReminder, JournalEntry, Person, TimelineEvent } from "@/types/modules";

export const LifeRepository = {
  async addJournalEntry(entry: Omit<JournalEntry, "id">): Promise<void> {
    await db.journalEntries.add(entry);
    await logActivity("journal_entry", { date: entry.date });
  },

  async addPerson(person: Omit<Person, "id">): Promise<number> {
    const id = await db.people.add(person);
    await db.callReminders.add({ personId: id, dueDate: addDays(today(), person.cadenceDays), completedAt: null });
    return id;
  },

  /** Marks a check-in done and schedules the next one from the person's cadence. */
  async completeReminder(reminderId: number): Promise<void> {
    const reminder = await db.callReminders.get(reminderId);
    if (!reminder) return;

    await db.callReminders.update(reminderId, { completedAt: today() });
    await db.people.update(reminder.personId, { lastContactedAt: today() });

    const person = await db.people.get(reminder.personId);
    if (person) {
      await db.callReminders.add({
        personId: person.id!,
        dueDate: addDays(today(), person.cadenceDays),
        completedAt: null,
      });
    }
    await logActivity("person_contacted");
  },

  async addReminder(reminder: Omit<CallReminder, "id">): Promise<void> {
    await db.callReminders.add(reminder);
  },

  async addTimelineEvent(event: Omit<TimelineEvent, "id">): Promise<void> {
    await db.timelineEvents.add(event);
    await logActivity("timeline_event", { date: event.date });
  },

  async removePerson(id: number): Promise<void> {
    await db.callReminders.where("personId").equals(id).delete();
    await db.people.delete(id);
  },
};
