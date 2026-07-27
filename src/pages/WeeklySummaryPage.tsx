import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import {
  ChevronLeft,
  Calendar,
  ChevronDown,
  Dumbbell,
  CheckCircle2,
  Layers,
  Repeat,
  Flame,
} from "lucide-react";

// Helper to get ISO week key (e.g. "2026-W18") and readable label
function getWeekInfo(dateInput: Date | string) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday: current date + 4 - current day number (Sunday = 7)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  // Get Monday of this week for display label
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
  const label = `${monday.toLocaleDateString(undefined, formatOpts)} – ${sunday.toLocaleDateString(undefined, formatOpts)}`;

  return { weekKey: `${d.getFullYear()}-W${weekNo}`, label, monday };
}

export default function WeeklySummaryPage() {
  const navigate = useNavigate();
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(
    null
  );

  // Query all completed sessions from IndexedDB
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  // Group sessions by week dynamically
  const groupedWeeks = useMemo(() => {
    const map: Record<
      string,
      {
        weekKey: string;
        label: string;
        mondayDate: Date;
        sessions: typeof sessions;
      }
    > = {};

    // Sort sessions newest first
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

  // Set default expanded week to latest on load
  useMemo(() => {
    if (groupedWeeks.length > 0 && !expandedWeek) {
      setExpandedWeek(groupedWeeks[0].weekKey);
    }
  }, [groupedWeeks]);

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

            // Calculate weekly totals
            let totalSets = 0;
            let totalReps = 0;
            let gymSessionCount = 0;
            let dailyHabitCount = 0;

            week.sessions.forEach((sess) => {
              const isDailySess = sess.sessionType === "daily";
              if (isDailySess) dailyHabitCount++;
              else gymSessionCount++;

              sess.exercises?.forEach((ex: any) => {
                ex.sets?.forEach((s: any) => {
                  totalSets++;
                  totalReps += Number(s.reps) || 0;
                });
              });
            });

            return (
              <div
                key={week.weekKey}
                className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl transition-all shadow-sm overflow-hidden"
              >
                {/* Weekly Card Header (Click to Toggle Drill-Down) */}
                <div
                  onClick={() =>
                    setExpandedWeek(isExpanded ? null : week.weekKey)
                  }
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F5F2]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
                        Week Log
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2E8EA] text-[#6B2D3A] font-bold">
                        {week.weekKey}
                      </span>
                    </div>
                    <h2 className="font-serif font-bold text-lg text-[#1A1817] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6B2D3A]" />
                      <span>{week.label}</span>
                    </h2>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE3DE]">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#F8F5F2] px-2.5 py-1.5 rounded-xl border border-[#EAE3DE]">
                        <span className="block text-[9px] uppercase text-[#8C7B75] font-bold">
                          Gym
                        </span>
                        <span className="font-serif font-bold text-xs text-[#6B2D3A]">
                          {gymSessionCount}
                        </span>
                      </div>
                      <div className="bg-[#F8F5F2] px-2.5 py-1.5 rounded-xl border border-[#EAE3DE]">
                        <span className="block text-[9px] uppercase text-[#8C7B75] font-bold">
                          Daily
                        </span>
                        <span className="font-serif font-bold text-xs text-[#6B2D3A]">
                          {dailyHabitCount}
                        </span>
                      </div>
                      <div className="bg-[#F8F5F2] px-2.5 py-1.5 rounded-xl border border-[#EAE3DE]">
                        <span className="block text-[9px] uppercase text-[#8C7B75] font-bold">
                          Volume
                        </span>
                        <span className="font-serif font-bold text-xs text-[#1A1817]">
                          {totalSets}s / {totalReps}r
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-1.5 rounded-full bg-[#F2E8EA] text-[#6B2D3A] transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Collapsible Daily Breakdown View */}
                {isExpanded && (
                  <div className="border-t border-[#EAE3DE] bg-[#F8F5F2]/40 p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#8C7B75] border-b border-[#EAE3DE] pb-2">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        Logged Days Breakdown
                      </span>
                      <span>{week.sessions.length} sessions logged</span>
                    </div>

                    <div className="space-y-3">
                      {week.sessions.map((sess, idx) => {
                        const dateObj = new Date(sess.completedAt);
                        const dayName = dateObj.toLocaleDateString(undefined, {
                          weekday: "short",
                        });
                        const dateNum = dateObj.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        });

                        const isDaily = sess.sessionType === "daily";
                        const isDayExpanded = selectedDayDetail === sess.id;

                        return (
                          <div
                            key={sess.id || idx}
                            className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl overflow-hidden transition-all shadow-2xs"
                          >
                            {/* Day Bar */}
                            <div
                              onClick={() =>
                                setSelectedDayDetail(
                                  isDayExpanded ? null : sess.id
                                )
                              }
                              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F2E8EA]/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-xl text-xs font-bold text-center min-w-12 ${
                                    isDaily
                                      ? "bg-[#F2E8EA] text-[#6B2D3A]"
                                      : "bg-[#6B2D3A] text-white"
                                  }`}
                                >
                                  <span className="block text-[9px] uppercase opacity-80 leading-tight">
                                    {dayName}
                                  </span>
                                  <span className="font-serif">{dateNum}</span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-serif font-bold text-sm text-[#1A1817]">
                                      {isDaily
                                        ? "Daily Routine"
                                        : sess.name || "Gym Session"}
                                    </h4>
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                        isDaily
                                          ? "bg-[#F8F5F2] text-[#8C7B75] border-[#EAE3DE]"
                                          : "bg-[#F2E8EA] text-[#6B2D3A] border-[#D9B7BE]/40"
                                      }`}
                                    >
                                      {isDaily ? "Daily Reset" : "Gym Split"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#8C7B75] mt-0.5">
                                    {sess.exercises?.length || 0} exercises completed
                                  </p>
                                </div>
                              </div>

                              <ChevronDown
                                className={`w-4 h-4 text-[#8C7B75] transition-transform duration-200 ${
                                  isDayExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {/* Exercises Drill-Down for this specific Day */}
                            {isDayExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-[#EAE3DE]/60 bg-[#F8F5F2]/20 space-y-3">
                                {sess.exercises?.map((ex: any, eIdx: number) => {
                                  // Look up exercise metadata name
                                  const dbEx = EXERCISE_DATABASE.find(
                                    (item) => item.id === ex.exerciseId
                                  );
                                  const exName =
                                    dbEx?.name ||
                                    ex.exerciseId ||
                                    `Exercise ${eIdx + 1}`;

                                  return (
                                    <div
                                      key={eIdx}
                                      className="p-3 bg-[#FFFCFA] rounded-xl border border-[#EAE3DE] space-y-2 text-xs"
                                    >
                                      <div className="flex items-center justify-between font-serif font-bold text-[#1A1817]">
                                        <span className="flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6B2D3A]" />
                                          {exName}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#8C7B75]">
                                          {ex.sets?.length || 0} sets
                                        </span>
                                      </div>

                                      {/* Sets & Reps Table Grid */}
                                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                                        {ex.sets?.map(
                                          (set: any, sIdx: number) => (
                                            <div
                                              key={sIdx}
                                              className="bg-[#F8F5F2] px-2 py-1 rounded-lg border border-[#EAE3DE] text-center"
                                            >
                                              <span className="text-[9px] text-[#8C7B75] block uppercase">
                                                Set {sIdx + 1}
                                              </span>
                                              <span className="font-semibold text-[#1A1817]">
                                                {set.reps || 0} reps
                                                {set.weight
                                                  ? ` @ ${set.weight}kg`
                                                  : ""}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}