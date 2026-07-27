import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import {
  ChevronLeft,
  TrendingUp,
  Award,
  Activity,
  Flame,
  ChevronRight,
} from "lucide-react";

type TimeRange = "7D" | "30D" | "3M" | "1Y" | "ALL";

const MAIN_LIFTS = [
  { id: "ex_back_squat", name: "Back Squat" },
  { id: "ex_hip_thrust", name: "Hip Thrust" },
  { id: "ex_romanian_deadlift", name: "Romanian Deadlift" },
  { id: "ex_dumbbell_bench", name: "Incline Bench Press" },
  { id: "ex_shoulder_press", name: "Shoulder Press" },
  { id: "ex_lat_pulldown", name: "Lat Pulldown" },
  { id: "ex_seated_row", name: "Seated Row" },
  { id: "ex_farmer_carry", name: "Farmer Carry" },
];

const MUSCLE_TARGETS: Record<string, { target: number; keywords: string[] }> = {
  Back: { target: 16, keywords: ["back", "lat", "row", "pull"] },
  "Chest & Front Delts": { target: 14, keywords: ["chest", "push", "bench", "shoulder"] },
  "Hamstrings & Glutes": { target: 16, keywords: ["hamstring", "glute", "deadlift", "thrust"] },
  "Core & Posture": { target: 12, keywords: ["core", "abs", "plank", "carry"] },
  Quads: { target: 12, keywords: ["quad", "squat", "lunge"] },
};

export default function ProgressPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("Back");

  // Read all completed sessions from IndexedDB
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  // 1. Filter sessions based on Global Time Range
  const filteredSessions = useMemo(() => {
    if (sessions.length === 0) return [];
    const now = new Date();
    const cutoff = new Date();

    if (timeRange === "7D") cutoff.setDate(now.getDate() - 7);
    else if (timeRange === "30D") cutoff.setDate(now.getDate() - 30);
    else if (timeRange === "3M") cutoff.setMonth(now.getMonth() - 3);
    else if (timeRange === "1Y") cutoff.setFullYear(now.getFullYear() - 1);
    else return sessions; // ALL

    return sessions.filter((s) => new Date(s.completedAt) >= cutoff);
  }, [sessions, timeRange]);

  // 2. Compute Overview Stats (Sets, Ratios, Avg Duration)
  const stats = useMemo(() => {
    let totalSets = 0;
    let pushSets = 0;
    let pullSets = 0;
    let upperSets = 0;
    let lowerSets = 0;
    let anteriorSets = 0;
    let posteriorSets = 0;
    let totalDurationSeconds = 0;

    filteredSessions.forEach((sess) => {
      totalDurationSeconds += sess.durationSeconds || 0;

      sess.exercises?.forEach((ex: any) => {
        const count = ex.sets?.length || 0;
        totalSets += count;

        const dbEx = EXERCISE_DATABASE.find((item) => item.id === ex.exerciseId);
        const cat = (dbEx?.category || "").toLowerCase();

        if (cat.includes("push") || cat.includes("chest") || cat.includes("shoulder")) {
          pushSets += count;
          anteriorSets += count;
          upperSets += count;
        } else if (cat.includes("pull") || cat.includes("back") || cat.includes("row")) {
          pullSets += count;
          posteriorSets += count;
          upperSets += count;
        } else if (cat.includes("lower") || cat.includes("leg") || cat.includes("glute")) {
          lowerSets += count;
          if (cat.includes("quad")) anteriorSets += count;
          else posteriorSets += count;
        }
      });
    });

    const pushPullTotal = pushSets + pullSets || 1;
    const upperLowerTotal = upperSets + lowerSets || 1;
    const antPostTotal = anteriorSets + posteriorSets || 1;

    // Average session time calculation
    const avgSeconds = filteredSessions.length > 0 ? totalDurationSeconds / filteredSessions.length : 0;
    const avgMins = Math.round(avgSeconds / 60);
    const hours = Math.floor(avgMins / 60);
    const mins = avgMins % 60;
    const avgTimeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      totalWorkouts: filteredSessions.length,
      totalSets,
      avgTimeString,
      pushRatio: Math.round((pushSets / pushPullTotal) * 100),
      pullRatio: Math.round((pullSets / pushPullTotal) * 100),
      upperRatio: Math.round((upperSets / upperLowerTotal) * 100),
      lowerRatio: Math.round((lowerSets / upperLowerTotal) * 100),
      anteriorRatio: Math.round((anteriorSets / antPostTotal) * 100),
      posteriorRatio: Math.round((posteriorSets / antPostTotal) * 100),
    };
  }, [filteredSessions]);

  // 3. Dynamic Active Streak & Best Streak Calculation
  const streakInfo = useMemo(() => {
    if (sessions.length === 0) return { activeStreak: 0, maxStreak: 0 };

    const sortedDates = Array.from(
      new Set(
        sessions.map((s) => new Date(s.completedAt).toISOString().split("T")[0])
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check active streak continuity
    if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
      let checkDate = new Date(sortedDates.includes(todayStr) ? todayStr : yesterdayStr);

      while (true) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (sortedDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate maximum historical streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }

    return { activeStreak: currentStreak, maxStreak };
  }, [sessions]);

  // 4. Dynamic Strength Progression (Current vs Previous Max Weights)
  const strengthData = useMemo(() => {
    const results: Record<
      string,
      { currWeight: number; prevWeight: number; delta: number; pct: number }
    > = {};

    MAIN_LIFTS.forEach((lift) => {
      let maxCurr = 0;
      let maxPrev = 0;

      const halfIndex = Math.floor(filteredSessions.length / 2);
      const recentSessions = filteredSessions.slice(0, halfIndex || 1);
      const olderSessions = filteredSessions.slice(halfIndex);

      recentSessions.forEach((sess) => {
        const ex = sess.exercises?.find((e: any) => e.exerciseId === lift.id);
        ex?.sets?.forEach((s: any) => {
          if (s.weight && Number(s.weight) > maxCurr) maxCurr = Number(s.weight);
        });
      });

      olderSessions.forEach((sess) => {
        const ex = sess.exercises?.find((e: any) => e.exerciseId === lift.id);
        ex?.sets?.forEach((s: any) => {
          if (s.weight && Number(s.weight) > maxPrev) maxPrev = Number(s.weight);
        });
      });

      const delta = maxCurr - maxPrev;
      const pct = maxPrev > 0 ? Math.round((delta / maxPrev) * 100) : 0;

      results[lift.id] = { currWeight: maxCurr, prevWeight: maxPrev, delta, pct };
    });

    return results;
  }, [filteredSessions]);

  // 5. Dynamic Muscle Group Volume Targets & Last Trained Calculation
  const muscleGroupsData = useMemo(() => {
    const now = new Date();

    return Object.entries(MUSCLE_TARGETS).map(([groupName, info]) => {
      let setCounter = 0;
      let lastTrainedDate: Date | null = null;

      sessions.forEach((sess) => {
        const sessDate = new Date(sess.completedAt);
        sess.exercises?.forEach((ex: any) => {
          const dbEx = EXERCISE_DATABASE.find((item) => item.id === ex.exerciseId);
          const fullText = `${dbEx?.name || ""} ${dbEx?.category || ""} ${ex.exerciseId}`.toLowerCase();

          const matches = info.keywords.some((kw) => fullText.includes(kw));
          if (matches) {
            // Count sets within selected filter range
            if (filteredSessions.some((s) => s.id === sess.id)) {
              setCounter += ex.sets?.length || 0;
            }
            // Track absolute latest trained date across all time
            if (!lastTrainedDate || sessDate > lastTrainedDate) {
              lastTrainedDate = sessDate;
            }
          }
        });
      });

      let lastTrainedStr = "Never";
      if (lastTrainedDate) {
        const diffHours = Math.round((now.getTime() - (lastTrainedDate as Date).getTime()) / 3600000);
        if (diffHours < 24) lastTrainedStr = "Today";
        else if (diffHours < 48) lastTrainedStr = "Yesterday";
        else lastTrainedStr = `${Math.floor(diffHours / 24)} days ago`;
      }

      return {
        name: groupName,
        current: setCounter,
        target: info.target,
        lastTrained: lastTrainedStr,
      };
    });
  }, [sessions, filteredSessions]);

  // 6. Dynamic Lifetime PRs
  const lifetimePRs = useMemo(() => {
    let heaviestSquat = 0;
    let heaviestBench = 0;
    let heaviestRDL = 0;
    let heaviestThrust = 0;

    sessions.forEach((sess) => {
      sess.exercises?.forEach((ex: any) => {
        ex.sets?.forEach((s: any) => {
          const w = Number(s.weight) || 0;
          if (ex.exerciseId === "ex_back_squat" && w > heaviestSquat) heaviestSquat = w;
          if (ex.exerciseId === "ex_dumbbell_bench" && w > heaviestBench) heaviestBench = w;
          if (ex.exerciseId === "ex_romanian_deadlift" && w > heaviestRDL) heaviestRDL = w;
          if (ex.exerciseId === "ex_hip_thrust" && w > heaviestThrust) heaviestThrust = w;
        });
      });
    });

    return [
      { name: "Back Squat PR", value: heaviestSquat > 0 ? `${heaviestSquat} kg` : "No Record" },
      { name: "Bench Press PR", value: heaviestBench > 0 ? `${heaviestBench} kg` : "No Record" },
      { name: "Romanian Deadlift PR", value: heaviestRDL > 0 ? `${heaviestRDL} kg` : "No Record" },
      { name: "Hip Thrust PR", value: heaviestThrust > 0 ? `${heaviestThrust} kg` : "No Record" },
    ];
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#EAE3DE] pb-6 gap-4">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-xs text-[#6B2D3A] mb-2 hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-serif text-[#1A1817] tracking-tight">
            Progress Analytics
          </h1>
          <p className="text-xs text-[#8C7B75] italic mt-1">
            Real-time workout volume, balance ratios, and lifetime progression
          </p>
        </div>

        {/* Global Time Selector */}
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-1.5 flex items-center gap-1 shadow-xs self-start md:self-auto">
          {(["7D", "30D", "3M", "1Y", "ALL"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-[#6B2D3A] text-white shadow-xs"
                  : "text-[#8C7B75] hover:text-[#1A1817]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* 1. Dynamic Overview Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-4 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B75]">
            Workouts Logged
          </span>
          <div className="text-2xl md:text-3xl font-serif font-bold text-[#1A1817]">
            {stats.totalWorkouts}
          </div>
          <p className="text-[10px] text-[#8C7B75]">In range ({timeRange})</p>
        </div>

        <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-4 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B75]">
            Total Working Sets
          </span>
          <div className="text-2xl md:text-3xl font-serif font-bold text-[#6B2D3A]">
            {stats.totalSets}
          </div>
          <p className="text-[10px] text-[#8C7B75]">Sets completed</p>
        </div>

        <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-4 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B75]">
            Active Streak
          </span>
          <div className="text-2xl md:text-3xl font-serif font-bold text-[#1A1817] flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-[#6B2D3A]" />
            <span>{streakInfo.activeStreak} Days</span>
          </div>
          <p className="text-[10px] text-[#8C7B75]">Best: {streakInfo.maxStreak} Days</p>
        </div>

        <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-4 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B75]">
            Avg. Session Time
          </span>
          <div className="text-2xl md:text-3xl font-serif font-bold text-[#1A1817]">
            {stats.avgTimeString}
          </div>
          <p className="text-[10px] text-[#8C7B75]">Calculated from database logs</p>
        </div>
      </section>

      {/* 2. Strength Progress (Main Lifts) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#6B2D3A]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
              Strength Progression (Main Lifts)
            </h2>
          </div>
          <span className="text-xs text-[#8C7B75] italic">Max Weight Deltas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {MAIN_LIFTS.map((lift) => {
            const data = strengthData[lift.id] || { currWeight: 0, prevWeight: 0, delta: 0, pct: 0 };
            return (
              <div
                key={lift.id}
                className="bg-[#FFFCFA] border border-[#EAE3DE] p-4 rounded-2xl space-y-2 shadow-2xs hover:border-[#6B2D3A] transition-colors"
              >
                <span className="text-xs font-serif font-bold text-[#1A1817] block">
                  {lift.name}
                </span>
                <div className="flex items-baseline justify-between border-t border-[#EAE3DE]/60 pt-2">
                  <div>
                    <span className="text-[9px] uppercase text-[#8C7B75] block">Current</span>
                    <span className="font-serif font-bold text-sm text-[#1A1817]">
                      {data.currWeight > 0 ? `${data.currWeight} kg` : "-"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-[#8C7B75] block">Prev</span>
                    <span className="font-serif text-xs text-[#8C7B75]">
                      {data.prevWeight > 0 ? `${data.prevWeight} kg` : "-"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[9px] font-bold block ${
                        data.delta >= 0 ? "text-[#2E6B40]" : "text-[#6B2D3A]"
                      }`}
                    >
                      {data.delta >= 0 ? `+${data.delta} kg` : `${data.delta} kg`}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        data.pct >= 0 ? "text-[#2E6B40]" : "text-[#6B2D3A]"
                      }`}
                    >
                      {data.pct >= 0 ? `▲${data.pct}%` : `▼${Math.abs(data.pct)}%`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Body Balance Ratios */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#6B2D3A]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
            Body Balance & Structural Symmetry
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Push vs Pull */}
          <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-5 rounded-3xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-serif font-bold text-[#1A1817]">Push vs Pull</span>
              <span className="text-[10px] font-mono text-[#8C7B75]">Set Ratio</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-[#6B2D3A]">Push {stats.pushRatio}%</span>
                <span className="text-[#1A1817]">Pull {stats.pullRatio}%</span>
              </div>
              <div className="h-3 w-full bg-[#F2E8EA] rounded-full overflow-hidden flex">
                <div style={{ width: `${stats.pushRatio}%` }} className="bg-[#6B2D3A] h-full" />
                <div style={{ width: `${stats.pullRatio}%` }} className="bg-[#1A1817] h-full" />
              </div>
            </div>
            <p className="text-[10px] text-[#8C7B75] italic text-center">
              Target: 45-55% balance range
            </p>
          </div>

          {/* Upper vs Lower */}
          <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-5 rounded-3xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-serif font-bold text-[#1A1817]">Upper vs Lower</span>
              <span className="text-[10px] font-mono text-[#8C7B75]">Set Ratio</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-[#6B2D3A]">Upper {stats.upperRatio}%</span>
                <span className="text-[#1A1817]">Lower {stats.lowerRatio}%</span>
              </div>
              <div className="h-3 w-full bg-[#F2E8EA] rounded-full overflow-hidden flex">
                <div style={{ width: `${stats.upperRatio}%` }} className="bg-[#6B2D3A] h-full" />
                <div style={{ width: `${stats.lowerRatio}%` }} className="bg-[#1A1817] h-full" />
              </div>
            </div>
            <p className="text-[10px] text-[#8C7B75] italic text-center">
              Balanced volume distribution
            </p>
          </div>

          {/* Anterior vs Posterior */}
          <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-5 rounded-3xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-serif font-bold text-[#1A1817]">Anterior vs Posterior</span>
              <span className="text-[10px] font-mono text-[#8C7B75]">Posture Alignment</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-[#6B2D3A]">Anterior {stats.anteriorRatio}%</span>
                <span className="text-[#2E6B40]">Posterior {stats.posteriorRatio}%</span>
              </div>
              <div className="h-3 w-full bg-[#F2E8EA] rounded-full overflow-hidden flex">
                <div style={{ width: `${stats.anteriorRatio}%` }} className="bg-[#6B2D3A] h-full" />
                <div style={{ width: `${stats.posteriorRatio}%` }} className="bg-[#2E6B40] h-full" />
              </div>
            </div>
            <p className="text-[10px] text-[#8C7B75] italic text-center">
              Posterior ratio supports posture
            </p>
          </div>
        </div>
      </section>

      {/* 4. Muscle Development Targets */}
      <section className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-4">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#1A1817]">
              Muscle Group Volume Targets
            </h2>
            <p className="text-xs text-[#8C7B75]">
              Completed sets vs target thresholds
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {muscleGroupsData.map((mg) => {
            const pct = Math.min(100, Math.round((mg.current / mg.target) * 100));
            return (
              <div
                key={mg.name}
                onClick={() => setSelectedMuscle(mg.name)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedMuscle === mg.name
                    ? "bg-[#F8F5F2] border-[#6B2D3A]"
                    : "bg-[#FFFCFA] border-[#EAE3DE] hover:border-[#D9B7BE]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#1A1817]">
                      {mg.name}
                    </span>
                    <span className="text-[10px] text-[#8C7B75] italic">
                      • Last trained {mg.lastTrained}
                    </span>
                  </div>
                  <div className="w-48 bg-[#EAE3DE] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6B2D3A] h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#1A1817]">
                      {mg.current} / {mg.target} Sets
                    </span>
                    <span className="block text-[10px] text-[#8C7B75]">
                      {pct}% of Target
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Dynamic Lifetime Personal Records (PRs) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#6B2D3A]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
            Lifetime Personal Records (PRs)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {lifetimePRs.map((pr) => (
            <div
              key={pr.name}
              className="bg-[#FFFCFA] border border-[#EAE3DE] p-4 rounded-2xl space-y-1 shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase text-[#8C7B75]">
                {pr.name}
              </span>
              <div className="font-serif font-bold text-lg text-[#1A1817]">
                {pr.value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}