import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrendChart } from "@/components/ui/TrendChart";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { LibraryRepository } from "@/repositories/libraryRepository";
import { db } from "@/db/dexie";
import type { BookStatus } from "@/types/modules";
import { formatDate, formatShortDate, lastNDays, relativeDay, today } from "@/utils/date";
import { average, percent } from "@/utils/format";

const TABS = [
  { id: "current", label: "Currently reading" },
  { id: "finished", label: "Finished" },
  { id: "waiting", label: "Waiting room" },
  { id: "analytics", label: "Analytics" },
];

export default function LibraryPage() {
  const [tab, setTab] = useState("current");
  const snapshot = useFeySnapshot();

  const reading = snapshot.books.filter((book) => book.status === "reading");
  const finished = snapshot.books.filter((book) => book.status === "finished");
  const waiting = snapshot.books.filter((book) => book.status === "waiting");
  const pagesRead = snapshot.readingSessions.reduce((sum, session) => sum + session.pagesRead, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reading Life"
        title="Library"
        description="What I am reading, what I have finished, and the sequels I am waiting for."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Reading" value={reading.length} tone="burgundy" />
        <StatTile label="Finished" value={finished.length} />
        <StatTile label="Waiting room" value={waiting.length} />
        <StatTile label="Pages read" value={pagesRead} hint={`${snapshot.readingSessions.length} sessions`} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "current" && <CurrentTab />}
      {tab === "finished" && <FinishedTab />}
      {tab === "waiting" && <WaitingRoomTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

function AddBookForm({ status }: { status: BookStatus }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    totalPages: "",
    seriesName: "",
    sequelTo: "",
    expectedReleaseDate: "",
  });

  return (
    <InlineForm
      title={status === "waiting" ? "Add to waiting room" : "Add a book"}
      onSubmit={async () => {
        if (!form.title) return;
        await LibraryRepository.addBook({
          title: form.title,
          author: form.author,
          totalPages: Number(form.totalPages) || 0,
          currentPage: 0,
          status,
          startedAt: status === "reading" ? today() : undefined,
          finishedAt: null,
          seriesName: form.seriesName || undefined,
          sequelTo: form.sequelTo || undefined,
          expectedReleaseDate: form.expectedReleaseDate || undefined,
        });
        setForm({ title: "", author: "", totalPages: "", seriesName: "", sequelTo: "", expectedReleaseDate: "" });
      }}
    >
      <Field label="Title">
        <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>
      <Field label="Author">
        <TextInput value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      </Field>
      <Field label="Total pages">
        <TextInput type="number" min="0" value={form.totalPages} onChange={(e) => setForm({ ...form, totalPages: e.target.value })} />
      </Field>
      <Field label="Series">
        <TextInput value={form.seriesName} onChange={(e) => setForm({ ...form, seriesName: e.target.value })} />
      </Field>
      {status === "waiting" && (
        <>
          <Field label="Sequel to" hint="Optional - which book is this a sequel to?">
            <TextInput value={form.sequelTo} onChange={(e) => setForm({ ...form, sequelTo: e.target.value })} />
          </Field>
          <Field label="Expected release" className="sm:col-span-2">
            <TextInput
              type="date"
              value={form.expectedReleaseDate}
              onChange={(e) => setForm({ ...form, expectedReleaseDate: e.target.value })}
            />
          </Field>
        </>
      )}
    </InlineForm>
  );
}

function CurrentTab() {
  const snapshot = useFeySnapshot();
  const reading = snapshot.books.filter((book) => book.status === "reading");
  const [newQuote, setNewQuote] = useState<Record<number, string>>({});
  const [newFootnote, setNewFootnote] = useState<Record<number, string>>({});
  const [expandedBook, setExpandedBook] = useState<number | null>(null);

  const addQuote = async (bookId: number) => {
    const quote = newQuote[bookId];
    if (!quote) return;
    const book = await db.books.get(bookId);
    if (book) {
      await db.books.update(bookId, {
        quotes: [...(book.quotes || []), quote],
      });
      setNewQuote({ ...newQuote, [bookId]: "" });
    }
  };

  const addFootnote = async (bookId: number) => {
    const footnote = newFootnote[bookId];
    if (!footnote) return;
    const book = await db.books.get(bookId);
    if (book) {
      await db.books.update(bookId, {
        footnotes: [...(book.footnotes || []), footnote],
      });
      setNewFootnote({ ...newFootnote, [bookId]: "" });
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Currently reading" subtitle="Track your progress and save favorite quotes">
        <AddBookForm status="reading" />

        <div className="space-y-3">
          {reading.length === 0 && <EmptyState title="Nothing in progress" hint="Add a book to start tracking." />}
          {reading.map((book) => (
            <ListRow
              key={book.id}
              title={book.title}
              subtitle={`${book.author}${book.seriesName ? ` · ${book.seriesName}` : ""}`}
              meta={`${book.currentPage} / ${book.totalPages}`}
            >
              <div className="space-y-3">
                <ProgressBar value={percent(book.currentPage, book.totalPages)} caption={`${percent(book.currentPage, book.totalPages)}%`} />
                
                {/* Expand/Collapse for quotes and footnotes */}
                <button
                  type="button"
                  onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}
                  className="w-full py-2 rounded-xl border border-[#EAE3DE] bg-[#FFFCFA] text-[#6B2D3A] hover:bg-[#F2E8EA] transition-colors text-sm font-medium cursor-pointer"
                >
                  {expandedBook === book.id ? "Hide Notes" : "Add Quotes & Footnotes"}
                </button>

                {expandedBook === book.id && (
                  <div className="space-y-3 mt-3">
                    {/* Add Quote */}
                    <div className="flex gap-2">
                      <TextInput
                        placeholder="Add a favorite quote..."
                        value={newQuote[book.id!] ?? ""}
                        onChange={(e) => setNewQuote({ ...newQuote, [book.id!]: e.target.value })}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => addQuote(book.id!)}>Add</Button>
                    </div>
                    
                    {/* Display Quotes */}
                    {book.quotes && book.quotes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">Saved Quotes</p>
                        {book.quotes.map((quote, idx) => (
                          <div key={idx} className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-xl p-3 text-sm italic text-[#6B2D3A]">
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Footnote */}
                    <div className="flex gap-2">
                      <TextInput
                        placeholder="Add a footnote (chapter, notes)..."
                        value={newFootnote[book.id!] ?? ""}
                        onChange={(e) => setNewFootnote({ ...newFootnote, [book.id!]: e.target.value })}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => addFootnote(book.id!)}>Add</Button>
                    </div>

                    {/* Display Footnotes */}
                    {book.footnotes && book.footnotes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">Saved Footnotes</p>
                        {book.footnotes.map((footnote, idx) => (
                          <div key={idx} className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-xl p-3 text-sm text-[#1A1817]">
                            {footnote}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => void LibraryRepository.finishBook(book.id!)}>
                    Mark finished
                  </Button>
                </div>
              </div>
            </ListRow>
          ))}
        </div>
      </Section>
    </div>
  );
}

function FinishedTab() {
  const snapshot = useFeySnapshot();
  const finished = [...snapshot.books]
    .filter((book) => book.status === "finished")
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

  return (
    <Section title="Finished" subtitle="Rate them so the analytics mean something later">
      <div className="space-y-2">
        {finished.length === 0 && <EmptyState title="No finished books yet" />}
        {finished.map((book) => (
          <ListRow
            key={book.id}
            title={book.title}
            subtitle={`${book.author} · ${book.totalPages} pages`}
            meta={book.finishedAt ? formatDate(book.finishedAt) : undefined}
            actions={
              <Select
                value={String(book.rating ?? "")}
                onChange={(e) => void LibraryRepository.rateBook(book.id!, Number(e.target.value))}
                className="w-24 py-1 text-xs"
              >
                <option value="">Rate</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} ★
                  </option>
                ))}
              </Select>
            }
          />
        ))}
      </div>
    </Section>
  );
}

function WaitingRoomTab() {
  const snapshot = useFeySnapshot();
  const waiting = [...snapshot.books]
    .filter((book) => book.status === "waiting")
    .sort((a, b) => (a.expectedReleaseDate ?? "9999").localeCompare(b.expectedReleaseDate ?? "9999"));

  return (
    <Section title="Waiting room" subtitle="Sequels that have not been released yet, with their release dates">
      <AddBookForm status="waiting" />

      <div className="space-y-2">
        {waiting.length === 0 && <EmptyState title="Waiting room is empty" hint="Add a book whose sequel is still to come." />}
        {waiting.map((book) => {
          const released = Boolean(book.expectedReleaseDate && book.expectedReleaseDate <= today());
          return (
            <ListRow
              key={book.id}
              title={book.title}
              subtitle={`${book.author}${book.seriesName ? ` · ${book.seriesName}` : ""}`}
              meta={
                book.expectedReleaseDate
                  ? `${formatDate(book.expectedReleaseDate)} · ${relativeDay(book.expectedReleaseDate)}`
                  : "Release date unknown"
              }
              actions={
                released && (
                  <Button size="sm" onClick={() => void LibraryRepository.startWaitingBook(book.id!)}>
                    Out now — start reading
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

function AnalyticsTab() {
  const snapshot = useFeySnapshot();
  const finished = snapshot.books.filter((book) => book.status === "finished");

  const pagesPerDay = lastNDays(14).map((date) => ({
    label: formatShortDate(date),
    value: snapshot.readingSessions.filter((session) => session.date === date).reduce((sum, s) => sum + s.pagesRead, 0),
  }));

  const ratings = finished.map((book) => book.rating).filter((rating): rating is number => Boolean(rating));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Pages / day"
          value={Math.round(average(pagesPerDay.map((point) => point.value)))}
          hint="Last 14 days"
        />
        <StatTile label="Average rating" value={ratings.length ? average(ratings).toFixed(1) : "—"} />
        <StatTile
          label="Longest book"
          value={finished.length ? Math.max(...finished.map((book) => book.totalPages)) : "—"}
          hint="pages"
        />
        <StatTile label="Sessions" value={snapshot.readingSessions.length} />
      </div>

      <Section title="Pages read per day">
        <TrendChart data={pagesPerDay} kind="bar" emptyLabel="Log a reading session to build this chart" />
      </Section>
    </div>
  );
}
