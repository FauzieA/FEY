import { useState } from "react";
import { Check, ShieldCheck, Dumbbell, Award, X } from "lucide-react";

interface DailyHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyHabitsModal({
  isOpen,
  onClose,
}: DailyHabitsModalProps) {
  const [completedHabits, setCompletedHabits] = useState<
    Record<string, boolean>
  >({});

  if (!isOpen) return null;

  const toggleHabit = (id: string) => {
    setCompletedHabits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1817]/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-[36px] p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-3">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#1A1817]">
              Daily Maintenance Habits
            </h2>
            <p className="text-xs text-[#8C7B75]">
              Quick maintenance routine before leaving the gym
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C7B75] hover:text-[#1A1817]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Posture Section (Every Visit) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B2D3A]">
            <ShieldCheck className="w-4 h-4" />
            <span>Posture (Every Visit)</span>
          </div>
          {["Chin Tucks (2x12)", "Wall Angels (2x10)"].map((habit) => (
            <button
              key={habit}
              onClick={() => toggleHabit(habit)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all ${
                completedHabits[habit]
                  ? "bg-[#F2E8EA] border-[#6B2D3A] text-[#6B2D3A]"
                  : "bg-[#F8F5F2] border-[#EAE3DE] text-[#1A1817]"
              }`}
            >
              <span>{habit}</span>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  completedHabits[habit]
                    ? "bg-[#6B2D3A] text-white"
                    : "border border-[#EAE3DE]"
                }`}
              >
                {completedHabits[habit] && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 2. Grip Training Section (Pick 1 - 2x/Week) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6B2D3A]">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" />
              <span>Grip Training (Pick 1 - Min 2x/Wk)</span>
            </div>
          </div>
          {["Farmer Carry", "Plate Hold", "Assisted Dead Hang"].map((grip) => (
            <button
              key={grip}
              onClick={() => toggleHabit(grip)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all ${
                completedHabits[grip]
                  ? "bg-[#F2E8EA] border-[#6B2D3A] text-[#6B2D3A]"
                  : "bg-[#F8F5F2] border-[#EAE3DE] text-[#1A1817]"
              }`}
            >
              <span>{grip}</span>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  completedHabits[grip]
                    ? "bg-[#6B2D3A] text-white"
                    : "border border-[#EAE3DE]"
                }`}
              >
                {completedHabits[grip] && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 3. Skill Practice Section (Pick 1 - Every Visit) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B2D3A]">
            <Award className="w-4 h-4" />
            <span>Skill Practice (Pick 1 - Every Visit)</span>
          </div>
          {[
            "Plank Hold",
            "Push-up Technique",
            "Pull-up Technique",
            "Deep Squat Hold",
          ].map((skill) => (
            <button
              key={skill}
              onClick={() => toggleHabit(skill)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all ${
                completedHabits[skill]
                  ? "bg-[#F2E8EA] border-[#6B2D3A] text-[#6B2D3A]"
                  : "bg-[#F8F5F2] border-[#EAE3DE] text-[#1A1817]"
              }`}
            >
              <span>{skill}</span>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  completedHabits[skill]
                    ? "bg-[#6B2D3A] text-white"
                    : "border border-[#EAE3DE]"
                }`}
              >
                {completedHabits[skill] && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#6B2D3A] text-white py-3.5 rounded-2xl text-xs font-semibold shadow-md"
        >
          Save Habits & Finish Visit
        </button>
      </div>
    </div>
  );
}
