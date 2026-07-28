import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, CheckRow, Select, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { FaithRepository } from "@/repositories/faithRepository";
import { PRAYER_NAMES, type MemorizationStatus, type PrayerName } from "@/types/modules";
import { formatDate, today, weekdayLabel, weekDates, currentStreak, relativeDay } from "@/utils/date";
import { titleCase } from "@/utils/format";

const TABS = [
  { id: "prayer", label: "Prayer" },
  { id: "quran", label: "Qur'an" },
  { id: "adhkar", label: "Adhkar" },
  { id: "fasts", label: "Fasts" },
];

export default function FaithPage() {
  const [tab, setTab] = useState("prayer");
  const snapshot = useFeySnapshot();
  const todayIso = today();

  const prayerToday = snapshot.prayerLogs.find((log) => log.date === todayIso);
  const prayedToday = PRAYER_NAMES.filter((name) => prayerToday?.prayers?.[name]).length;
  const completeDays = snapshot.prayerLogs
    .filter((log) => PRAYER_NAMES.every((name) => log.prayers?.[name]))
    .map((log) => log.date);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Worship & Consistency"
        title="Faith"
        description="Prayer, Qur'an reading, memorization, revision, adhkar and the fasts I still owe."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Prayers today" value={`${prayedToday} / 5`} tone="burgundy" />
        <StatTile label="Complete-day streak" value={currentStreak(completeDays)} hint="All five prayers" />
        <StatTile label="Memorized" value={snapshot.memorization.filter((m) => m.status === "memorized").length} hint="Passages" />
        <StatTile
          label="Fasts owed"
          value={snapshot.missedFasts.filter((f) => !f.madeUpOn).length}
          tone={snapshot.missedFasts.some((f) => !f.madeUpOn) ? "gold" : "default"}
        />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "prayer" && <PrayerTab />}
      {tab === "quran" && <QuranTab />}
      {tab === "adhkar" && <AdhkarTab />}
      {tab === "fasts" && <FastsTab />}
    </div>
  );
}

/* --------------------------------- Prayer --------------------------------- */

function PrayerTab() {
  const snapshot = useFeySnapshot();
  const todayIso = today();
  const log = snapshot.prayerLogs.find((entry) => entry.date === todayIso);

  return (
    <div className="space-y-6">
      <Section title="Today" subtitle={formatDate(todayIso)}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRAYER_NAMES.map((name) => (
            <CheckRow
              key={name}
              label={titleCase(name)}
              checked={Boolean(log?.prayers?.[name])}
              onChange={() => void FaithRepository.togglePrayer(todayIso, name as PrayerName)}
            />
          ))}
        </div>
      </Section>

      <Section title="This week">
        <div className="overflow-x-auto rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
          <table className="w-full min-w-[420px] text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-[#8C7B75]">
                <th className="p-1 text-left font-bold">Prayer</th>
                {weekDates().map((date) => (
                  <th key={date} className="p-1 font-bold">
                    {weekdayLabel(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRAYER_NAMES.map((name) => (
                <tr key={name} className="border-t border-[#EAE3DE]/70">
                  <td className="p-1.5 font-serif text-[#1A1817]">{titleCase(name)}</td>
                  {weekDates().map((date) => {
                    const done = snapshot.prayerLogs.find((entry) => entry.date === date)?.prayers?.[name];
                    return (
                      <td key={date} className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => void FaithRepository.togglePrayer(date, name as PrayerName)}
                          className={`h-5 w-5 rounded-full border transition-colors ${
                            done ? "border-[#6B2D3A] bg-[#6B2D3A]" : "border-[#EAE3DE] bg-[#F8F5F2] hover:border-[#D9B7BE]"
                          }`}
                          aria-label={`${name} on ${date}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* ---------------------------------- Qur'an -------------------------------- */

function QuranTab() {
  const snapshot = useFeySnapshot();
  const [reading, setReading] = useState({ date: today(), surah: "", fromAyah: "1", toAyah: "", pages: "", reflection: "" });
  const [memo, setMemo] = useState({ surah: "", fromAyah: "1", toAyah: "", status: "learning" as MemorizationStatus });
  const [revision, setRevision] = useState({ date: today(), surah: "", quality: "4", notes: "" });

  const totalPages = snapshot.quranReading.reduce((sum, entry) => sum + (entry.pages ?? 0), 0);
  const dueRevision = [...snapshot.memorization]
    .filter((entry) => entry.status !== "learning")
    .sort((a, b) => (a.lastReviewedAt ?? "").localeCompare(b.lastReviewedAt ?? ""))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Reading sessions" value={snapshot.quranReading.length} />
        <StatTile label="Pages read" value={totalPages} />
        <StatTile label="Revisions" value={snapshot.revisions.length} />
        <StatTile label="In progress" value={snapshot.memorization.filter((m) => m.status !== "memorized").length} />
      </div>

      <Section title="Reading" subtitle="Log what I read and what struck me">
        <InlineForm
          title="Log reading session"
          onSubmit={async () => {
            if (!reading.surah || !reading.toAyah) return;
            await FaithRepository.logQuranReading({
              date: reading.date,
              surah: reading.surah,
              fromAyah: Number(reading.fromAyah) || 1,
              toAyah: Number(reading.toAyah),
              pages: reading.pages ? Number(reading.pages) : undefined,
              reflection: reading.reflection || undefined,
            });
            setReading({ date: today(), surah: "", fromAyah: "1", toAyah: "", pages: "", reflection: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={reading.date} onChange={(e) => setReading({ ...reading, date: e.target.value })} />
          </Field>
          <Field label="Surah">
            <TextInput value={reading.surah} placeholder="Al-Baqarah" onChange={(e) => setReading({ ...reading, surah: e.target.value })} />
          </Field>
          <Field label="From ayah">
            <TextInput type="number" min="1" value={reading.fromAyah} onChange={(e) => setReading({ ...reading, fromAyah: e.target.value })} />
          </Field>
          <Field label="To ayah">
            <TextInput type="number" min="1" value={reading.toAyah} onChange={(e) => setReading({ ...reading, toAyah: e.target.value })} />
          </Field>
          <Field label="Pages">
            <TextInput type="number" min="0" value={reading.pages} onChange={(e) => setReading({ ...reading, pages: e.target.value })} />
          </Field>
          <Field label="Reflection" className="sm:col-span-2">
            <TextArea value={reading.reflection} onChange={(e) => setReading({ ...reading, reflection: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {snapshot.quranReading.length === 0 && <EmptyState title="No reading logged yet" hint="Start with a single page." />}
          {[...snapshot.quranReading]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 6)
            .map((entry) => (
              <ListRow
                key={entry.id}
                title={`${entry.surah} ${entry.fromAyah}–${entry.toAyah}`}
                subtitle={entry.reflection}
                meta={formatDate(entry.date)}
              />
            ))}
        </div>
      </Section>

      <Section title="Memorization" subtitle="Hifdh in progress and secured">
        <InlineForm
          title="Add passage"
          onSubmit={async () => {
            if (!memo.surah || !memo.toAyah) return;
            await FaithRepository.addMemorization({
              surah: memo.surah,
              fromAyah: Number(memo.fromAyah) || 1,
              toAyah: Number(memo.toAyah),
              status: memo.status,
              startedAt: today(),
            });
            setMemo({ surah: "", fromAyah: "1", toAyah: "", status: "learning" });
          }}
        >
          <Field label="Surah">
            <TextInput value={memo.surah} placeholder="An-Naba" onChange={(e) => setMemo({ ...memo, surah: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={memo.status} onChange={(e) => setMemo({ ...memo, status: e.target.value as MemorizationStatus })}>
              <option value="learning">Learning</option>
              <option value="needs-work">Needs work</option>
              <option value="memorized">Memorized</option>
            </Select>
          </Field>
          <Field label="From ayah">
            <TextInput type="number" min="1" value={memo.fromAyah} onChange={(e) => setMemo({ ...memo, fromAyah: e.target.value })} />
          </Field>
          <Field label="To ayah">
            <TextInput type="number" min="1" value={memo.toAyah} onChange={(e) => setMemo({ ...memo, toAyah: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {snapshot.memorization.length === 0 && <EmptyState title="No passages tracked yet" />}
          {snapshot.memorization.map((entry) => (
            <ListRow
              key={entry.id}
              title={`${entry.surah} ${entry.fromAyah}–${entry.toAyah}`}
              subtitle={`Started ${formatDate(entry.startedAt)}${entry.lastReviewedAt ? ` · reviewed ${relativeDay(entry.lastReviewedAt)}` : ""}`}
              actions={
                <Select
                  value={entry.status}
                  onChange={(e) => void FaithRepository.setMemorizationStatus(entry.id!, e.target.value as MemorizationStatus)}
                  className="w-36 py-1 text-xs"
                >
                  <option value="learning">Learning</option>
                  <option value="needs-work">Needs work</option>
                  <option value="memorized">Memorized</option>
                </Select>
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Revision" subtitle="Oldest reviews first — these need attention">
        {dueRevision.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dueRevision.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setRevision({ ...revision, surah: entry.surah })}
                className="rounded-full border border-[#D9B7BE]/60 bg-[#F2E8EA] px-3 py-1 text-xs text-[#6B2D3A]"
              >
                {entry.surah} · {entry.lastReviewedAt ? relativeDay(entry.lastReviewedAt) : "never revised"}
              </button>
            ))}
          </div>
        )}

        <InlineForm
          title="Log revision"
          onSubmit={async () => {
            if (!revision.surah) return;
            await FaithRepository.logRevision({
              date: revision.date,
              surah: revision.surah,
              quality: Number(revision.quality),
              notes: revision.notes || undefined,
            });
            setRevision({ date: today(), surah: "", quality: "4", notes: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={revision.date} onChange={(e) => setRevision({ ...revision, date: e.target.value })} />
          </Field>
          <Field label="Surah">
            <TextInput value={revision.surah} onChange={(e) => setRevision({ ...revision, surah: e.target.value })} />
          </Field>
          <Field label="Recall quality" hint="1 shaky · 5 solid">
            <Select value={revision.quality} onChange={(e) => setRevision({ ...revision, quality: e.target.value })}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes">
            <TextInput value={revision.notes} onChange={(e) => setRevision({ ...revision, notes: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {snapshot.revisions.length === 0 && <EmptyState title="No revisions logged yet" />}
          {[...snapshot.revisions]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 6)
            .map((entry) => (
              <ListRow key={entry.id} title={entry.surah} subtitle={entry.notes} meta={`${entry.quality}/5 · ${formatDate(entry.date)}`} />
            ))}
        </div>
      </Section>
    </div>
  );
}

/* --------------------------------- Adhkar --------------------------------- */

function AdhkarTab() {
  const snapshot = useFeySnapshot();
  const todayIso = today();
  const log = snapshot.adhkarLogs.find((entry) => entry.date === todayIso);

  return (
    <div className="space-y-6">
      <Section title="Today" subtitle={formatDate(todayIso)}>
        <div className="grid gap-2 sm:grid-cols-3">
          <CheckRow
            label="Morning adhkar"
            checked={Boolean(log?.morning)}
            onChange={() => void FaithRepository.toggleAdhkar(todayIso, "morning")}
          />
          <CheckRow
            label="Evening adhkar"
            checked={Boolean(log?.evening)}
            onChange={() => void FaithRepository.toggleAdhkar(todayIso, "evening")}
          />
          <CheckRow
            label="After-prayer adhkar"
            checked={Boolean(log?.afterPrayer)}
            onChange={() => void FaithRepository.toggleAdhkar(todayIso, "afterPrayer")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
          <div className="mr-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Istighfar today</p>
            <p className="font-serif text-2xl text-[#1A1817]">{log?.istighfarCount ?? 0}</p>
          </div>
          {[10, 33, 100].map((count) => (
            <Button key={count} size="sm" variant="rose" onClick={() => void FaithRepository.addIstighfar(todayIso, count)}>
              +{count}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="This week">
        <div className="grid grid-cols-7 gap-2">
          {weekDates().map((date) => {
            const entry = snapshot.adhkarLogs.find((item) => item.date === date);
            const score = [entry?.morning, entry?.evening, entry?.afterPrayer].filter(Boolean).length;
            return (
              <div key={date} className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-2 text-center">
                <span className="block text-[10px] uppercase tracking-widest text-[#8C7B75]">{weekdayLabel(date)}</span>
                <span className="font-serif text-lg text-[#6B2D3A]">{score}/3</span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ---------------------------------- Fasts --------------------------------- */

function FastsTab() {
  const snapshot = useFeySnapshot();
  const [form, setForm] = useState({ missedOn: today(), reason: "" });

  const outstanding = snapshot.missedFasts.filter((fast) => !fast.madeUpOn);
  const madeUp = snapshot.missedFasts.filter((fast) => fast.madeUpOn);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Outstanding" value={outstanding.length} tone={outstanding.length ? "gold" : "default"} />
        <StatTile label="Made up" value={madeUp.length} />
      </div>

      <Section title="Missed fasts">
        <InlineForm
          title="Record a missed fast"
          onSubmit={async () => {
            await FaithRepository.addMissedFast({ missedOn: form.missedOn, reason: form.reason || undefined, madeUpOn: null });
            setForm({ missedOn: today(), reason: "" });
          }}
        >
          <Field label="Missed on">
            <TextInput type="date" value={form.missedOn} onChange={(e) => setForm({ ...form, missedOn: e.target.value })} />
          </Field>
          <Field label="Reason">
            <TextInput value={form.reason} placeholder="Travel, illness, cycle…" onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {snapshot.missedFasts.length === 0 && <EmptyState title="Nothing owed" hint="Missed fasts you record show up here until made up." />}
          {[...snapshot.missedFasts]
            .sort((a, b) => b.missedOn.localeCompare(a.missedOn))
            .map((fast) => (
              <ListRow
                key={fast.id}
                title={formatDate(fast.missedOn)}
                subtitle={fast.reason}
                meta={fast.madeUpOn ? `Made up ${formatDate(fast.madeUpOn)}` : undefined}
                actions={
                  !fast.madeUpOn && (
                    <Button size="sm" variant="rose" onClick={() => void FaithRepository.markFastMadeUp(fast.id!)}>
                      Mark made up
                    </Button>
                  )
                }
              />
            ))}
        </div>
      </Section>
    </div>
  );
}
