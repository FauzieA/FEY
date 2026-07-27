import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ChevronDown, 
  Activity, 
  Award, 
  Sparkles 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";

interface ExerciseOption {
  id: string;
  name: string;
}

interface ProgressionPoint {
  date: string;
  value: number;
  weight: number;
  reps: number;
}

interface TimelineEvent {
  date: string;
  exerciseName: string;
  metricText: string;
  timestamp: number;
}

interface BalanceCategory {
  categoryName: string;
  score: number; // 0 to 100%
  label: string;
}

export default function PerformanceTrends() {
  // Graph 1 State: Strength Progression
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [progressionData, setProgressionData] = useState<ProgressionPoint[]>([]);
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);

  // Graph 2 State: Estimated 1RM
  const [estimated1RMData, setEstimated1RMData] = useState<{ date: string; est1rm: number }[]>([]);
  const [est1RMExerciseName, setEst1RMExerciseName] = useState<string>("Bench Press");

  // Graph 4 State: Movement Balance
  const [balanceData, setBalanceData] = useState<BalanceCategory[]>([]);

  // Graph 5 State: Personal Records Timeline
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const sessions = await db.sessions.toArray();

        // 1. Extract unique exercises performed across all sessions
        const exerciseMap = new Map<string, string>();
        sessions.forEach((s: any) => {
          if (s.exercises) {
            s.exercises.forEach((item: any) => {
              if (item.exerciseId) {
                const def = EXERCISE_DATABASE.find((e) => e.id === item.exerciseId);
                const name = def ? def.name : (item.name || item.exerciseId);
                exerciseMap.set(item.exerciseId, name);
              }
            });
          }
        });

        const options: ExerciseOption[] = Array.from(exerciseMap.entries()).map(([id, name]) => ({
          id,
          name,
        }));

        setExerciseOptions(options);
        
        const defaultExId = options.length > 0 ? options[0].id : "";
        if (defaultExId && !selectedExerciseId) {
          setSelectedExerciseId(defaultExId);
        }

        // 2. Parse sessions into chronological timeline for Graph 1 & 5
        const sortedSessions = [...sessions].sort((a: any, b: any) => {
          const dateA = new Date(a.timestamp || a.startTime || 0).getTime();
          const dateB = new Date(b.timestamp || b.startTime || 0).getTime();
          return dateA - dateB;
        });

        // --- Graph 5: PR Timeline calculation ---
        const prMap = new Map<string, { bestVal: number; dateStr: string; timestamp: number; metricText: string }>();
        const timelineList: TimelineEvent[] = [];

        sortedSessions.forEach((session: any) => {
          const rawDate = session.timestamp || session.startTime || Date.now();
          const d = new Date(rawDate);
          const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const timestamp = d.getTime();

          if (session.exercises) {
            session.exercises.forEach((item: any) => {
              const def = EXERCISE_DATABASE.find((e) => e.id === item.exerciseId);
              const exName = def ? def.name : (item.name || item.exerciseId);
              const sets = item.sets || [];

              sets.forEach((set: any) => {
                const weight = set.weightKg || 0;
                const reps = set.reps || 0;
                const time = set.timeSeconds || 0;
                
                const magnitude = weight > 0 ? weight : (reps > 0 ? reps : time);
                const unit = weight > 0 ? "kg" : (time > 0 ? "sec" : "reps");

                if (magnitude > 0) {
                  const existing = prMap.get(exName);
                  if (!existing || magnitude > existing.bestVal) {
                    prMap.set(exName, {
                      bestVal: magnitude,
                      dateStr,
                      timestamp,
                      metricText: `${magnitude} ${unit}${reps > 0 && weight > 0 ? ` × ${reps}` : ""}`,
                    });
                  }
                }
              });
            });
          }
        });

        prMap.forEach((val, exerciseName) => {
          timelineList.push({
            date: val.dateStr,
            exerciseName,
            metricText: val.metricText,
            timestamp: val.timestamp,
          });
        });

        timelineList.sort((a, b) => b.timestamp - a.timestamp);
        setTimelineEvents(timelineList.slice(0, 5));

        // --- Graph 4: Movement Balance calculation ---
        let pushCount = 0;
        let pullCount = 0;
        let lowerCount = 0;
        let coreCount = 0;

        sortedSessions.forEach((session: any) => {
          if (session.exercises) {
            session.exercises.forEach((item: any) => {
              const def = EXERCISE_DATABASE.find((e) => e.id === item.exerciseId);
              const cat = def ? def.category : "";
              const setsLen = (item.sets || []).length;

              if (cat.includes("push")) pushCount += setsLen;
              else if (cat.includes("pull") || cat.includes("grip")) pullCount += setsLen;
              else if (cat.includes("lower")) lowerCount += setsLen;
              else if (cat.includes("core") || cat.includes("posture")) coreCount += setsLen;
              else pushCount += setsLen;
            });
          }
        });

        const maxVal = Math.max(pushCount, pullCount, lowerCount, coreCount, 1);
        setBalanceData([
          { categoryName: "Upper Push", score: Math.round((pushCount / maxVal) * 100), label: `${pushCount} sets` },
          { categoryName: "Upper Pull", score: Math.round((pullCount / maxVal) * 100), label: `${pullCount} sets` },
          { categoryName: "Lower Body", score: Math.round((lowerCount / maxVal) * 100), label: `${lowerCount} sets` },
          { categoryName: "Core & Posture", score: Math.round((coreCount / maxVal) * 100), label: `${coreCount} sets` },
        ]);

      } catch (err) {
        console.error("Error loading analytics data:", err);
      }
    }

    loadAnalytics();
  }, []);

  // Update Graph 1 and Graph 2 when selectedExerciseId changes
  useEffect(() => {
    if (!selectedExerciseId) return;

    async function loadExerciseProgression() {
      try {
        const sessions = await db.sessions.toArray();
        const sortedSessions = [...sessions].sort((a: any, b: any) => {
          const dateA = new Date(a.timestamp || a.startTime || 0).getTime();
          const dateB = new Date(b.timestamp || b.startTime || 0).getTime();
          return dateA - dateB;
        });

        const points: ProgressionPoint[] = [];
        const est1rmPoints: { date: string; est1rm: number }[] = [];
        
        const def = EXERCISE_DATABASE.find((e) => e.id === selectedExerciseId);
        if (def) setEst1RMExerciseName(def.name);

        sortedSessions.forEach((session: any) => {
          const rawDate = session.timestamp || session.startTime || Date.now();
          const dateStr = new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

          if (session.exercises) {
            session.exercises.forEach((item: any) => {
              if (item.exerciseId === selectedExerciseId) {
                const sets = item.sets || [];
                let bestWeight = 0;
                let bestReps = 0;
                let bestVal = 0;

                sets.forEach((set: any) => {
                  const w = set.weightKg || 0;
                  const r = set.reps || 0;
                  const score = w > 0 ? w : r;
                  if (score > bestVal) {
                    bestVal = score;
                    bestWeight = w;
                    bestReps = r;
                  }
                });

                if (bestVal > 0) {
                  points.push({
                    date: dateStr,
                    value: bestVal,
                    weight: bestWeight,
                    reps: bestReps,
                  });

                  if (bestWeight > 0 && bestReps > 0) {
                    const e1rm = Math.round(bestWeight * (1 + bestReps / 30));
                    est1rmPoints.push({ date: dateStr, est1rm: e1rm });
                  } else if (bestWeight > 0) {
                    est1rmPoints.push({ date: dateStr, est1rm: bestWeight });
                  }
                }
              }
            });
          }
        });

        setProgressionData(points);
        setEstimated1RMData(est1rmPoints.length > 0 ? est1rmPoints : points.map(p => ({ date: p.date, est1rm: p.value })));
      } catch (err) {
        console.error("Error loading exercise progression:", err);
      }
    }

    loadExerciseProgression();
  }, [selectedExerciseId, exerciseOptions]);

  const selectedExerciseObj = exerciseOptions.find((e) => e.id === selectedExerciseId);

  return (
    <div className="space-y-6">
      {/* SECTION TITLE INTRO */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EAE3DE] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C7B75] block">
            Performance Analytics
          </span>
          <h2 className="font-serif font-bold text-xl text-[#1A1817] mt-0.5">
            What direction is my body moving?
          </h2>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#FAF8F6] border border-[#EAE3DE] flex items-center justify-center text-[#6B2D3A]">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* ================= GRAPH 1: STRENGTH PROGRESSION ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8F5F2] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
              Graph 1 • Interactive Inspector
            </span>
            <h3 className="font-serif font-bold text-lg text-[#1A1817]">
              Strength Progression
            </h3>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsExerciseDropdownOpen(!isExerciseDropdownOpen)}
              className="bg-[#FAF8F6] border border-[#EAE3DE] hover:border-[#D9B7BE] px-4 py-2 rounded-xl text-xs font-bold text-[#1A1817] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{selectedExerciseObj ? selectedExerciseObj.name : "Select Exercise"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7B75]" />
            </button>

            {isExerciseDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EAE3DE] rounded-2xl shadow-xl z-20 py-2 max-h-60 overflow-y-auto">
                {exerciseOptions.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExerciseId(ex.id);
                      setIsExerciseDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                      selectedExerciseId === ex.id
                        ? "bg-[#6B2D3A] text-white font-bold"
                        : "text-[#1A1817] hover:bg-[#FAF8F6]"
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
                {exerciseOptions.length === 0 && (
                  <div className="px-4 py-2 text-xs text-[#8C7B75] italic">No exercises logged yet</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#FAF8F6]/50 border border-[#EAE3DE]/60 rounded-2xl p-4 pt-5">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75]">
              Trajectory for {selectedExerciseObj?.name || "Exercise"}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#6B2D3A]">
              Single Exercise Focus
            </span>
          </div>

          <div className="h-[240px] w-full">
            {progressionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3DE" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8C7B75", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8C7B75", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1817",
                      borderRadius: "16px",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      padding: "10px 14px",
                    }}
                    formatter={(val: any) => [`${val} units`, "Peak Output"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6B2D3A"
                    strokeWidth={3}
                    dot={{ fill: "#6B2D3A", r: 4 }}
                    activeDot={{ r: 6, fill: "#1A1817" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[#8C7B75]">
                <Activity className="w-8 h-8 text-[#D9B7BE] mb-2" />
                <span>No historical logs found for this exercise. Try logging a workout session!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= GRAPH 2: ESTIMATED STRENGTH (1RM) ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Graph 2 • Standardized Metric
          </span>
          <h3 className="font-serif font-bold text-lg text-[#1A1817]">
            Estimated Strength (1RM) — {est1RMExerciseName}
          </h3>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            Normalized via working set formulas so you can compare progress across changing rep ranges
          </p>
        </div>

        <div className="bg-[#FAF8F6]/50 border border-[#EAE3DE]/60 rounded-2xl p-4 pt-5">
          <div className="h-[220px] w-full">
            {estimated1RMData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={estimated1RMData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3DE" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8C7B75", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8C7B75", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1817",
                      borderRadius: "16px",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      padding: "10px 14px",
                    }}
                    formatter={(val: any) => [`${val} kg`, "Estimated 1RM"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="est1rm"
                    stroke="#2E6B40"
                    strokeWidth={3}
                    dot={{ fill: "#2E6B40", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C7B75]">
                <span>Log weighted sets to generate estimated 1RM projections.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= GRAPH 4: MOVEMENT BALANCE ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Graph 4 • Diagnostic Overview
          </span>
          <h3 className="font-serif font-bold text-lg text-[#1A1817]">
            Movement Balance
          </h3>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            Instantly spot if a muscular category or posture routine is falling behind
          </p>
        </div>

        <div className="space-y-3.5 bg-[#FAF8F6]/50 border border-[#EAE3DE]/60 rounded-2xl p-4 sm:p-5">
          {balanceData.map((item, idx) => (
            <div key={idx} className="bg-white border border-[#EAE3DE] p-3.5 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex justify-between text-xs font-serif font-bold text-[#1A1817]">
                <span>{item.categoryName}</span>
                <span className="font-mono text-[#6B2D3A]">{item.label}</span>
              </div>

              <div className="w-full bg-[#FAF8F6] h-2.5 rounded-full overflow-hidden border border-[#EAE3DE]">
                <div
                  className="bg-[#6B2D3A] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(item.score, 8)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= GRAPH 5: PERSONAL RECORDS TIMELINE ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Graph 5 • Milestone Feed
          </span>
          <h3 className="font-serif font-bold text-lg text-[#1A1817]">
            Personal Records Timeline
          </h3>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            A chronological story of achievements you'll actually want to look at every day
          </p>
        </div>

        <div className="space-y-3">
          {timelineEvents.map((event, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F6] border border-[#EAE3DE] p-4 rounded-2xl flex items-center justify-between shadow-2xs hover:border-[#D9B7BE] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6B2D3A]/10 text-[#6B2D3A] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
                    {event.date}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#1A1817]">
                    {event.exerciseName}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-sm text-[#6B2D3A] bg-white border border-[#EAE3DE] px-3 py-1 rounded-xl shadow-2xs">
                  ★ {event.metricText}
                </span>
              </div>
            </div>
          ))}

          {timelineEvents.length === 0 && (
            <div className="bg-[#FAF8F6] border border-[#EAE3DE] p-6 rounded-2xl text-center text-xs text-[#8C7B75]">
              <Sparkles className="w-6 h-6 text-[#D9B7BE] mx-auto mb-2" />
              <span>Complete workouts and log sets to unlock your personal record milestones!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}