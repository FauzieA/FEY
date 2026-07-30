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
  { id: "sleep", label: "Sleep" },
  { id: "cycle", label: "Cycle" },
  { id: "body", label: "Weight" },
  { id: "measurements", label: "Measurements" },
  { id: "notes", label: "Health notes" },
];

export default function HealthPage() {
  const [tab, setTab] = useState("sleep");
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
  const [selectedBodyPart, setSelectedBodyPart] = useState<"waistCm" | "hipsCm" | "chestCm" | "thighCm" | "armCm">("waistCm");
  const measurements = [...snapshot.measurements].sort((a, b) => a.date.localeCompare(b.date));

  const bodyPartLabels = {
    waistCm: "Waist",
    hipsCm: "Hips",
    chestCm: "Chest",
    thighCm: "Thigh",
    armCm: "Arm",
  };

  const trendData = measurements
    .map((entry) => ({
      label: formatShortDate(entry.date),
      value: entry[selectedBodyPart] || 0,
    }))
    .filter((entry) => entry.value > 0);

  return (
    <div className="space-y-6">
      <Section title="Monthly measurements" subtitle="Taken once a month, same conditions each time">
        {/* Body Part Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(bodyPartLabels) as Array<keyof typeof bodyPartLabels>).map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => setSelectedBodyPart(part)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                selectedBodyPart === part
                  ? "bg-[#6B2D3A] text-white"
                  : "bg-[#FFFCFA] border border-[#EAE3DE] text-[#8C7B75] hover:border-[#D9B7BE]"
              }`}
            >
              {bodyPartLabels[part]}
            </button>
          ))}
        </div>

        {/* Trend Chart */}
        <TrendChart
          data={trendData}
          kind="line"
          unit=" cm"
          emptyLabel={`Log ${bodyPartLabels[selectedBodyPart]} measurements to see trend`}
        />
      </Section>

      <Section title="Log measurements">
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
  const [form, setForm] = useState({ date: today(), startTime: "23:00", endTime: "07:00", quality: "3", notes: "" });
  const logs = [...snapshot.sleepLogs].sort((a, b) => a.date.localeCompare(b.date));

  const calculateHours = (start: string, end: string): number => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    // If end time is earlier than start time, it means we crossed midnight
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const hours = calculateHours(form.startTime, form.endTime);

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
            if (!form.startTime || !form.endTime) return;
            await HealthRepository.logSleep({
              date: form.date,
              startTime: form.startTime,
              endTime: form.endTime,
              hours: calculateHours(form.startTime, form.endTime),
              quality: Number(form.quality),
              notes: form.notes || undefined,
            });
            setForm({ date: today(), startTime: "23:00", endTime: "07:00", quality: "3", notes: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Start time">
            <TextInput type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </Field>
          <Field label="End time">
            <TextInput type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </Field>
          <Field label="Hours" hint="Calculated automatically">
            <TextInput type="number" step="0.1" value={hours.toFixed(1)} readOnly className="bg-[#F8F5F2]" />
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
            <ListRow 
              key={entry.id} 
              title={`${entry.hours.toFixed(1)}h`} 
              subtitle={`${entry.startTime} - ${entry.endTime}`} 
              meta={`quality ${entry.quality}/5 · ${formatDate(entry.date)}`} 
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function CycleTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ startDate: today(), symptoms: "", flow: "3" });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isCalendarEditable, setIsCalendarEditable] = useState(false);
  const cycles = [...snapshot.cycleLogs].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const active = cycles.find((cycle) => !cycle.endDate);

  const gaps = cycles
    .slice(0, 6)
    .map((cycle, index, list) => (index + 1 < list.length ? daysBetween(list[index + 1].startDate, cycle.startDate) : null))
    .filter((gap): gap is number => gap !== null);
  const averageCycle = gaps.length ? Math.round(average(gaps)) : 28;

  // Calculate current phase with detailed insights
  const getCurrentPhase = () => {
    if (!active) return { 
      phase: "No active cycle", 
      symptoms: "Start tracking to see phase info",
      biologicalState: "",
      expectedBehavior: ""
    };
    const currentDay = daysBetween(active.startDate) + 1;
    
    if (currentDay <= 5) {
      return { 
        phase: "Menstrual Phase", 
        symptoms: "Lower energy, possible cramps, muscle aches, natural instinct toward rest and reflection",
        biologicalState: "Estrogen and progesterone are at their lowest baseline",
        expectedBehavior: "Lower physical energy, possible cramps, muscle aches, and a natural instinct toward rest and reflection"
      };
    } else if (currentDay <= 13) {
      return { 
        phase: "Follicular Phase", 
        symptoms: "Rising energy, good time for new projects, social activities",
        biologicalState: "Estrogen steadily rises, improving mood, focus, and brain plasticity",
        expectedBehavior: "Rising vitality, clearer mental focus, and expanding mental endurance"
      };
    } else if (currentDay <= 17) {
      return { 
        phase: "Ovulation Phase", 
        symptoms: "Peak energy, confidence high, great for important tasks",
        biologicalState: "Estrogen peaks alongside a brief surge in testosterone and luteinizing hormone",
        expectedBehavior: "Peak physical strength, high sociability, vibrant energy, and maximum stamina"
      };
    } else {
      return { 
        phase: "Luteal Phase", 
        symptoms: "Energy declining, focus on completing tasks, self-reflection",
        biologicalState: "Progesterone rises and then plummets sharply right before the cycle ends",
        expectedBehavior: "Gradual decline in energy, potential brain fog, cravings, mood sensitivity, and pre-period headaches or fatigue"
      };
    }
  };

  const currentPhase = getCurrentPhase();
  const daysUntilNext = active ? averageCycle - (daysBetween(active.startDate) + 1) : 0;

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date falls within any cycle
      const cycleForDay = cycles.find(cycle => {
        const start = new Date(cycle.startDate);
        const end = cycle.endDate ? new Date(cycle.endDate) : new Date();
        return date >= start && date <= end;
      });
      
      days.push({
        date: dateStr,
        day,
        inCycle: !!cycleForDay,
        cycle: cycleForDay,
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleCalendarClick = async (day: any) => {
    if (!day) return;
    
    if (isCalendarEditable) {
      // If calendar is editable, clicking a date sets it as cycle start
      await HealthRepository.startCycle({
        startDate: day.date,
        endDate: null,
        symptoms: form.symptoms || undefined,
        flow: Number(form.flow),
      });
      setIsCalendarEditable(false);
    } else {
      // Otherwise just update the form
      setForm({ ...form, startDate: day.date });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Phase Info */}
      {active && (
        <div className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Current Phase</p>
              <p className="font-serif text-lg text-[#6B2D3A]">{currentPhase.phase}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Cycle Day</p>
              <p className="font-mono text-lg text-[#1A1817]">{daysBetween(active.startDate) + 1}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Biological State</p>
              <p className="text-xs text-[#6B2D3A]">{currentPhase.biologicalState}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">What to Expect</p>
              <p className="text-xs text-[#6B2D3A]">{currentPhase.expectedBehavior}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Average cycle" value={`${averageCycle} days`} hint={gaps.length ? `from ${gaps.length} cycles` : "assumed until tracked"} />
        <StatTile
          label="Next expected"
          value={active && daysUntilNext > 0 ? `${daysUntilNext} days` : "—"}
          hint={active ? formatDate(addDays(active.startDate, averageCycle)) : undefined}
        />
      </div>

      {/* Calendar View */}
      <Section title="Cycle Calendar">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
            className="px-1.5 py-0.5 rounded border border-[#EAE3DE] bg-[#FFFCFA] text-[#8C7B75] hover:border-[#D9B7BE] cursor-pointer text-xs"
          >
            ←
          </button>
          <p className="font-serif text-xs text-[#1A1817]">
            {selectedMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
          </p>
          <button
            type="button"
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
            className="px-1.5 py-0.5 rounded border border-[#EAE3DE] bg-[#FFFCFA] text-[#8C7B75] hover:border-[#D9B7BE] cursor-pointer text-xs"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <p key={day} className="text-center text-[8px] font-medium text-[#8C7B75]">{day}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 max-w-xs mx-auto">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded flex items-center justify-center text-[10px] cursor-pointer transition-colors ${
                day
                  ? day.inCycle
                    ? 'bg-[#6B2D3A] text-white'
                    : isCalendarEditable
                    ? 'bg-[#F2E8EA] border border-[#D9B7BE] text-[#1A1817] hover:bg-[#6B2D3A] hover:text-white'
                    : 'bg-[#FFFCFA] border border-[#EAE3DE] text-[#1A1817] hover:border-[#D9B7BE]'
                  : 'bg-transparent'
              }`}
              onClick={() => handleCalendarClick(day)}
            >
              {day?.day || ''}
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[9px] text-[#8C7B75]">
            {isCalendarEditable ? "Click a date to log cycle start" : "Click 'Log Cycle' to enable calendar editing"}
          </p>
          <Button 
            size="sm" 
            variant={isCalendarEditable ? "rose" : "ghost"}
            onClick={() => setIsCalendarEditable(!isCalendarEditable)}
          >
            {isCalendarEditable ? "Cancel" : "Log Cycle"}
          </Button>
        </div>
      </Section>

      <Section title="Cycle History">
        {active && (
          <div className="flex items-center justify-between rounded-2xl border border-[#D9B7BE]/50 bg-[#F2E8EA] p-4 mb-4">
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
