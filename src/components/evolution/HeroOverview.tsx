import { useEffect, useState } from "react";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE, type ExerciseDefinition } from "@/db/workoutData";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Sparkles,
  Dumbbell,
  Timer,
  Activity,
  Flame,
  BicepsFlexed,
  Footprints,
  ChevronRight,
} from "lucide-react";

// Exact Day 1 Baseline lookups mapped directly to exercise IDs or names
const DAY_ONE_BASELINES: Record<string, { val: number; text: string; unit: string }> = {
  // Lower Body
  "lb_squat": { val: 15, text: "15 kg", unit: "kg" },
  "lb_hip_thrust": { val: 15, text: "15 kg", unit: "kg" },
  "romanian_deadlift": { val: 7.5, text: "7.5 kg", unit: "kg" },
  
  // Upper Push
  "ex_dumbbell_bench": { val: 5, text: "5 kg", unit: "kg" },
  "ex_shoulder_press": { val: 2.5, text: "2.5 kg", unit: "kg" },
  
  // Upper Pull
  "day_dead_hang": { val: 0, text: "0 sec", unit: "time" },
  
  // Core & Posture
  "day_farmer_carry": { val: 10, text: "10 kg", unit: "kg" },
  "day_chin_tuck": { val: 1, text: "Beginner", unit: "form" },
  "day_wall_angels": { val: 1, text: "Beginner", unit: "form" },

  // Mobility & Skills
  "day_deep_squat": { val: 15, text: "15 sec", unit: "time" },
};

// Category configuration mapping DB category strings to Radar Axes
const RADAR_AXIS_MAPPING = [
  {
    id: "Upper Push",
    name: "Upper Push",
    icon: Dumbbell,
    tags: ["upper_push"],
    summaryNote: "Incline chest & pressing strength.",
  },
  {
    id: "Upper Pull",
    name: "Upper Pull",
    icon: BicepsFlexed,
    tags: ["upper_pull", "grip"],
    summaryNote: "Back pulling volume and grip duration.",
  },
  {
    id: "Lower Body",
    name: "Lower Body",
    icon: Footprints,
    tags: ["lower_body"],
    summaryNote: "Squat depth and hinge loading.",
  },
  {
    id: "Core",
    name: "Core & Posture",
    icon: Flame,
    tags: ["core_a", "core_b", "posture"],
    summaryNote: "Stability, trunk anti-rotation & neck/back alignment.",
  },
  {
    id: "Mobility",
    name: "Mobility & Skill",
    icon: Activity,
    tags: ["movement_skill"],
    summaryNote: "Deep squat holds, balance & floor practice.",
  },
  {
    id: "Endurance",
    name: "Full Body",
    icon: Timer,
    tags: ["full_body"],
    summaryNote: "Full-body compound capacity & stamina.",
  },
];

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1A1817] text-white p-2.5 rounded-xl text-xs shadow-lg border border-[#3E3A38] space-y-1">
        <p className="font-serif font-bold text-[#EAE3DE]">{data.category}</p>
        <div className="flex justify-between gap-4 font-mono text-[11px]">
          <span className="text-[#8C7B75]">Baseline: {data.Baseline} pts</span>
          <span className="text-[#D9B7BE] font-bold">Current: {data.Now} pts</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function HeroOverview({ timeFilter = "30D" }: { timeFilter?: string }) {
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Upper Push");
  const [radarData, setRadarData] = useState<any[]>([]);
  const [processedCategories, setProcessedCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDynamicPerformanceData() {
      setLoading(true);

      try {
        const sessions = await db.sessions.toArray();

        const categoriesResult = RADAR_AXIS_MAPPING.map((axis) => {
          const axisExercises = EXERCISE_DATABASE.filter((ex: ExerciseDefinition) =>
            axis.tags.includes(ex.category)
          );

          let exerciseCount = 0;

          const exerciseDetails = axisExercises.map((ex: ExerciseDefinition) => {
            const exerciseLogs: any[] = [];
            sessions.forEach((s: any) => {
              if (s.exercises) {
                s.exercises.forEach((e: any) => {
                  if (e.exerciseId === ex.id) {
                    exerciseLogs.push(...(e.sets || []));
                  }
                });
              }
            });

            // Pull exact Day 1 baseline if available, otherwise fallback
            const specificDayOne = DAY_ONE_BASELINES[ex.id];
            let thenVal = specificDayOne 
              ? specificDayOne.text 
              : (ex.defaultWeightKg ? `${ex.defaultWeightKg} kg` : "Baseline");
            
            let nowVal = thenVal;
            let change = "0%";

            if (exerciseLogs.length > 0) {
              const lastSet = exerciseLogs[exerciseLogs.length - 1];

              if (ex.type === "weight_reps") {
                nowVal = `${lastSet.weightKg || ex.defaultWeightKg || 0} kg`;
                const baseNumeric = specificDayOne?.val ?? ex.defaultWeightKg ?? 0;
                const diff = (lastSet.weightKg || 0) - baseNumeric;
                change = diff >= 0 ? `+${diff} kg` : `${diff} kg`;
              } else if (ex.type === "time") {
                nowVal = `${lastSet.timeSeconds || ex.defaultTimeSeconds || 0}s`;
                const baseNumeric = specificDayOne?.val ?? ex.defaultTimeSeconds ?? 0;
                const diff = (lastSet.timeSeconds || 0) - baseNumeric;
                change = diff >= 0 ? `+${diff}s` : `${diff}s`;
              } else {
                nowVal = `${lastSet.reps || 0} reps`;
                const diff = (lastSet.reps || 0);
                change = `+${diff} reps`;
              }
              exerciseCount++;
            }

            return {
              name: ex.name,
              thenVal,
              nowVal,
              change,
              unit: ex.type === "time" ? "time" : ex.type === "weight_reps" ? "load" : "reps",
            };
          });

          const baselineScore = 30;
          const currentScore = Math.min(100, baselineScore + exerciseCount * 12 + 15);

          return {
            ...axis,
            baselineScore,
            currentScore,
            averageGrowth: `+${Math.round((currentScore - baselineScore) * 1.8)}%`,
            exercises: exerciseDetails.slice(0, 3),
          };
        });

        const formattedRadar = categoriesResult.map((cat) => ({
          category: cat.name,
          Baseline: cat.baselineScore,
          Now: cat.currentScore,
          fullMark: 100,
        }));

        setProcessedCategories(categoriesResult);
        setRadarData(formattedRadar);
      } catch (error) {
        console.error("Error computing evolution stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDynamicPerformanceData();
  }, [timeFilter]);

  const selectedCategory =
    processedCategories.find((c) => c.name === selectedCategoryName) ||
    processedCategories[0];

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] p-8 border border-[#EAE3DE] text-center text-[#8C7B75] font-mono text-xs">
        Calculating Evolution Trajectory...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[28px] p-4 sm:p-6 border border-[#EAE3DE] shadow-xs space-y-5 transition-all">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between border-b border-[#F8F5F2] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6B2D3A]/10 text-[#6B2D3A] flex items-center justify-center font-serif font-bold text-lg shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B2D3A]">
                Macro Trajectory ({timeFilter})
              </span>
              <Sparkles className="w-3 h-3 text-[#6B2D3A]" />
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1A1817] leading-tight">
              Capability Map: <span className="text-[#6B2D3A]">Level 4</span>
            </h2>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Avg Growth
          </span>
          <span className="font-serif font-bold text-lg sm:text-xl text-[#2E6B40]">
            +84.2%
          </span>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* LEFT SIDE: RADAR MAP */}
        <div className="md:col-span-7 bg-[#FAF8F6] rounded-2xl p-3 sm:p-4 border border-[#EAE3DE] flex flex-col justify-between relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8C7B75] mb-2">
            <div className="flex items-center gap-3 bg-white/90 px-2.5 py-1 rounded-full border border-[#EAE3DE]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8C7B75]/40 inline-block" /> Baseline
              </span>
              <span className="flex items-center gap-1 font-bold text-[#6B2D3A]">
                <span className="w-2 h-2 rounded-full bg-[#6B2D3A] inline-block" /> Current
              </span>
            </div>
            <span className="hidden sm:inline italic text-[#8C7B75]">
              Click any node on map
            </span>
          </div>

          <div className="w-full h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#EAE3DE" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={({ x, y, payload }: any) => {
                    const isSelected = payload.value === selectedCategoryName;
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        className="cursor-pointer select-none"
                        fill={isSelected ? "#6B2D3A" : "#1A1817"}
                        fontSize={10}
                        fontFamily="serif"
                        fontWeight={isSelected ? "bold" : "600"}
                        onClick={() => setSelectedCategoryName(payload.value)}
                      >
                        {payload.value}
                      </text>
                    );
                  }}
                />
                <Tooltip content={<CustomRadarTooltip />} />
                <Radar
                  name="Baseline"
                  dataKey="Baseline"
                  stroke="#8C7B75"
                  fill="#8C7B75"
                  fillOpacity={0.12}
                  strokeDasharray="3 3"
                />
                <Radar
                  name="Now"
                  dataKey="Now"
                  stroke="#6B2D3A"
                  fill="#6B2D3A"
                  fillOpacity={0.35}
                  strokeWidth={2.5}
                  className="cursor-pointer"
                  onClick={(e: any) => {
                    if (e && e.payload && e.payload.category) {
                      setSelectedCategoryName(e.payload.category);
                    }
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EAE3DE]/60">
            {processedCategories.map((cat) => {
              const isSelected = cat.name === selectedCategoryName;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryName(cat.name)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#6B2D3A] text-white border-[#6B2D3A] font-bold"
                      : "bg-white text-[#8C7B75] border-[#EAE3DE] hover:text-[#1A1817]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: STATS PANEL */}
        {selectedCategory && (
          <div className="md:col-span-5 bg-[#FAF8F6] rounded-2xl p-4 border border-[#6B2D3A]/20 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#6B2D3A] text-white flex items-center justify-center">
                    <selectedCategory.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#8C7B75] block">
                      Selected Focus
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#1A1817]">
                      {selectedCategory.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-[#2E6B40] bg-[#2E6B40]/10 px-2 py-0.5 rounded block">
                    {selectedCategory.averageGrowth}
                  </span>
                  <span className="text-[9px] font-mono text-[#8C7B75]">
                    Score: {selectedCategory.currentScore} pt
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8C7B75] block">
                  Key Exercise Drill-downs
                </span>

                {selectedCategory.exercises.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-[#EAE3DE] flex items-center justify-between text-xs shadow-2xs hover:border-[#D9B7BE] transition-colors"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-[#1A1817]">{ex.name}</h4>
                      <div className="flex items-center gap-2 text-[#8C7B75] mt-0.5 text-[11px]">
                        <span className="line-through">{ex.thenVal}</span>
                        <span className="text-[#6B2D3A] font-bold">&rarr;</span>
                        <span className="font-bold text-[#1A1817]">{ex.nowVal}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-[#2E6B40] block">
                        {ex.change}
                      </span>
                      <span className="text-[9px] text-[#8C7B75] uppercase font-mono">
                        {ex.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAE3DE] text-[11px] text-[#8C7B75] italic flex items-center justify-between">
              <span>"{selectedCategory.summaryNote}"</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B2D3A] shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}