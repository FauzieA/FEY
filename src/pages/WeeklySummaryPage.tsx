import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { ChevronLeft, Calendar } from "lucide-react";
import WeeklyCard from "@/components/history/WeeklyCard";

// Helper type extension for safe optional property checks
type SessionLog = typeof db.sessions extends { toArray: () => Promise<infer U> }
  ? U extends Array<infer S>
    ? S & { sessionType?: string; name?: string }
    : any
  : any;

function getWeekInfo(dateInput: Date | string) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  const monday = new Date(dateInput);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const formatOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const label = `${monday.toLocaleDateString(
    undefined,
    formatOpts
  )} – ${sunday.toLocaleDateString(undefined, formatOpts)}`;

  return { weekKey: `${d.getFullYear()}-W${weekNo}`, label, monday };
}

export default function WeeklySummaryPage() {
  const navigate = useNavigate();
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(
    null
  );

  // Query all completed sessions from IndexedDB and safely type cast
  const rawSessions = useLiveQuery(() => db.sessions.toArray()) || [];
  const sessions = rawSessions as SessionLog[];

  // Group sessions by week dynamically
  const groupedWeeks = useMemo(() => {
    const map: Record<
      string,
      {
        weekKey: string;
        label: string;
        mondayDate: Date;
        sessions: SessionLog[];
      }
    > = {};

    const sorted = [...sessions].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    sorted.forEach((session) => {
      const { weekKey, label, monday } = getWeekInfo(session.completedAt);
      if (!map[weekKey]) {
        map[weekKey] = {
          weekKey,
          label,
          mondayDate: monday,
          sessions: [],
        };
      }
      map[weekKey].sessions.push(session);
    });

    return Object.values(map);
  }, [sessions]);

  useEffect(() => {
    if (groupedWeeks.length > 0 && !expandedWeek) {
      setExpandedWeek(groupedWeeks[0].weekKey);
    }
  }, [groupedWeeks, expandedWeek]);

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-serif text-[#1A1817]">
            History & Weekly Logs
          </h1>
          <p className="text-[11px] text-[#8C7B75] italic">
            Weekly summaries & daily breakdown
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Empty State */}
      {groupedWeeks.length === 0 ? (
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#8C7B75] mx-auto opacity-60" />
          <h3 className="font-serif font-bold text-lg text-[#1A1817]">
            No Workouts Logged Yet
          </h3>
          <p className="text-xs text-[#8C7B75] max-w-sm mx-auto">
            Complete sessions from your Dashboard or Workout Hub to start building your history timeline!
          </p>
        </div>
      ) : (
        /* Weekly Summary Timeline */
        <div className="space-y-4">
          {groupedWeeks.map((week) => {
            const isExpanded = expandedWeek === week.weekKey;

            return (
              <WeeklyCard
                key={week.weekKey}
                week={week}
                isExpanded={isExpanded}
                onToggle={() =>
                  setExpandedWeek(isExpanded ? null : week.weekKey)
                }
                selectedDayDetail={selectedDayDetail}
                onSelectDayDetail={setSelectedDayDetail}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}