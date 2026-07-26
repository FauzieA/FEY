import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Calendar,
  Zap,
  Layers,
  ChevronRight,
  Sun,
} from "lucide-react";

export default function WorkoutHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-center space-y-1">
        <h1 className="text-2xl md:text-3xl font-serif text-[#1A1817]">
          Workout Hub
        </h1>
        <p className="text-xs text-[#8C7B75] italic">
          Select a routine tier to view your exercises
        </p>
      </header>

      {/* Primary Section Cards */}
      <div className="space-y-3">
        {/* Daily Reset Card */}
        <button
          onClick={() => navigate("/daily")}
          className="w-full bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#6B2D3A] p-5 rounded-3xl text-left transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#1A1817]">
                Daily Exercises
              </h2>
              <p className="text-xs text-[#8C7B75]">
                Resets daily • Posture, habits & skill work
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8C7B75] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Weekly Plan Card */}
        <button
          onClick={() => navigate("/weekly")}
          className="w-full bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#6B2D3A] p-5 rounded-3xl text-left transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#1A1817]">
                Weekly Gym Plan (5 Days)
              </h2>
              <p className="text-xs text-[#8C7B75]">
                Resets weekly • Categorized strength & core split
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8C7B75] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* High-Intensity Class Days Card */}
        <button
          onClick={() => navigate("/class-day")}
          className="w-full bg-[#FFFCFA] border border-[#EAE3DE] hover:border-[#6B2D3A] p-5 rounded-3xl text-left transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F2E8EA] rounded-2xl text-[#6B2D3A]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#1A1817]">
                High-Intensity Class Day
              </h2>
              <p className="text-xs text-[#8C7B75]">
                On-Demand • Low-fatigue mobility, balance & recovery
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8C7B75] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* History Summary Link */}
      <div className="pt-4 text-center">
        <button
          onClick={() => navigate("/weekly-summary")}
          className="text-xs font-semibold text-[#6B2D3A] hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>View Weekly Summary History</span>
        </button>
      </div>
    </div>
  );
}
