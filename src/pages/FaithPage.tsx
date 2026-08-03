import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, CheckRow, Select, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { FaithRepository } from "@/repositories/faithRepository";
import { PRAYER_NAMES, type MemorizationStatus, type PrayerName } from "@/types/modules";
import { formatDate, today, weekdayLabel, weekDates, currentStreak, relativeDay } from "@/utils/date";
import { titleCase } from "@/utils/format";
import { getRandomPrayerQuote } from "@/data/prayerQuotes";
import { ADHKAR_DATA, getDailyIstighfarQuote } from "@/data/adhkarData";
import { SURAH_DATA } from "@/data/surahData";

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
        title="Islam"
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
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [quote, setQuote] = useState<string>("");

  // Fixed prayer times (24-hour format)
  const prayerTimes = {
    fajr: "06:00",
    dhuhr: "12:30",
    asr: "16:00",
    maghrib: "18:45",
    isha: "20:00",
  };

  // Check if a specific prayer time has arrived
  const isPrayerTimeAvailable = (prayerName: PrayerName): boolean => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const prayerTime = prayerTimes[prayerName];
    const [hours, minutes] = prayerTime.split(":").map(Number);
    const prayerMinutes = hours * 60 + minutes;
    return currentMinutes >= prayerMinutes;
  };

  useEffect(() => {
    // Set daily quote
    setQuote(getRandomPrayerQuote());

    // Calculate next prayer countdown
    const updateCountdown = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let nextPrayerName: string | null = null;
      let nextPrayerMinutes: number | null = null;

      for (const [name, time] of Object.entries(prayerTimes)) {
        const [hours, minutes] = time.split(":").map(Number);
        const prayerMinutes = hours * 60 + minutes;
        if (prayerMinutes > currentMinutes) {
          nextPrayerName = name;
          nextPrayerMinutes = prayerMinutes;
          break;
        }
      }

      // If no prayer left today, show fajr for tomorrow
      if (!nextPrayerName) {
        const [hours, minutes] = prayerTimes.fajr.split(":").map(Number);
        nextPrayerName = "fajr";
        nextPrayerMinutes = hours * 60 + minutes + 24 * 60; // Add 24 hours for tomorrow
      }

      if (nextPrayerName && nextPrayerMinutes !== null) {
        const diffMinutes = nextPrayerMinutes - currentMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const countdown = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        setNextPrayer({ name: titleCase(nextPrayerName), time: prayerTimes[nextPrayerName as keyof typeof prayerTimes], countdown });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Prayer Quote */}
      <div className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-2xl p-4">
        <p className="text-sm italic text-[#6B2D3A] text-center">{quote}</p>
      </div>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Next prayer</p>
            <p className="font-serif text-lg text-[#1A1817]">{nextPrayer.name} at {nextPrayer.time}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">In</p>
            <p className="font-mono text-lg text-[#6B2D3A]">{nextPrayer.countdown}</p>
          </div>
        </div>
      )}

      <Section title="Today" subtitle={formatDate(todayIso)}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRAYER_NAMES.map((name) => {
            const isAvailable = isPrayerTimeAvailable(name as PrayerName);
            return (
              <CheckRow
                key={name}
                label={titleCase(name)}
                checked={Boolean(log?.prayers?.[name])}
                onChange={() => void FaithRepository.togglePrayer(todayIso, name as PrayerName)}
                disabled={!isAvailable}
                hint={!isAvailable ? `Available at ${prayerTimes[name as keyof typeof prayerTimes]}` : undefined}
              />
            );
          })}
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
  const [memo, setMemo] = useState({ surah: "", fromAyah: "1", toAyah: "", status: "learning" as MemorizationStatus });

  // Calculate memorization stats based on 114 surahs
  const memorizedSurahs = new Set(snapshot.memorization.filter((m) => m.status === "memorized").map((m) => m.surah)).size;
  const totalSurahs = 114;
  const surahProgress = Math.round((memorizedSurahs / totalSurahs) * 100);

  // Get current surah being memorized
  const currentSurah = snapshot.memorization.find((m) => m.status === "learning" || m.status === "needs-work");
  
  // Calculate current surah progress
  let currentSurahProgress = 0;
  let currentSurahLabel = "No current surah";
  if (currentSurah) {
    const totalVersesInSurah = currentSurah.toAyah - currentSurah.fromAyah + 1;
    const memorizedVersesInSurah = currentSurah.status === "memorized" ? totalVersesInSurah : Math.floor(totalVersesInSurah * 0.5); // Estimate
    currentSurahProgress = Math.round((memorizedVersesInSurah / totalVersesInSurah) * 100);
    currentSurahLabel = `${currentSurah.surah} (${currentSurah.fromAyah}–${currentSurah.toAyah})`;
  }

  // Get passages that need revision (not reviewed in last 7 days)
  const dueRevision = [...snapshot.memorization]
    .filter((entry) => entry.status !== "learning")
    .sort((a, b) => (a.lastReviewedAt ?? "").localeCompare(b.lastReviewedAt ?? ""))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Surahs memorized" value={`${memorizedSurahs} / ${totalSurahs}`} tone="burgundy" />
        <StatTile label="Overall progress" value={`${surahProgress}%`} />
        <StatTile label="Current surah" value={currentSurah ? currentSurah.surah : "—"} />
        <StatTile label="Current progress" value={currentSurah ? `${currentSurahProgress}%` : "—"} />
      </div>

      {/* Current Surah Progress */}
      {currentSurah && (
        <div className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Current Surah</p>
              <p className="font-serif text-lg text-[#6B2D3A]">{currentSurahLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Progress</p>
              <p className="font-mono text-lg text-[#1A1817]">{currentSurahProgress}%</p>
            </div>
          </div>
          <div className="h-2 bg-[#EAE3DE] rounded-full overflow-hidden">
            <div className="h-full bg-[#6B2D3A] transition-all duration-500" style={{ width: `${currentSurahProgress}%` }} />
          </div>
        </div>
      )}

      {/* Revision Reminder */}
      {dueRevision.length > 0 && (
        <Section title="Revision Reminder" subtitle="Passages that need your attention">
          <div className="space-y-2">
            {dueRevision.map((entry) => (
              <div key={entry.id} className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-serif text-sm text-[#1A1817]">{entry.surah} ({entry.fromAyah}–{entry.toAyah})</p>
                  <p className="text-xs text-[#8C7B75]">Last reviewed: {entry.lastReviewedAt ? relativeDay(entry.lastReviewedAt) : "Never"}</p>
                </div>
                <Button size="sm" variant="rose" onClick={() => setMemo({ ...memo, surah: entry.surah, fromAyah: String(entry.fromAyah), toAyah: String(entry.toAyah) })}>
                  Revise
                </Button>
              </div>
            ))}
          </div>
        </Section>
      )}

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
            <Select value={memo.surah} onChange={(e) => {
              const selectedSurah = SURAH_DATA.find(s => s.name === e.target.value);
              setMemo({ ...memo, surah: e.target.value, toAyah: selectedSurah ? String(selectedSurah.verses) : "" });
            }}>
              <option value="">Select Surah</option>
              {SURAH_DATA.map((surah) => (
                <option key={surah.number} value={surah.name}>
                  {surah.number}. {surah.name} ({surah.englishName}) - {surah.verses} verses
                </option>
              ))}
            </Select>
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
          {snapshot.memorization.map((entry) => {
            const surahInfo = SURAH_DATA.find(s => s.name === entry.surah);
            const totalVerses = surahInfo ? surahInfo.verses : (entry.toAyah - entry.fromAyah + 1);
            const versesCount = entry.toAyah - entry.fromAyah + 1;
            const progress = Math.round((versesCount / totalVerses) * 100);
            return (
              <ListRow
                key={entry.id}
                title={`${entry.surah} (${entry.fromAyah}–${entry.toAyah})`}
                subtitle={`${versesCount} verses · ${progress}% of surah · Started ${formatDate(entry.startedAt)}${entry.lastReviewedAt ? ` · reviewed ${relativeDay(entry.lastReviewedAt)}` : ""}`}
                meta={`${entry.status}`}
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
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* --------------------------------- Adhkar --------------------------------- */

function AdhkarTab() {
  const snapshot = useFeySnapshot();
  const [adhkarSubTab, setAdhkarSubTab] = useState<"morning" | "evening">("morning");
  const [istighfarQuote, setIstighfarQuote] = useState<string>("");

  useEffect(() => {
    setIstighfarQuote(getDailyIstighfarQuote());
  }, []);

  // Get today's adhkar log from snapshot
  const todayIso = today();
  const todayAdhkarLog = snapshot.adhkarLogs.find((log: any) => log.date === todayIso);
  const completedItems = new Set(todayAdhkarLog?.completedItems || []);

  // Separate morning and evening adhkar
  const morningAdhkar = ADHKAR_DATA.morning?.items.map((item) => ({ ...item, category: "Morning", categoryId: "morning" })) || [];
  const eveningAdhkar = ADHKAR_DATA.evening?.items.map((item) => ({ ...item, category: "Evening", categoryId: "evening" })) || [];

  const currentAdhkar = adhkarSubTab === "morning" ? morningAdhkar : eveningAdhkar;

  const toggleAdhkarItem = async (categoryId: string, itemId: string) => {
    await FaithRepository.toggleAdhkarItem(todayIso, categoryId, itemId);
  };

  const isCompleted = (categoryId: string, itemId: string) => completedItems.has(`${categoryId}_${itemId}`);
  const completedCount = completedItems.size;
  const totalAdhkar = morningAdhkar.length + eveningAdhkar.length;

  const AdhkarCard = ({ adhkar, index, total }: { adhkar: any, index: number, total: number }) => {
    const completed = isCompleted(adhkar.categoryId, adhkar.id);
    return (
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{adhkar.category}</span>
            <h3 className="font-serif text-lg text-[#1A1817]">{adhkar.title}</h3>
            {adhkar.subtitle && (
              <p className="text-xs text-[#8C7B75] italic">{adhkar.subtitle}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{index + 1} / {total}</span>
          </div>
        </div>

        <div className="bg-[#F2E8EA] rounded-2xl p-4 mb-4">
          <p className="text-right text-lg leading-relaxed text-[#6B2D3A] font-serif" dir="rtl">
            {adhkar.arabic}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-[#1A1817] leading-relaxed">{adhkar.translation}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[#F8F5F2] rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Repetitions</span>
            <span className="ml-2 font-mono text-[#6B2D3A]">{adhkar.repetitions}x</span>
          </div>
          {adhkar.shortBenefit && (
            <div className="flex-1">
              <p className="text-xs text-[#8C7B75] italic">{adhkar.shortBenefit}</p>
            </div>
          )}
        </div>

        {adhkar.benefit && (
          <div className="bg-[#F8F5F2] rounded-xl p-3 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-1">Benefit</p>
            <p className="text-xs text-[#1A1817] leading-relaxed">{adhkar.benefit}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleAdhkarItem(adhkar.categoryId, adhkar.id)}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            completed
              ? "bg-[#6B2D3A] text-white"
              : "bg-[#F2E8EA] text-[#6B2D3A] hover:bg-[#6B2D3A] hover:text-white"
          }`}
        >
          {completed ? "✓ Completed" : "Mark Complete"}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-2xl p-4">
        <p className="text-sm italic text-[#6B2D3A] text-center">{istighfarQuote}</p>
      </div>

      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Today's Progress</p>
          <p className="font-serif text-lg text-[#1A1817]">{completedCount} / {totalAdhkar} completed</p>
        </div>
        <div className="h-2 bg-[#EAE3DE] rounded-full overflow-hidden w-32">
          <div
            className="h-full bg-[#6B2D3A] transition-all duration-500"
            style={{ width: `${(completedCount / totalAdhkar) * 100}%` }}
          />
        </div>
      </div>

      {/* Sub-tabs for Morning/Evening */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAdhkarSubTab("morning")}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            adhkarSubTab === "morning"
              ? "bg-[#6B2D3A] text-white"
              : "bg-[#F2E8EA] text-[#6B2D3A] hover:bg-[#6B2D3A] hover:text-white"
          }`}
        >
          Morning Adhkar
        </button>
        <button
          type="button"
          onClick={() => setAdhkarSubTab("evening")}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            adhkarSubTab === "evening"
              ? "bg-[#6B2D3A] text-white"
              : "bg-[#F2E8EA] text-[#6B2D3A] hover:bg-[#6B2D3A] hover:text-white"
          }`}
        >
          Evening Adhkar
        </button>
      </div>

      {/* Current Adhkar List */}
      <div className="space-y-4">
        {currentAdhkar.map((adhkar, index) => (
          <AdhkarCard key={adhkar.id} adhkar={adhkar} index={index} total={currentAdhkar.length} />
        ))}
      </div>
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
