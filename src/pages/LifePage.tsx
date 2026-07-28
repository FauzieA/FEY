import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { LifeRepository } from "@/repositories/lifeRepository";
import type { TimelineEvent } from "@/types/modules";
import { formatDate, relativeDay, startOfWeek, today } from "@/utils/date";

const TABS = [
  { id: "journal", label: "Journal" },
  { id: "people", label: "People" },
  { id: "reminders", label: "Call reminders" },
  { id: "timeline", label: "Timeline" },
];

export default function LifePage() {
  const [tab, setTab] = useState("journal");
  const snapshot = useFeySnapshot();

  const entriesThisWeek = snapshot.journalEntries.filter((entry) => entry.date >= startOfWeek()).length;
  const dueReminders = snapshot.callReminders.filter((reminder) => !reminder.completedAt && reminder.dueDate <= today());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People & Memory"
        title="Life"
        description="Journal entries, the people I want to stay close to, call reminders and my personal timeline."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Journal entries" value={snapshot.journalEntries.length} hint={`${entriesThisWeek} this week`} tone="burgundy" />
        <StatTile label="People tracked" value={snapshot.people.length} />
        <StatTile label="Check-ins due" value={dueReminders.length} tone={dueReminders.length ? "gold" : "default"} />
        <StatTile label="Timeline events" value={snapshot.timelineEvents.length} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "journal" && <JournalTab />}
      {tab === "people" && <PeopleTab />}
      {tab === "reminders" && <RemindersTab />}
      {tab === "timeline" && <TimelineTab />}
    </div>
  );
}

function JournalTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ date: today(), title: "", body: "", mood: "3", gratitude: "" });
  const entries = [...snapshot.journalEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Section title="Journal" subtitle="What happened, what I noticed, what I am grateful for">
      <InlineForm
        title="New entry"
        onSubmit={async () => {
          if (!form.title && !form.body) return;
          await LifeRepository.addJournalEntry({
            date: form.date,
            title: form.title || formatDate(form.date),
            body: form.body,
            mood: Number(form.mood),
            gratitude: form.gratitude || undefined,
          });
          setForm({ date: today(), title: "", body: "", mood: "3", gratitude: "" });
        }}
      >
        <Field label="Date">
          <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Mood" hint="1 low · 5 high">
          <Select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Title" className="sm:col-span-2">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Entry" className="sm:col-span-2">
          <TextArea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="min-h-32" />
        </Field>
        <Field label="Gratitude" className="sm:col-span-2">
          <TextInput value={form.gratitude} onChange={(e) => setForm({ ...form, gratitude: e.target.value })} />
        </Field>
      </InlineForm>

      <div className="space-y-2">
        {entries.length === 0 && <EmptyState title="No entries yet" hint="Even two lines a day builds the record." />}
        {entries.map((entry) => (
          <ListRow key={entry.id} title={entry.title} meta={`${formatDate(entry.date)}${entry.mood ? ` · mood ${entry.mood}/5` : ""}`}>
            <p className="whitespace-pre-line text-xs leading-relaxed text-[#4A4340]">{entry.body}</p>
            {entry.gratitude && <p className="mt-2 text-xs italic text-[#8C7B75]">Grateful for: {entry.gratitude}</p>}
          </ListRow>
        ))}
      </div>
    </Section>
  );
}

function PeopleTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ name: "", relationship: "", cadenceDays: "14", notes: "" });

  return (
    <Section title="People" subtitle="Who I want to stay connected with, and how often">
      <InlineForm
        title="Add person"
        onSubmit={async () => {
          if (!form.name) return;
          await LifeRepository.addPerson({
            name: form.name,
            relationship: form.relationship,
            cadenceDays: Number(form.cadenceDays) || 14,
            notes: form.notes || undefined,
            lastContactedAt: null,
          });
          setForm({ name: "", relationship: "", cadenceDays: "14", notes: "" });
        }}
      >
        <Field label="Name">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Relationship">
          <TextInput value={form.relationship} placeholder="Sister, mentor, friend…" onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
        </Field>
        <Field label="Reach out every (days)">
          <TextInput type="number" min="1" value={form.cadenceDays} onChange={(e) => setForm({ ...form, cadenceDays: e.target.value })} />
        </Field>
        <Field label="Notes">
          <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </InlineForm>

      <div className="space-y-2">
        {snapshot.people.length === 0 && <EmptyState title="No people added yet" />}
        {snapshot.people.map((person) => {
          const nextReminder = snapshot.callReminders
            .filter((reminder) => reminder.personId === person.id && !reminder.completedAt)
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
          return (
            <ListRow
              key={person.id}
              title={person.name}
              subtitle={[person.relationship, person.notes].filter(Boolean).join(" · ")}
              meta={
                person.lastContactedAt
                  ? `last spoke ${relativeDay(person.lastContactedAt)}`
                  : "not spoken yet"
              }
              actions={
                nextReminder && (
                  <Button size="sm" variant="rose" onClick={() => void LifeRepository.completeReminder(nextReminder.id!)}>
                    Log a call
                  </Button>
                )
              }
            />
          );
        })}
      </div>
    </Section>
  );
}

function RemindersTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ personId: "", dueDate: today(), note: "" });

  const open = [...snapshot.callReminders]
    .filter((reminder) => !reminder.completedAt)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = [...snapshot.callReminders]
    .filter((reminder) => reminder.completedAt)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 8);

  const nameFor = (personId: number) => snapshot.people.find((person) => person.id === personId)?.name ?? "Someone";

  return (
    <div className="space-y-6">
      <Section title="Due & upcoming">
        <InlineForm
          title="Schedule a call"
          onSubmit={async () => {
            if (!form.personId) return;
            await LifeRepository.addReminder({
              personId: Number(form.personId),
              dueDate: form.dueDate,
              note: form.note || undefined,
              completedAt: null,
            });
            setForm({ personId: "", dueDate: today(), note: "" });
          }}
        >
          <Field label="Person">
            <Select value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })}>
              <option value="">Select…</option>
              {snapshot.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date">
            <TextInput type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <Field label="Note" className="sm:col-span-2">
            <TextInput value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {open.length === 0 && <EmptyState title="No reminders scheduled" />}
          {open.map((reminder) => (
            <ListRow
              key={reminder.id}
              title={`Call ${nameFor(reminder.personId)}`}
              subtitle={reminder.note}
              meta={`${formatDate(reminder.dueDate)} · ${relativeDay(reminder.dueDate)}`}
              actions={
                <Button size="sm" onClick={() => void LifeRepository.completeReminder(reminder.id!)}>
                  Done
                </Button>
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Recently completed">
        {done.length === 0 ? (
          <EmptyState title="No completed check-ins yet" />
        ) : (
          <div className="space-y-2">
            {done.map((reminder) => (
              <ListRow key={reminder.id} title={`Called ${nameFor(reminder.personId)}`} meta={formatDate(reminder.completedAt!)} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function TimelineTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ date: today(), title: "", category: "milestone" as TimelineEvent["category"], description: "" });
  const events = [...snapshot.timelineEvents].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Section title="Personal timeline" subtitle="The events I want to remember in order">
      <InlineForm
        title="Add event"
        onSubmit={async () => {
          if (!form.title) return;
          await LifeRepository.addTimelineEvent({
            date: form.date,
            title: form.title,
            category: form.category,
            description: form.description || undefined,
          });
          setForm({ date: today(), title: "", category: "milestone", description: "" });
        }}
      >
        <Field label="Date">
          <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TimelineEvent["category"] })}>
            <option value="milestone">Milestone</option>
            <option value="memory">Memory</option>
            <option value="decision">Decision</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Title" className="sm:col-span-2">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </InlineForm>

      {events.length === 0 ? (
        <EmptyState title="Timeline is empty" />
      ) : (
        <ol className="relative space-y-4 border-l border-[#EAE3DE] pl-5">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#6B2D3A] bg-[#F8F5F2]" />
              <p className="text-[10px] uppercase tracking-widest text-[#8C7B75]">
                {formatDate(event.date)} · {event.category}
              </p>
              <p className="font-serif text-sm text-[#1A1817]">{event.title}</p>
              {event.description && <p className="text-xs leading-relaxed text-[#8C7B75]">{event.description}</p>}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
