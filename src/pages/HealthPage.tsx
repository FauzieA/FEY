import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { TrendChart } from "@/components/ui/TrendChart";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { HealthRepository } from "@/repositories/healthRepository";
import type { HealthNote } from "@/types/modules";
import { addDays, daysBetween, formatDate, formatShortDate, relativeDay, startOfWeek, today } from "@/utils/date";
import { average } from "@/utils/format";

const TABS = [
  { id: "body", label: "Weight" },
  { id: "measurements", label: "Measurements" },
  { id: "sleep", label: "Sleep" },
  { id: "cycle", label: "Cycle" },
  { id: "notes", label: "Health notes" },
];

export default function HealthPage() {
  const [tab, setTab] = useState("body");
  const snapshot = useFeySnapshot();

  const weights = [...snapshot.weights].sort((a, b) => a.date.localeCompare(b.date));
  const latest = weights.at(-1);
  const first = weights[0];
  const sleepThisWeek = snapshot.sleepLogs.filter((log) => log.date >= startOfWeek());
  const activeCycle = snapshot.cycleLogs.find((cycle) => !cycle.endDate);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Body & Recovery"
        title="Health"
        description="Monthly measurements, weight, sleep, cycle and the general health record."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Weight" value={latest ? `${latest.weightKg} kg` : "—"} hint={latest ? relativeDay(latest.date) : "Nothing logged"} tone="burgundy" />
        <StatTile
          label="Change"
          value={latest && first ? `${(latest.weightKg - first.weightKg).toFixed(1)} kg` : "—"}
          hint={first ? `since ${formatDate(first.date)}` : undefined}
        />
        <StatTile
          label="Sleep this week"
          value={sleepThisWeek.length ? `${average(sleepThisWeek.map((s) => s.hours)).toFixed(1)}h` : "—"}
          hint={`${sleepThisWeek.length} nights logged`}
        />
        <StatTile
          label="Cycle"
          value={activeCycle ? `Day ${daysBetween(activeCycle.startDate) + 1}` : "Not active"}
          hint={activeCycle ? `Started ${formatDate(activeCycle.startDate)}` : undefined}
        />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "body" && <WeightTab />}
      {tab === "measurements" && <MeasurementsTab />}
      {tab === "sleep" && <SleepTab />}
      {tab === "cycle" && <CycleTab />}
      {tab === "notes" && <NotesTab />}
    </div>
  );
}

function WeightTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ date: today(), weightKg: "", notes: "" });
  const weights = [...snapshot.weights].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <Section title="Weight trend">
        <TrendChart
          data={weights.map((entry) => ({ label: formatShortDate(entry.date), value: entry.weightKg }))}
          kind="area"
          unit=" kg"
          emptyLabel="Log a couple of weigh-ins to see the trend"
        />
      </Section>

      <Section title="Log">
        <InlineForm
          title="Log weight"
          onSubmit={async () => {
            if (!form.weightKg) return;
            await HealthRepository.logWeight({ date: form.date, weightKg: Number(form.weightKg), notes: form.notes || undefined });
            setForm({ date: today(), weightKg: "", notes: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Weight (kg)">
            <TextInput type="number" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {weights.length === 0 && <EmptyState title="No weigh-ins yet" />}
          {[...weights].reverse().slice(0, 8).map((entry) => (
            <ListRow key={entry.id} title={`${entry.weightKg} kg`} subtitle={entry.notes} meta={formatDate(entry.date)} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function MeasurementsTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ date: today(), waistCm: "", hipsCm: "", chestCm: "", thighCm: "", armCm: "", notes: "" });
  const measurements = [...snapshot.measurements].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <Section title="Monthly measurements" subtitle="Taken once a month, same conditions each time">
        <InlineForm
          title="Add measurements"
          onSubmit={async () => {
            await HealthRepository.addMeasurement({
              date: form.date,
              waistCm: form.waistCm ? Number(form.waistCm) : undefined,
              hipsCm: form.hipsCm ? Number(form.hipsCm) : undefined,
              chestCm: form.chestCm ? Number(form.chestCm) : undefined,
              thighCm: form.thighCm ? Number(form.thighCm) : undefined,
              armCm: form.armCm ? Number(form.armCm) : undefined,
              notes: form.notes || undefined,
            });
            setForm({ date: today(), waistCm: "", hipsCm: "", chestCm: "", thighCm: "", armCm: "", notes: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Waist (cm)">
            <TextInput type="number" step="0.1" value={form.waistCm} onChange={(e) => setForm({ ...form, waistCm: e.target.value })} />
          </Field>
          <Field label="Hips (cm)">
            <TextInput type="number" step="0.1" value={form.hipsCm} onChange={(e) => setForm({ ...form, hipsCm: e.target.value })} />
          </Field>
          <Field label="Chest (cm)">
            <TextInput type="number" step="0.1" value={form.chestCm} onChange={(e) => setForm({ ...form, chestCm: e.target.value })} />
          </Field>
          <Field label="Thigh (cm)">
            <TextInput type="number" step="0.1" value={form.thighCm} onChange={(e) => setForm({ ...form, thighCm: e.target.value })} />
          </Field>
          <Field label="Arm (cm)">
            <TextInput type="number" step="0.1" value={form.armCm} onChange={(e) => setForm({ ...form, armCm: e.target.value })} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {measurements.length === 0 && <EmptyState title="No measurements yet" hint="One set a month is enough." />}
          {measurements.map((entry) => (
            <ListRow
              key={entry.id}
              title={formatDate(entry.date)}
              subtitle={entry.notes}
              meta={[
                entry.waistCm && `waist ${entry.waistCm}`,
                entry.hipsCm && `hips ${entry.hipsCm}`,
                entry.chestCm && `chest ${entry.chestCm}`,
                entry.thighCm && `thigh ${entry.thighCm}`,
                entry.armCm && `arm ${entry.armCm}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function SleepTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ date: today(), hours: "", quality: "3", notes: "" });
  const logs = [...snapshot.sleepLogs].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <Section title="Hours slept">
        <TrendChart
          data={logs.slice(-14).map((entry) => ({ label: formatShortDate(entry.date), value: entry.hours }))}
          kind="bar"
          unit="h"
          emptyLabel="Log a few nights to see your pattern"
        />
      </Section>

      <Section title="Log a night">
        <InlineForm
          title="Log sleep"
          onSubmit={async () => {
            if (!form.hours) return;
            await HealthRepository.logSleep({
              date: form.date,
              hours: Number(form.hours),
              quality: Number(form.quality),
              notes: form.notes || undefined,
            });
            setForm({ date: today(), hours: "", quality: "3", notes: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Hours">
            <TextInput type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          </Field>
          <Field label="Quality" hint="1 poor · 5 excellent">
            <Select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes">
            <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {logs.length === 0 && <EmptyState title="No sleep logged yet" />}
          {[...logs].reverse().slice(0, 8).map((entry) => (
            <ListRow key={entry.id} title={`${entry.hours}h`} subtitle={entry.notes} meta={`quality ${entry.quality}/5 · ${formatDate(entry.date)}`} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function CycleTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ startDate: today(), symptoms: "", flow: "3" });
  const cycles = [...snapshot.cycleLogs].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const active = cycles.find((cycle) => !cycle.endDate);

  const gaps = cycles
    .slice(0, 6)
    .map((cycle, index, list) => (index + 1 < list.length ? daysBetween(list[index + 1].startDate, cycle.startDate) : null))
    .filter((gap): gap is number => gap !== null);
  const averageCycle = gaps.length ? Math.round(average(gaps)) : 28;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Average cycle" value={`${averageCycle} days`} hint={gaps.length ? `from ${gaps.length} cycles` : "assumed until tracked"} />
        <StatTile
          label="Next expected"
          value={cycles[0] ? formatDate(addDays(cycles[0].startDate, averageCycle)) : "—"}
          hint={cycles[0] ? relativeDay(addDays(cycles[0].startDate, averageCycle)) : undefined}
        />
      </div>

      <Section title="Cycles">
        <InlineForm
          title="Start a cycle"
          onSubmit={async () => {
            await HealthRepository.startCycle({
              startDate: form.startDate,
              endDate: null,
              symptoms: form.symptoms || undefined,
              flow: Number(form.flow),
            });
            setForm({ startDate: today(), symptoms: "", flow: "3" });
          }}
        >
          <Field label="Start date">
            <TextInput type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="Flow" hint="1 light · 5 heavy">
            <Select value={form.flow} onChange={(e) => setForm({ ...form, flow: e.target.value })}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Symptoms" className="sm:col-span-2">
            <TextInput value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
          </Field>
        </InlineForm>

        {active && (
          <div className="flex items-center justify-between rounded-2xl border border-[#D9B7BE]/50 bg-[#F2E8EA] p-4">
            <div>
              <p className="font-serif text-sm text-[#6B2D3A]">Cycle in progress</p>
              <p className="text-xs text-[#8C7B75]">Started {formatDate(active.startDate)}</p>
            </div>
            <Button size="sm" onClick={() => void HealthRepository.endCycle(active.id!)}>
              Mark ended
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {cycles.length === 0 && <EmptyState title="No cycles tracked yet" />}
          {cycles.map((cycle) => (
            <ListRow
              key={cycle.id}
              title={formatDate(cycle.startDate)}
              subtitle={cycle.symptoms}
              meta={cycle.endDate ? `${daysBetween(cycle.startDate, cycle.endDate) + 1} days` : "ongoing"}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function NotesTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ date: today(), category: "general" as HealthNote["category"], title: "", details: "" });
  const notes = [...snapshot.healthNotes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Section title="General health" subtitle="Symptoms, appointments, medication and anything worth remembering">
      <InlineForm
        title="Add health note"
        onSubmit={async () => {
          if (!form.title) return;
          await HealthRepository.addHealthNote({
            date: form.date,
            category: form.category,
            title: form.title,
            details: form.details || undefined,
          });
          setForm({ date: today(), category: "general", title: "", details: "" });
        }}
      >
        <Field label="Date">
          <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as HealthNote["category"] })}>
            <option value="general">General</option>
            <option value="symptom">Symptom</option>
            <option value="appointment">Appointment</option>
            <option value="medication">Medication</option>
          </Select>
        </Field>
        <Field label="Title" className="sm:col-span-2">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Details" className="sm:col-span-2">
          <TextArea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
        </Field>
      </InlineForm>

      <div className="space-y-2">
        {notes.length === 0 && <EmptyState title="No health notes yet" />}
        {notes.map((note) => (
          <ListRow key={note.id} title={note.title} subtitle={note.details} meta={`${note.category} · ${formatDate(note.date)}`} />
        ))}
      </div>
    </Section>
  );
}
