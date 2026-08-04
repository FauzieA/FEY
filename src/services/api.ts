import { toISODate } from '@/utils/date';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fey-backend-g4dz.onrender.com/api';

async function fetchWithoutAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  return await fetch(url, { ...options, headers });
}

// Convert snake_case to camelCase
function toCamelCase<T>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase) as T;
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key: string) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  });
  return result as T;
}

// Convert camelCase to snake_case
function toSnakeCase(obj: any, preserveInnerKeys = false): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => toSnakeCase(item, preserveInnerKeys));
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key: string) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const nextPreserveInnerKeys = preserveInnerKeys || key === 'attributes';
    result[snakeKey] = toSnakeCase(obj[key], nextPreserveInnerKeys);
  });
  return result;
}

function buildRequestBody(endpoint: string, body: any): any {
  const normalized = toSnakeCase(body);

  if (normalized === null || normalized === undefined) {
    return normalized;
  }

  const path = endpoint.toLowerCase();

  if (path.includes('/workouts')) {
    const exercises = Array.isArray(normalized.exercises) ? normalized.exercises : [];
    return {
      plan_id: normalized.plan_id ?? normalized.planId ?? null,
      plan_title: normalized.plan_title ?? normalized.planTitle ?? null,
      started_at: normalized.started_at ?? normalized.startedAt ?? normalized.completed_at ?? normalized.completedAt ?? null,
      completed_at: normalized.completed_at ?? normalized.completedAt ?? normalized.started_at ?? normalized.startedAt ?? null,
      duration_seconds: normalized.duration_seconds ?? normalized.durationSeconds ?? (typeof normalized.duration_minutes === 'number' ? normalized.duration_minutes * 60 : 0),
      duration_minutes: normalized.duration_minutes ?? normalized.durationMinutes ?? Math.max(0, Math.round((normalized.duration_seconds ?? normalized.durationSeconds ?? 0) / 60)),
      total_sets_completed: normalized.total_sets_completed ?? normalized.totalSetsCompleted ?? exercises.reduce((count: number, exercise: any) => count + (Array.isArray(exercise?.sets) ? exercise.sets.length : 0), 0),
      total_reps_completed: normalized.total_reps_completed ?? normalized.totalRepsCompleted ?? exercises.reduce((count: number, exercise: any) => count + (Array.isArray(exercise?.sets) ? exercise.sets.reduce((sum: number, set: any) => sum + (set?.reps ?? 0), 0) : 0), 0),
      average_rpe: normalized.average_rpe ?? normalized.averageRpe ?? 0,
      session_rating: normalized.session_rating ?? normalized.sessionRating ?? null,
      xp_earned: normalized.xp_earned ?? normalized.xpEarned ?? 0,
      completed: normalized.completed ?? true,
      exercises: exercises.map((exercise: any) => ({
        exercise_id: exercise.exercise_id ?? exercise.exerciseId ?? null,
        exercise_name: exercise.exercise_name ?? exercise.exerciseName ?? exercise.name ?? null,
        category: exercise.category ?? null,
        primary_muscle: exercise.primary_muscle ?? exercise.primaryMuscle ?? null,
        notes: exercise.notes ?? null,
        sets: (Array.isArray(exercise.sets) ? exercise.sets : []).map((set: any) => ({
          set_num: set.set_num ?? set.setNum ?? 1,
          reps: set.reps ?? 0,
          weight_kg: set.weight_kg ?? set.weightKg ?? set.weight ?? 0,
          duration_sec: set.duration_sec ?? set.durationSec ?? 0,
          set_type: set.set_type ?? set.setType ?? 'working',
          rpe: set.rpe ?? null,
          estimated_1rm: set.estimated_1rm ?? set.estimated1rm ?? 0,
          rest_seconds_after: set.rest_seconds_after ?? set.restSecondsAfter ?? 0,
          completed: set.completed ?? true,
        })),
      })),
    };
  }

  if (path.includes('/personal-records')) {
    const dateValue = normalized.date ?? normalized.Date ?? null;
    return {
      exercise_id: normalized.exercise_id ?? normalized.exerciseId ?? null,
      weight: normalized.weight ?? 0,
      reps: normalized.reps ?? null,
      date: typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
        ? dateValue
        : dateValue
          ? toISODate(dateValue)
          : null,
    };
  }

  if (path.includes('/adhkar')) {
    const completedItems = Array.isArray(normalized.completed_items)
      ? normalized.completed_items
      : Array.isArray(normalized.completeditems)
        ? normalized.completeditems
        : [];

    return {
      ...normalized,
      morning: completedItems.some((item: string) => item.startsWith('morning_')),
      evening: completedItems.some((item: string) => item.startsWith('evening_')),
      after_prayer: normalized.after_prayer ?? normalized.afterPrayer ?? false,
      istighfar_count: normalized.istighfar_count ?? normalized.istighfarCount ?? 0,
      completed_items: undefined,
      completeditems: undefined,
    };
  }

  if (path.includes('/books')) {
    return {
      title: normalized.title,
      author: normalized.author,
      total_pages: normalized.total_pages,
      current_page: normalized.current_page,
      status: normalized.status,
      started_at: normalized.started_at,
      finished_at: normalized.finished_at,
      rating: normalized.rating,
      notes: normalized.notes,
      series_name: normalized.series_name,
      expected_release_date: normalized.expected_release_date,
    };
  }

  if (path.includes('/sleep-logs')) {
    return {
      date: normalized.date,
      hours: normalized.hours,
      quality: normalized.quality,
      notes: normalized.notes,
    };
  }

  if (path.includes('/perfume-versions')) {
    const payload = { ...normalized };
    if (payload.formula_id !== undefined && payload.formula === undefined) {
      payload.formula = payload.formula_id;
    }
    delete payload.formula_id;
    return payload;
  }

  if (path.includes('/savings-entries')) {
    const payload = { ...normalized };
    if (payload.goal_id !== undefined && payload.goal === undefined) {
      payload.goal = payload.goal_id;
    }
    delete payload.goal_id;
    delete payload.currency;
    delete payload.location;
    return payload;
  }

  if (path.includes('/call-reminders')) {
    const payload = { ...normalized };
    if (payload.person_id !== undefined && payload.person === undefined) {
      payload.person = payload.person_id;
    }
    delete payload.person_id;
    return payload;
  }

  if (path.includes('/reading-sessions')) {
    const payload = { ...normalized };
    if (payload.book_id !== undefined && payload.book === undefined) {
      payload.book = payload.book_id;
    }
    delete payload.book_id;
    return payload;
  }

  return normalized;
}

// Generic API methods
export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetchWithoutAuth(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.status}`);
    const data = await response.json();
    return toCamelCase<T>(data);
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetchWithoutAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(buildRequestBody(endpoint, body)),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed: ${response.status}`);
    const data = await response.json();
    return toCamelCase<T>(data);
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetchWithoutAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(buildRequestBody(endpoint, body)),
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed: ${response.status}`);
    const data = await response.json();
    return toCamelCase<T>(data);
  },

  async patch<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetchWithoutAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      body: JSON.stringify(buildRequestBody(endpoint, body)),
    });
    if (!response.ok) throw new Error(`PATCH ${endpoint} failed: ${response.status}`);
    const data = await response.json();
    return toCamelCase<T>(data);
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetchWithoutAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
  },

  isAuthenticated(): boolean {
    return true;
  },
};
