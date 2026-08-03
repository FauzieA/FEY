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
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<{ id?: number; startDate: string; endDate?: string } | null>(null);
  const [editForm, setEditForm] = useState({ startDate: "", endDate: "" });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [endDate, setEndDate] = useState(today());
  
  const cycles = [...snapshot.cycleLogs].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const active = cycles.find((cycle) => !cycle.endDate);

  // Calculate average cycle length
  const gaps = cycles
    .slice(0, 6)
    .map((cycle, index, list) => (index + 1 < list.length ? daysBetween(list[index + 1].startDate, cycle.startDate) : null))
    .filter((gap): gap is number => gap !== null && gap > 20 && gap < 45);
  const averageCycle = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28;

  // Get cycle insights - always show based on most recent period
  const mostRecentPeriod = cycles[0];
  const insights = mostRecentPeriod ? {
    cycleDay: daysBetween(mostRecentPeriod.startDate) + 1,
    daysUntilNext: averageCycle - (daysBetween(mostRecentPeriod.startDate) + 1),
    averageCycleLength: averageCycle,
    currentPhase: getCurrentPhase(daysBetween(mostRecentPeriod.startDate) + 1, averageCycle),
    isOvulation: daysBetween(mostRecentPeriod.startDate) + 1 >= 14 && daysBetween(mostRecentPeriod.startDate) + 1 <= 17,
    isMenstruation: daysBetween(mostRecentPeriod.startDate) + 1 <= 5
  } : {
    cycleDay: 0,
    daysUntilNext: 0,
    averageCycleLength: averageCycle,
    currentPhase: null,
    isOvulation: false,
    isMenstruation: false
  };

  // Calculate current cycle day based on most recent period, even if period ended
  const currentCycleDay = mostRecentPeriod ? daysBetween(mostRecentPeriod.startDate) + 1 : 0;
  const currentPhase = currentCycleDay > 0 ? getCurrentPhase(currentCycleDay, averageCycle) : null;

  function getCurrentPhase(day: number, cycleLength: number) {
    const normalizedDay = ((day - 1) % cycleLength) + 1;
    const lutealEnd = cycleLength;

    if (normalizedDay >= 1 && normalizedDay <= 5) {
      return {
        name: "Menstrual Phase",
        biologicalState: "Estrogen and progesterone are at their lowest baseline",
        expectedBehavior: "Lower physical energy, possible cramps, muscle aches, and a natural instinct toward rest and reflection",
        symptoms: ["fatigue", "cramps", "muscle aches", "lower energy", "need for rest"]
      };
    } else if (normalizedDay >= 6 && normalizedDay <= 13) {
      return {
        name: "Follicular Phase",
        biologicalState: "Estrogen steadily rises, improving mood, focus, and brain plasticity",
        expectedBehavior: "Rising vitality, clearer mental focus, and expanding mental endurance",
        symptoms: ["rising energy", "better mood", "improved focus", "mental clarity"]
      };
    } else if (normalizedDay >= 14 && normalizedDay <= 17) {
      return {
        name: "Ovulation Phase",
        biologicalState: "Estrogen peaks alongside a brief surge in testosterone and luteinizing hormone",
        expectedBehavior: "Peak physical strength, high sociability, vibrant energy, and maximum stamina",
        symptoms: ["peak energy", "high confidence", "sociability", "vibrant energy"]
      };
    } else if (normalizedDay >= 18 && normalizedDay <= lutealEnd) {
      return {
        name: "Luteal Phase",
        biologicalState: "Progesterone rises and then plummets sharply right before the cycle ends",
        expectedBehavior: "Gradual decline in energy, potential brain fog, cravings, mood sensitivity, and pre-period headaches or fatigue",
        symptoms: ["declining energy", "brain fog", "cravings", "mood sensitivity", "headaches", "fatigue"]
      };
    }
    return null;
  }

  const handleDeleteCycle = async (id: number) => {
    if (confirm("Are you sure you want to delete this period entry?")) {
      await HealthRepository.removeCycle(id);
    }
  };

  const handleEndCycle = async (id: number, endDate: string) => {
    await HealthRepository.endCycle(id, endDate);
    setShowEndDatePicker(false);
  };

const handleEditCycle = (cycle: { id?: number; startDate: string; endDate?: string | null }) => {
    if (cycle.id === undefined) return;
    setEditingCycle({ id: cycle.id, startDate: cycle.startDate, endDate: cycle.endDate ?? undefined });
    setEditForm({ startDate: cycle.startDate, endDate: cycle.endDate || "" });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingCycle && editingCycle.id !== undefined) {
      await HealthRepository.updateCycle(editingCycle.id, editForm.startDate, editForm.endDate || undefined);
      setShowEditModal(false);
      setEditingCycle(null);
    }
  };

  // Generate compact calendar days
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
      
      // Check if this date falls within any period
      const periodForDay = cycles.find(cycle => {
        const start = new Date(cycle.startDate);
        const end = cycle.endDate ? new Date(cycle.endDate) : new Date();
        return date >= start && date <= end;
      });
      
      days.push({
        date: dateStr,
        day,
        inCycle: !!periodForDay,
        isToday: dateStr === today(),
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Current Phase Card - Always show if there's any period history */}
      {mostRecentPeriod && currentPhase && (
        <div className="bg-gradient-to-br from-[#6B2D3A] to-[#8B3D4A] rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA]">Current Phase</p>
              <p className="font-serif text-xl">{currentPhase.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA]">Cycle Day</p>
              <p className="font-mono text-2xl">{currentCycleDay}</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA] mb-1">Biological State</p>
              <p className="text-sm leading-relaxed">{currentPhase.biologicalState}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2E8EA] mb-1">What to Expect</p>
              <p className="text-sm leading-relaxed">{currentPhase.expectedBehavior}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentPhase.symptoms.map((symptom) => (
              <span key={symptom} className="px-3 py-1 bg-white/20 rounded-full text-xs">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Average cycle" value={`${insights.averageCycleLength} days`} hint={gaps.length ? `from ${gaps.length} periods` : "assumed until tracked"} />
        <StatTile
          label="Next expected"
          value={mostRecentPeriod && insights.daysUntilNext > 0 ? `${insights.daysUntilNext} days` : "—"}
          hint={mostRecentPeriod ? formatDate(addDays(mostRecentPeriod.startDate, insights.averageCycleLength)) : undefined}
        />
      </div>

      {/* Compact Calendar View */}
      <Section title="Period Calendar">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
            className="px-2 py-1 rounded border border-[#EAE3DE] bg-[#FFFCFA] text-[#8C7B75] hover:border-[#D9B7BE] cursor-pointer text-xs"
          >
            ←
          </button>
          <p className="font-serif text-xs text-[#1A1817]">
            {selectedMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
          </p>
          <button
            type="button"
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
            className="px-2 py-1 rounded border border-[#EAE3DE] bg-[#FFFCFA] text-[#8C7B75] hover:border-[#D9B7BE] cursor-pointer text-xs"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <p key={day} className="text-center text-[9px] font-medium text-[#8C7B75]">{day}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded flex items-center justify-center text-[11px] cursor-pointer transition-colors ${
                day
                  ? day.inCycle
                    ? 'bg-[#6B2D3A] text-white'
                    : day.isToday
                    ? 'bg-[#D9B7BE] text-white font-bold'
                    : 'bg-[#FFFCFA] border border-[#EAE3DE] text-[#1A1817] hover:border-[#D9B7BE]'
                  : 'bg-transparent'
              }`}
              onClick={() => day && setForm({ ...form, startDate: day.date })}
            >
              {day?.day || ''}
            </div>
          ))}
        </div>
      </Section>

      {/* Quick Log Section */}
      <Section title="Log Period">
        <InlineForm
          title="Start new period"
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
          <Field label="Flow intensity" hint="1 light · 5 heavy">
            <Select value={form.flow} onChange={(e) => setForm({ ...form, flow: e.target.value })}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Symptoms" className="sm:col-span-2">
            <TextInput value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Cramps, fatigue, etc." />
          </Field>
        </InlineForm>
      </Section>

      {/* Period History */}
      <Section title="Period History">
        {active && (
          <div className="flex items-center justify-between rounded-2xl border border-[#D9B7BE]/50 bg-[#F2E8EA] p-4 mb-4">
            <div>
              <p className="font-serif text-sm text-[#6B2D3A]">Period in progress</p>
              <p className="text-xs text-[#8C7B75]">Started {formatDate(active.startDate)} · Day {currentCycleDay}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowEndDatePicker(true)}>
                End period
              </Button>
              <Button size="sm" variant="ghost" onClick={() => active.id !== undefined && handleEditCycle(active)}>
                Edit
              </Button>
              <Button size="sm" variant="rose" onClick={() => active.id !== undefined && void handleDeleteCycle(active.id)}>
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {cycles.length === 0 && <EmptyState title="No periods tracked yet" hint="Log your first period to start tracking" />}
          {cycles.map((cycle) => {
            if (cycle.id === undefined) return null;
            return (
              <div key={cycle.id} className="flex items-center justify-between rounded-xl border border-[#EAE3DE] bg-[#FFFCFA] p-3">
                <div>
                  <p className="font-serif text-sm text-[#1A1817]">{formatDate(cycle.startDate)}</p>
                  <p className="text-xs text-[#8C7B75]">
                    {cycle.endDate ? `${daysBetween(cycle.startDate, cycle.endDate) + 1} days` : "ongoing"}
                    {cycle.symptoms && ` · ${cycle.symptoms}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEditCycle(cycle)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => cycle.id !== undefined && void handleDeleteCycle(cycle.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* End Date Picker Modal */}
      {showEndDatePicker && active && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-serif text-lg text-[#1A1817] mb-4">End Period</h3>
            <Field label="End date">
              <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="ghost" onClick={() => setShowEndDatePicker(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => active.id !== undefined && handleEndCycle(active.id, endDate)}>
                End Period
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Period Modal */}
      {showEditModal && editingCycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-serif text-lg text-[#1A1817] mb-4">Edit Period</h3>
            <Field label="Start date">
              <TextInput type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
            </Field>
            <Field label="End date (optional)">
              <TextInput type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
            </Field>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="ghost" onClick={() => { setShowEditModal(false); setEditingCycle(null); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
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
