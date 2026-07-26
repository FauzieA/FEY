import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Sparkles,
  Dumbbell,
  Flame,
  ShieldCheck,
} from "lucide-react";

export default function CharacterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 sm:p-6 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors active:scale-95"
          aria-label="Back to Dashboard"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A1817] font-normal">
            Athletic Identity
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-[#8C7B75] italic">
            Capability • Mobility • Aesthetics
          </p>
        </div>

        <div className="w-10" />
      </header>

      {/* Profile Card */}
      <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl sm:rounded-[36px] p-4 sm:p-6 md:p-8 shadow-sm text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2E8EA] border-2 border-[#6B2D3A] mx-auto flex items-center justify-center text-2xl sm:text-3xl text-[#6B2D3A]">
          🌸
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#1A1817]">
            Adaptive Athlete
          </h2>
          <p className="text-xs text-[#8C7B75]">
            Balancing High-Intensity Classes & Progressive Overload
          </p>
        </div>

        {/* Stats Row - Stacked on tiny screens, 3-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-[#EAE3DE] py-4 my-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#EAE3DE]">
          <div className="pt-1 sm:pt-0">
            <div className="text-[#8C7B75] uppercase font-bold text-[10px]">
              Weekly Goals
            </div>
            <div className="text-base sm:text-lg font-serif font-bold text-[#6B2D3A]">
              10 Categories
            </div>
          </div>
          <div className="pt-2 sm:pt-0">
            <div className="text-[#8C7B75] uppercase font-bold text-[10px]">
              Core Model
            </div>
            <div className="text-base sm:text-lg font-serif font-bold text-[#1A1817]">
              3 × 8–12
            </div>
          </div>
          <div className="pt-2 sm:pt-0">
            <div className="text-[#8C7B75] uppercase font-bold text-[10px]">
              Gym Visits
            </div>
            <div className="text-base sm:text-lg font-serif font-bold text-[#6B2D3A]">
              Posture + Skill
            </div>
          </div>
        </div>

        {/* Philosophy Core */}
        <div className="text-left space-y-3 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">
            CORE ATHLETIC PILLARS
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl flex items-center gap-3">
              <Dumbbell className="w-5 h-5 text-[#6B2D3A] shrink-0" />
              <div>
                <div className="font-serif font-bold text-[#1A1817]">
                  Progressive Strength
                </div>
                <div className="text-[#8C7B75] text-[10px]">
                  Heavy compound lifts with weight increases at 12 reps
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#6B2D3A] shrink-0" />
              <div>
                <div className="font-serif font-bold text-[#1A1817]">
                  Class Adaptability
                </div>
                <div className="text-[#8C7B75] text-[10px]">
                  Dedicated mode for T25, Spinning, and Circuit days
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#6B2D3A] shrink-0" />
              <div>
                <div className="font-serif font-bold text-[#1A1817]">
                  Habit Integrity
                </div>
                <div className="text-[#8C7B75] text-[10px]">
                  Chin tucks, wall angels, and grip practice every visit
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#6B2D3A] shrink-0" />
              <div>
                <div className="font-serif font-bold text-[#1A1817]">
                  Full Body Mobility
                </div>
                <div className="text-[#8C7B75] text-[10px]">
                  Deep squat holds, 90/90 hip stretches, and split work
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
