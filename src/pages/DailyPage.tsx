import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";

import { EXERCISE_DATABASE, type ExerciseDefinition } from "@/db/workoutData";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sun,
  RotateCcw,
  CheckSquare,
  Square,
} from "lucide-react";

export default function DailyPage() {
  const navigate = useNavigate();
  const todayStr = new Date().toDateString();
  const storageKey = `fey_daily_selected_ids_${new Date().toDateString()}`;

  // Selected exercise IDs for today's workout plan (persisted in localStorage)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      "day_chin_tuck",
      "day_wall_angels",
      "day_farmer_carry",
      "day_deep_squat",
    ];
  });

  // Save changes to localStorage whenever selectedIds changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selectedIds));
  }, [selectedIds, storageKey]);

  // LIVE QUERY: Read completed sessions from Dexie
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  const todayCompletedIds = new Set<string>();
  sessions.forEach((s) => {
    if (new Date(s.completedAt).toDateString() === todayStr) {
      s.exercises?.forEach((ex: any) => {
        if (ex.exerciseId) todayCompletedIds.add(ex.exerciseId);
      });
    }
  });

  // Toggle selection for optional exercises
  const toggleExerciseSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Undo finished session
  const handleUndoWorkout = async (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation();
    const targetSession = sessions.find((s) => {
      const isToday = new Date(s.completedAt).toDateString() === todayStr;
      return isToday && s.exercises?.some((ex: any) => ex.exerciseId === exerciseId);
    });

    if (targetSession?.id) {
      await db.sessions.delete(targetSession.id);
    }
  };

  // Filter exercises by category
  const postureList = EXERCISE_DATABASE.filter((ex) => ex.category === "posture");
  const gripList = EXERCISE_DATABASE.filter((ex) => ex.category === "grip");
  const skillList = EXERCISE_DATABASE.filter((ex) => ex.category === "movement_skill");

  // Track active exercises for today's queue
  const activePlan = EXERCISE_DATABASE.filter((ex) => selectedIds.includes(ex.id));
  const completedCount = activePlan.filter((ex) => todayCompletedIds.has(ex.id)).length;

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-serif text-[#1A1817]">Daily Workouts</h1>
          <p className="text-xs text-[#8C7B75] italic">Posture, Grip & Movement Skills</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress Card */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
              Today's Queue Progress
            </span>
            <div className="font-serif font-bold text-lg text-[#1A1817]">
              {completedCount} of {activePlan.length} Selected Completed
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Core Posture (Always Included) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C7B75] px-1">
          1. Core Posture Routine (Daily Required)
        </h2>
        {postureList.map((ex) => renderExerciseCard(ex))}
      </div>

      {/* SECTION 2: Grip Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C7B75]">
            2. Grip Work (Choose 1 or More)
          </h2>
        </div>
        {gripList.map((ex) => renderExerciseCard(ex, true))}
      </div>

      {/* SECTION 3: Movement Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C7B75]">
            3. Movement Skill Rotation (Choose 1 or More)
          </h2>
        </div>
        {skillList.map((ex) => renderExerciseCard(ex, true))}
      </div>
    </div>
  );

  // Helper render function for exercise items
  function renderExerciseCard(ex: ExerciseDefinition, isOptional = false) {
    const isSelected = selectedIds.includes(ex.id);
    const isDone = todayCompletedIds.has(ex.id);
    const returnUrl = encodeURIComponent(`/daily`);

    return (
      <div
        key={ex.id}
        onClick={() => {
          if (isSelected) {
            navigate(`/workout/session?id=${ex.id}&from=${returnUrl}`);
          } else {
            toggleExerciseSelection(ex.id);
          }
        }}
        className={`border rounded-3xl p-4 transition-all cursor-pointer flex items-center justify-between group ${
          isSelected
            ? "bg-[#FFFCFA] border-[#EAE3DE] hover:border-[#D9B7BE] shadow-sm"
            : "bg-[#F8F5F2]/60 border-dashed border-[#EAE3DE] opacity-60"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Option Checkbox */}
          {isOptional && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExerciseSelection(ex.id);
              }}
              className="p-1 text-[#6B2D3A] hover:scale-110 transition-transform cursor-pointer"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-[#6B2D3A]" />
              ) : (
                <Square className="w-5 h-5 text-[#8C7B75]" />
              )}
            </button>
          )}

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors">
                {ex.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8C7B75]">
              <span>{ex.defaultSets} sets</span>
              <span>•</span>
              <span>{ex.repRange}</span>
            </div>
          </div>
        </div>

        {/* Completion Actions */}
        {isSelected ? (
          <div className="flex items-center gap-2">
            {isDone ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleUndoWorkout(e, ex.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F2E8EA] hover:bg-[#E2CFD3] text-[#6B2D3A] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
                <CheckCircle2 className="w-6 h-6 text-[#6B2D3A]" />
              </div>
            ) : (
              <Circle className="w-6 h-6 text-[#D9B7BE]" />
            )}
            <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
          </div>
        ) : (
          <span className="text-xs font-semibold text-[#8C7B75] bg-[#EAE3DE]/50 px-2.5 py-1 rounded-xl">
            Tap to add
          </span>
        )}
      </div>
    );
  }
}