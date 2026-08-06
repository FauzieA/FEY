import { EXERCISE_DATABASE, type ExerciseDefinition } from "@/db/workoutData";

export function normalizeExerciseKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const EXERCISE_ALIASES: Record<string, string[]> = {
  up_db_shoulder: ["dumbbell shoulder press", "db shoulder press", "shoulder press"],
  up_lat_raise: ["dumbbell lateral raise", "lateral raise"],
  lb_hip_thrust: ["barbell hip thrust", "hip thrust"],
  lb_rdl: ["romanian deadlift", "rdl", "romanian deadlift (rdl)"],
  lb_squat: ["barbell back squat", "back squat", "squat"],
  lb_adductor: ["hip adductor", "adductor"],
  lb_calf_raise: ["standing calf raise", "calf raise", "calf raises"],
  fb_kb_swing: ["kettlebell swing", "kb swing"],
  upl_face_pull: ["cable face pull", "face pull"],
  upl_lat_pulldown: ["lat pulldown"],
  upl_seated_row: ["seated cable row", "seated row"],
  ca_cable_crunch: ["cable crunch", "crunch"],
  lb_leg_curl: ["leg curl"],
  day_farmer_carry: ["farmer carry"],
  day_wall_angels: ["wall angels"],
  day_chin_tuck: ["chin tucks"],
  day_deep_squat: ["horse stance hold", "deep squat hold"],
  up_chest_press: ["cable chest press", "chest press"],
  up_tricep_pushdown: ["cable triceps pushdown", "triceps pushdown"],
  upl_rear_delt: ["cable rear delt fly", "rear delt fly"],
  up_incline_pushup: ["incline push-up", "incline pushups", "push-ups", "pushups"],
  day_pullup_tech: ["pull-up technique practice", "pull up technique practice", "pull-up practice"],
  day_single_leg_bal: ["single-leg balance practice", "single leg balance practice"],
  day_floor_stand: ["floor stand practice", "floor stand"],
};

export function resolveExerciseDefinition(exerciseId?: string, exerciseName?: string): ExerciseDefinition | null {
  const directId = exerciseId?.trim();
  if (directId) {
    const directDefinition = EXERCISE_DATABASE.find((exercise) => exercise.id === directId);
    if (directDefinition) return directDefinition;
  }

  const candidates = [directId, exerciseName].filter(Boolean) as string[];
  const normalizedCandidates = candidates.map((value) => normalizeExerciseKey(value));

  const exactMatch = EXERCISE_DATABASE.find((exercise) =>
    normalizedCandidates.includes(normalizeExerciseKey(exercise.id)) ||
    normalizedCandidates.includes(normalizeExerciseKey(exercise.name))
  );
  if (exactMatch) return exactMatch;

  for (const [actualId, aliasList] of Object.entries(EXERCISE_ALIASES)) {
    const actualDefinition = EXERCISE_DATABASE.find((exercise) => exercise.id === actualId);
    if (!actualDefinition) continue;

    const hasAliasMatch = normalizedCandidates.some((candidate) =>
      aliasList.some((alias) => normalizeExerciseKey(alias) === candidate)
    );

    if (hasAliasMatch) return actualDefinition;
  }

  return null;
}

export function resolveExerciseId(exerciseId?: string, exerciseName?: string): string | null {
  return resolveExerciseDefinition(exerciseId, exerciseName)?.id ?? null;
}

export function entryMatchesExercise(entry: { exerciseId?: string; exerciseName?: string; name?: string }, exerciseId: string): boolean {
  const matchedDefinition = resolveExerciseDefinition(entry.exerciseId, entry.exerciseName ?? entry.name);
  return matchedDefinition?.id === exerciseId;
}
