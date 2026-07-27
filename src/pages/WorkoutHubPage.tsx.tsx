import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { WEEKLY_CATEGORIES, EXERCISE_DATABASE } from "@/db/workoutData";
import {
  Dumbbell,
  Calendar,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Target,
  Sparkles,
} from "lucide-react";

export default function WorkoutHubPage() {
  const navigate = useNavigate();

  // Retrieve sessions from Dexie for live stats display
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  // Calculate unique completed exercises count
  const completedExerciseIds = new Set<string>();
  sessions.forEach((s) => {
    s.exercises?.forEach((ex: any) => {
      if (ex.exerciseId) completedExerciseIds.add(ex.exerciseId);
    });
  });

  const weeklyExercises = EXERCISE_DATABASE.filter(
    (ex) => ex.tier === "weekly"
  );
  const totalWeekly = weeklyExercises.length || 1;
  const completedWeekly = weeklyExercises.filter((ex) =>
    completedExerciseIds.has(ex.id)
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#EAE3DE] pb-6 gap-4">
        <div className="space-y-1">
          <span className="text-xs font-serif italic text-[#8C7B75]">
            Training Regimen & Systems
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-[#1A1817] tracking-tight">
            Workout Hub
          </h1>
        </div>
        <p className="text-xs text-[#8C7B75] max-w-xs md:text-right">
          Choose a routine track to jump straight into your workouts or log target categories.
        </p>
      </header>

      {/* Main Training Tracks (Hero Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Track 1: Weekly Gym Split */}
        <div
          onClick={() => navigate("/weekly")}
          className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#6B2D3A] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 bg-[#6B2D3A] text-white rounded-2xl shadow-sm">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2E8EA] text-[#6B2D3A] px-3 py-1 rounded-full border border-[#D9B7BE]/40">
                5 Days / Week
              </span>
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors">
                Weekly Gym Plan
              </h2>
              <p className="text-xs text-[#8C7B75] mt-1 leading-relaxed">
                Structured progressive overload across Push, Pull, Lower Body, and Core.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE3DE]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-[#1A1817]">
                Progress:
              </span>
              <span className="text-xs font-mono text-[#6B2D3A] font-semibold">
                {completedWeekly} / {totalWeekly} logged
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#F2E8EA] flex items-center justify-center text-[#6B2D3A] group-hover:bg-[#6B2D3A] group-hover:text-white transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Track 2: High-Intensity Class Day */}
        <div
          onClick={() => navigate("/class-day")}
          className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#6B2D3A] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 bg-[#F2E8EA] text-[#6B2D3A] rounded-2xl">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F8F5F2] text-[#8C7B75] px-3 py-1 rounded-full border border-[#EAE3DE]">
                On-Demand
              </span>
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors">
                High-Intensity Class Day
              </h2>
              <p className="text-xs text-[#8C7B75] mt-1 leading-relaxed">
                Low-fatigue routines tailored for active recovery, balance, and quick energy burn.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE3DE]/60 flex items-center justify-between">
            <span className="text-xs font-serif italic text-[#8C7B75]">
              Lightweight & Recovery Focused
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5F2] border border-[#EAE3DE] flex items-center justify-center text-[#8C7B75] group-hover:bg-[#6B2D3A] group-hover:text-white group-hover:border-[#6B2D3A] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#6B2D3A]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">
              Quick Access Categories
            </h2>
          </div>
          <span className="text-xs text-[#8C7B75] italic">Direct Jump</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WEEKLY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/weekly?category=${cat.id}`)}
              className="bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#6B2D3A] p-4 rounded-2xl text-left transition-all shadow-xs group flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-serif font-bold text-[#1A1817] group-hover:text-[#6B2D3A] transition-colors block">
                  {cat.name}
                </span>
                <span className="text-[10px] text-[#8C7B75]">
                  View Split
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7B75] group-hover:translate-x-0.5 group-hover:text-[#6B2D3A] transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Analytics & History Navigation Banner */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F2E8EA] text-[#6B2D3A] rounded-2xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-serif font-bold text-sm text-[#1A1817]">
              Weekly Progress & History Logs
            </h3>
            <p className="text-xs text-[#8C7B75]">
              Review past workout logs, volume totals, and historical achievements.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/weekly-summary")}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#6B2D3A] text-white text-xs font-medium hover:bg-[#58242F] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>View Summary</span>
        </button>
      </div>
    </div>
  );
}