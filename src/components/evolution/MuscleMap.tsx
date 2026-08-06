import { useEffect, useState } from "react";
import { Trophy, X, ChevronRight, Dumbbell, Loader2 } from "lucide-react";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { resolveExerciseId } from "@/utils/exerciseMatching";

interface TargetExercise {
  id: string;
  name: string;
  contribution: number;
  targetValue: number;
  unit: "kg" | "reps" | "sec" | "steps";
}

interface MuscleGroupConfig {
  id: string;
  name: string;
  tags: string[];
  exercises: TargetExercise[];
}

const MUSCLE_DEFINITIONS: MuscleGroupConfig[] = [
  {
    id: "back",
    name: "Back & Lats",
    tags: ["upper_pull", "grip"],
    exercises: [
      { id: "upl_lat_pulldown", name: "Lat Pulldown", contribution: 0.35, targetValue: 45, unit: "kg" },
      { id: "upl_seated_row", name: "Seated Cable Row", contribution: 0.30, targetValue: 40, unit: "kg" },
      { id: "upl_face_pull", name: "Cable Face Pull", contribution: 0.25, targetValue: 40, unit: "kg" },
      { id: "upl_hammer_curl", name: "Dumbbell Hammer Curl", contribution: 0.10, targetValue: 30, unit: "kg" },
    ],
  },
  {
    id: "shoulders",
    name: "Shoulders & Delts",
    tags: ["upper_push"],
    exercises: [
      { id: "up_db_shoulder", name: "Dumbbell Shoulder Press", contribution: 0.40, targetValue: 30, unit: "kg" },
      { id: "up_lat_raise", name: "Dumbbell Lateral Raise", contribution: 0.30, targetValue: 10, unit: "kg" },
      { id: "up_tricep_pushdown", name: "Cable Triceps Pushdown", contribution: 0.20, targetValue: 40, unit: "kg" },
      { id: "upl_face_pull", name: "Cable Face Pull", contribution: 0.10, targetValue: 40, unit: "kg" },
    ],
  },
  {
    id: "glutes",
    name: "Glutes & Hamstrings",
    tags: ["lower_body"],
    exercises: [
      { id: "lb_hip_thrust", name: "Barbell Hip Thrust", contribution: 0.40, targetValue: 80, unit: "kg" },
      { id: "lb_rdl", name: "Romanian Deadlift", contribution: 0.35, targetValue: 50, unit: "kg" },
      { id: "lb_leg_curl", name: "Leg Curl", contribution: 0.15, targetValue: 45, unit: "kg" },
      { id: "fb_kb_swing", name: "Kettlebell Swing", contribution: 0.10, targetValue: 50, unit: "kg" },
    ],
  },
  {
    id: "quads",
    name: "Quads & Lower Body",
    tags: ["lower_body"],
    exercises: [
      { id: "lb_squat", name: "Barbell Back Squat", contribution: 0.45, targetValue: 80, unit: "kg" },
      { id: "lb_adductor", name: "Hip Adductor", contribution: 0.20, targetValue: 45, unit: "kg" },
      { id: "lb_calf_raise", name: "Standing Calf Raise", contribution: 0.15, targetValue: 30, unit: "kg" },
      { id: "lb_abductor", name: "Hip Abductor", contribution: 0.10, targetValue: 50, unit: "kg" },
      { id: "day_deep_squat", name: "Horse Stance Hold", contribution: 0.10, targetValue: 60, unit: "sec" },
    ],
  },
  {
    id: "core",
    name: "Core & Posture",
    tags: ["core_a", "core_b", "posture"],
    exercises: [
      { id: "ca_cable_crunch", name: "Cable Crunch", contribution: 0.20, targetValue: 80, unit: "kg" },
      { id: "day_chin_tuck", name: "Chin Tucks", contribution: 0.15, targetValue: 15, unit: "reps" },
      { id: "day_wall_angels", name: "Wall Angels", contribution: 0.15, targetValue: 20, unit: "reps" },
      { id: "day_farmer_carry", name: "Farmer Carry", contribution: 0.10, targetValue: 50, unit: "steps" },
      { id: "day_deep_squat", name: "Horse Stance Hold", contribution: 0.10, targetValue: 60, unit: "sec" },
    ],
  },
];

interface ProcessedGroup extends MuscleGroupConfig {
  developmentIndex: number;
  contributors: { name: string; progressPct: number; current: number; target: number; unit: string }[];
}

function getMetricValue(set: any, exerciseType?: string) {
  if (exerciseType === "time") {
    return Number(set.durationSec ?? set.timeSeconds ?? 0);
  }
  if (exerciseType === "weight_reps") {
    return Number(set.weightKg ?? set.weight ?? 0);
  }
  return Number(set.reps ?? 0);
}

export default function MuscleMap() {
  const [processedGroups, setProcessedGroups] = useState<ProcessedGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ProcessedGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calculateDevelopmentIndices() {
      setLoading(true);
      try {
        const sessions = await db.sessions.toArray();
        const maxPerformanceMap = new Map<string, number>();

        sessions.forEach((session: any) => {
          if (session.exercises) {
            session.exercises.forEach((item: any) => {
              const resolvedExId = resolveExerciseId(item.exerciseId, item.exerciseName ?? item.name);
              if (!resolvedExId) return;

              const sets = item.sets || [];
              const definition = EXERCISE_DATABASE.find((exercise) => exercise.id === resolvedExId);

              sets.forEach((set: any) => {
                if (set.completed === false) return;
                const val = getMetricValue(set, definition?.type);
                if (val <= 0) return;
                const existing = maxPerformanceMap.get(resolvedExId) || 0;
                if (val > existing) {
                  maxPerformanceMap.set(resolvedExId, val);
                }
              });
            });
          }
        });

        const calculated = MUSCLE_DEFINITIONS.map((group) => {
          let muscleDevelopmentIndex = 0;
          const contributors = group.exercises.map((ex) => {
            const resolvedExId = resolveExerciseId(ex.id, ex.name);
            let currentVal = resolvedExId ? (maxPerformanceMap.get(resolvedExId) || 0) : 0;
            if (currentVal === 0) {
              maxPerformanceMap.forEach((val, key) => {
                if (key.toLowerCase().includes(ex.id.toLowerCase()) || ex.id.toLowerCase().includes(key.toLowerCase())) {
                  if (val > currentVal) currentVal = val;
                }
              });
            }

            const exerciseProgress = Math.min(currentVal / ex.targetValue, 1.0);
            const weightedContribution = exerciseProgress * ex.contribution;
            muscleDevelopmentIndex += weightedContribution;

            return {
              name: ex.name,
              progressPct: Math.round(exerciseProgress * 100),
              current: currentVal,
              target: ex.targetValue,
              unit: ex.unit,
            };
          });

          const developmentIndex = Math.round(muscleDevelopmentIndex * 100);

          return {
            ...group,
            developmentIndex: Math.min(developmentIndex, 100),
            contributors,
          };
        });

        setProcessedGroups(calculated);
      } catch (error) {
        console.error("Error calculating muscle development metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    calculateDevelopmentIndices();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] p-8 border border-[#EAE3DE] shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[220px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#6B2D3A]" />
        <p className="text-xs font-mono text-[#8C7B75]">Analyzing muscle groups...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EAE3DE] shadow-xs space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#F8F5F2] pb-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1817]">
            Muscle Development Map
          </h2>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            Tap any region to inspect exercise breakdown
          </p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-[#FAF8F6] border border-[#EAE3DE] flex items-center justify-center text-[#6B2D3A]">
          <Dumbbell className="w-4 h-4" />
        </div>
      </div>

      {/* GRID CARD LAYOUT */}
      <div className="grid grid-cols-2 gap-3">
        {processedGroups.map((group) => {
          return (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="bg-[#FAF8F6] border border-[#EAE3DE] hover:border-[#D9B7BE] rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75]">
                  {group.contributors.length} Exercises
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors line-clamp-1">
                  {group.name}
                </h3>
              </div>

              <div className="flex items-end justify-between pt-4 mt-2 border-t border-[#EAE3DE]/60">
                <div>
                  <span className="text-[10px] font-mono text-[#8C7B75] block">Progress</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-[#6B2D3A]">
                    {group.developmentIndex}%
                  </span>
                </div>
                <div className="w-7 h-7 rounded-xl bg-white border border-[#EAE3DE] flex items-center justify-center text-[#8C7B75] group-hover:bg-[#6B2D3A] group-hover:text-white group-hover:border-[#6B2D3A] transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP / MODAL FOR SELECTED MUSCLE GROUP DETAILS */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[28px] p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-xl border border-[#EAE3DE]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F8F5F2] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
                  Detailed Breakdown
                </span>
                <h3 className="font-serif font-bold text-xl text-[#1A1817]">
                  {selectedGroup.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedGroup(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F6] border border-[#EAE3DE] flex items-center justify-center text-[#1A1817] hover:bg-[#F2ECE6] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score Badge in Modal */}
            <div className="bg-[#FAF8F6] border border-[#EAE3DE] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6B2D3A]/10 text-[#6B2D3A] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1A1817] block">Development Index</span>
                  <span className="text-[10px] font-mono text-[#8C7B75]">Advanced Recreational Goal</span>
                </div>
              </div>
              <span className="font-mono font-bold text-xl text-[#6B2D3A]">
                {selectedGroup.developmentIndex}%
              </span>
            </div>

            {/* Contributors List */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
                Exercise Contributors & Targets
              </span>

              <div className="space-y-2.5">
                {selectedGroup.contributors.map((item, idx) => (
                  <div key={idx} className="bg-[#FAF8F6] border border-[#EAE3DE] p-3 rounded-2xl space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#1A1817]">
                      <span>{item.name}</span>
                      <span className="font-mono font-bold text-[#6B2D3A]">{item.progressPct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#EAE3DE]">
                      <div
                        className="bg-[#6B2D3A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.progressPct}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-[#8C7B75] pt-0.5">
                      <span>Logged Best: {item.current} {item.unit}</span>
                      <span>Target: {item.target} {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button for Mobile */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="w-full py-3 bg-[#6B2D3A] text-white rounded-2xl font-serif font-bold text-sm tracking-wide shadow-xs cursor-pointer hover:bg-[#59242F] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}