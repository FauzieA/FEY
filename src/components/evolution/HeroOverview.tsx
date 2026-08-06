import { useMemo, useState } from "react";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { EXERCISE_DATABASE, type ExerciseDefinition } from "@/db/workoutData";
import {
  Radar,
  RadarChart,
  PolarGrid,
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
import { resolveExerciseDefinition } from "@/utils/exerciseMatching";

const HARD_CODED_BASELINES: Record<string, { val: number; text: string; unit: string }> = {
  lb_squat: { val: 15, text: "15 kg", unit: "kg" },
  lb_hip_thrust: { val: 10, text: "10 kg", unit: "kg" },
  lb_rdl: { val: 5, text: "5 kg", unit: "kg" },
  lb_leg_curl: { val: 10, text: "10 kg", unit: "kg" },
  lb_adductor: { val: 10, text: "10 kg", unit: "kg" },
  lb_abductor: { val: 10, text: "10 kg", unit: "kg" },
  lb_calf_raise: { val: 10, text: "10 kg", unit: "kg" },
  up_chest_press: { val: 5, text: "5 kg", unit: "kg" },
  up_db_shoulder: { val: 2.5, text: "2.5 kg", unit: "kg" },
  up_lat_raise: { val: 2.5, text: "2.5 kg", unit: "kg" },
  up_tricep_pushdown: { val: 10, text: "10 kg", unit: "kg" },
  up_incline_pushup: { val: 0, text: "0 reps", unit: "reps" },
  upl_lat_pulldown: { val: 10, text: "10 kg", unit: "kg" },
  upl_seated_row: { val: 10, text: "10 kg", unit: "kg" },
  upl_rear_delt: { val: 5, text: "5 kg", unit: "kg" },
  upl_face_pull: { val: 5, text: "5 kg", unit: "kg" },
  upl_hammer_curl: { val: 5, text: "5 kg", unit: "kg" },
  fb_goblet_squat: { val: 10, text: "10 kg", unit: "kg" },
  fb_kb_swing: { val: 10, text: "10 kg", unit: "kg" },
  ca_cable_crunch: { val: 10, text: "10 kg", unit: "kg" },
  ca_leg_raise: { val: 0, text: "0 reps", unit: "reps" },
  ca_heel_taps: { val: 0, text: "0 reps", unit: "reps" },
  ca_bird_dog: { val: 0, text: "0 reps", unit: "reps" },
  ca_plank: { val: 10, text: "10s", unit: "time" },
  cb_side_leg_lowers: { val: 0, text: "0 reps", unit: "reps" },
  cb_bicycle_crunch: { val: 0, text: "0 reps", unit: "reps" },
  cb_russian_twist: { val: 2.5, text: "2.5 kg", unit: "kg" },
  hab_dead_hang: { val: 0, text: "0s", unit: "time" },
  hab_plate_hold: { val: 0, text: "0s", unit: "time" },
  day_chin_tuck: { val: 1, text: "Beginner", unit: "form" },
  day_wall_angels: { val: 1, text: "Beginner", unit: "form" },
  day_farmer_carry: { val: 5, text: "5 kg", unit: "kg" },
  day_pullup_tech: { val: 0, text: "0 reps", unit: "reps" },
  day_deep_squat: { val: 5, text: "5s", unit: "time" },
  day_single_leg_bal: { val: 10, text: "10s", unit: "time" },
  day_floor_stand: { val: 0, text: "0 reps", unit: "reps" },
  mob_ankle_rocks: { val: 5, text: "5 kg", unit: "kg" },
  mob_butterfly: { val: 30, text: "30s", unit: "time" },
  mob_9090: { val: 30, text: "30s", unit: "time" },
  mob_hip_flexor: { val: 20, text: "20s", unit: "time" },
  mob_cat_cow: { val: 0, text: "0 reps", unit: "reps" },
  mob_thread_needle: { val: 0, text: "0 reps", unit: "reps" },
  mob_wall_chest: { val: 20, text: "20s", unit: "time" },
  bal_single_leg_stand: { val: 20, text: "20s", unit: "time" },
  bal_sl_rdl_bw: { val: 5, text: "5 kg", unit: "kg" },
};

function getBaselineForExercise(exercise: ExerciseDefinition) {
  const explicitBaseline = HARD_CODED_BASELINES[exercise.id];
  if (explicitBaseline) {
    return explicitBaseline;
  }

  const fallbackValue = exercise.type === "time"
    ? Math.max(exercise.defaultTimeSeconds ?? 0, 1)
    : Math.max(exercise.defaultWeightKg ?? 0, 1);

  const baselineValue = fallbackValue > 0 ? fallbackValue : 1;
  return {
    val: baselineValue,
    text: formatMetricValue(exercise, baselineValue),
    unit: exercise.type === "time" ? "time" : exercise.type === "weight_reps" ? "kg" : "reps",
  };
}

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

function formatMetricValue(exercise: ExerciseDefinition, value: number): string {
  if (exercise.type === "time") {
    return `${Math.round(value)}s`;
  }
  if (exercise.type === "weight_reps") {
    return `${value % 1 === 0 ? Math.round(value) : value.toFixed(1)} kg`;
  }
  return `${Math.round(value)} reps`;
}

function formatChange(exercise: ExerciseDefinition, value: number): string {
  const prefix = value >= 0 ? "+" : "-";
  const absValue = Math.abs(value);
  if (exercise.type === "time") {
    return `${prefix}${Math.round(absValue)}s`;
  }
  if (exercise.type === "weight_reps") {
    return `${prefix}${absValue % 1 === 0 ? Math.round(absValue) : absValue.toFixed(1)} kg`;
  }
  return `${prefix}${Math.round(absValue)} reps`;
}

function getExerciseCurrentMetric(exercise: ExerciseDefinition, sessions: any[]) {
  const completedSets = sessions.flatMap((session: any) =>
    (session.exercises ?? [])
      .filter((entry: any) => {
        const resolved = resolveExerciseDefinition(entry.exerciseId, entry.exerciseName ?? entry.name);
        return resolved?.id === exercise.id;
      })
      .flatMap((entry: any) => (entry.sets ?? []).filter((set: any) => set.completed !== false)),
  );

  if (completedSets.length === 0) {
    return { value: 0, hasData: false };
  }

  if (exercise.type === "weight_reps") {
    const weights = completedSets.map((set: any) => Number(set.weightKg ?? set.weight ?? 0)).filter((value) => value > 0);
    return { value: weights.length > 0 ? Math.max(...weights) : 0, hasData: true };
  }

  if (exercise.type === "time") {
    const durations = completedSets.map((set: any) => Number(set.durationSec ?? set.timeSeconds ?? 0)).filter((value) => value > 0);
    return { value: durations.length > 0 ? Math.max(...durations) : 0, hasData: true };
  }

  const reps = completedSets.map((set: any) => Number(set.reps ?? 0)).filter((value) => value > 0);
  return { value: reps.length > 0 ? Math.max(...reps) : 0, hasData: true };
}

export default function HeroOverview({ timeFilter = "30D" }: { timeFilter?: string }) {
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Upper Push");
  const snapshot = useFeySnapshot();

  const processedCategories = useMemo(() => {
    const sessions = snapshot.sessions;

    return RADAR_AXIS_MAPPING.map((axis) => {
      const axisExercises = EXERCISE_DATABASE.filter((ex: ExerciseDefinition) =>
        axis.tags.includes(ex.category)
      );

      const exerciseDetails = axisExercises.map((ex: ExerciseDefinition) => {
        const baseline = getBaselineForExercise(ex);
        const baselineValue = baseline.val;
        const { value: currentValue, hasData } = getExerciseCurrentMetric(ex, sessions);
        const effectiveValue = hasData ? currentValue : baselineValue;
        const thenVal = baseline.text;
        const nowVal = formatMetricValue(ex, effectiveValue);
        const diff = effectiveValue - baselineValue;
        const change = hasData ? formatChange(ex, diff) : "0";

        return {
          name: ex.name,
          thenVal,
          nowVal,
          change,
          unit: ex.type === "time" ? "time" : ex.type === "weight_reps" ? "load" : "reps",
          baselineValue,
          currentValue: effectiveValue,
          hasData,
        };
      });

      const populatedExercises = exerciseDetails.filter((item) => item.hasData);
      const averageRatio = populatedExercises.length > 0
        ? populatedExercises.reduce((sum, item) => sum + Math.min(2.5, item.currentValue / Math.max(item.baselineValue, 1)), 0) / populatedExercises.length
        : 0;
      const currentScore = Math.min(100, Math.round(25 + averageRatio * 35 + (populatedExercises.length / Math.max(axisExercises.length, 1)) * 20));
      const baselineScore = 30;

      return {
        ...axis,
        baselineScore,
        currentScore,
        averageGrowth: `+${Math.round((currentScore - baselineScore) * 1.8)}%`,
        exercises: exerciseDetails.slice(0, 3),
      };
    });
  }, [snapshot.sessions]);

  const radarData = useMemo(() =>
    processedCategories.map((cat) => ({
      category: cat.name,
      Baseline: cat.baselineScore,
      Now: cat.currentScore,
      fullMark: 100,
    })),
    [processedCategories],
  );

  const radarLabelPositions = useMemo(() => {
    const count = processedCategories.length || 1;
    return processedCategories.map((cat, index) => {
      const angle = ((index / count) * 360 - 90) * (Math.PI / 180);
      const radius = 42;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      return { label: cat.name, x, y };
    });
  }, [processedCategories]);

  const selectedCategory =
    processedCategories.find((c) => c.name === selectedCategoryName) ||
    processedCategories[0];

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
              Capacity overview
            </span>
          </div>

          <div className="relative w-full h-[280px] sm:h-[320px]">
            <div className="absolute inset-0 pointer-events-none z-20">
              {radarLabelPositions.map((item) => (
                <div
                  key={item.label}
                  className="absolute px-2 py-1 rounded-full border border-[#D6C9C2] bg-white/95 text-[10px] font-serif font-bold text-[#1A1817] whitespace-nowrap shadow-sm"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#EAE3DE" />
                <Tooltip content={<CustomRadarTooltip />} />
                <Radar
                  name="Baseline"
                  dataKey="Baseline"
                  stroke="#8C7B75"
                  fill="#8C7B75"
                  fillOpacity={0.12}
                  strokeDasharray="3 3"
                  isAnimationActive={false}
                />
                <Radar
                  name="Now"
                  dataKey="Now"
                  stroke="#6B2D3A"
                  fill="#6B2D3A"
                  fillOpacity={0.35}
                  strokeWidth={2.5}
                  isAnimationActive={false}
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