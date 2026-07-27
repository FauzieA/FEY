import { Sparkles, Compass, Clock, ArrowUpRight } from "lucide-react";

interface Projection {
  id: string;
  milestone: string;
  estimatedTime: string;
  daysLeft: number;
  progressPercent: number;
  confidence: "High" | "Very High" | "Moderate";
  keyDriver: string;
}

const PROJECTIONS: Projection[] = [
  {
    id: "pullup",
    milestone: "First Strict Bodyweight Pull-up",
    estimatedTime: "~18 Days (Mid-August)",
    daysLeft: 18,
    progressPercent: 78,
    confidence: "Very High",
    keyDriver: "Consistent -2kg/week machine assistance drop over past 30 days",
  },
  {
    id: "pushup",
    milestone: "5 Strict Floor Push-ups (Full Depth)",
    estimatedTime: "~28 Days (Late August)",
    daysLeft: 28,
    progressPercent: 62,
    confidence: "High",
    keyDriver: "Incline push-up capacity increased from 8 to 15 quality reps",
  },
  {
    id: "hang",
    milestone: "45-Second Dead Hang Hold",
    estimatedTime: "~12 Days (Early August)",
    daysLeft: 12,
    progressPercent: 88,
    confidence: "Very High",
    keyDriver: "Grip endurance increasing by ~3.5 seconds per session",
  },
];

export default function Predictions() {
  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-[#EAE3DE] shadow-xs space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F8F5F2] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#6B2D3A]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B2D3A]">
              Predictive Trajectory
            </span>
          </div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1A1817]">
            MILESTONE HORIZON
          </h2>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            Algorithmic projections calculated from your current adaptation rate
          </p>
        </div>

        <div className="bg-[#FAF8F6] px-4 py-2 rounded-2xl border border-[#EAE3DE] flex items-center gap-2 self-start sm:self-auto">
          <Compass className="w-4 h-4 text-[#8C7B75]" />
          <span className="text-xs font-serif font-medium text-[#1A1817]">
            3 Breakthroughs on Deck
          </span>
        </div>
      </div>

      {/* PROJECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PROJECTIONS.map((item) => (
          <div
            key={item.id}
            className="bg-[#FAF8F6] rounded-3xl p-6 border border-[#EAE3DE] flex flex-col justify-between space-y-5 hover:border-[#D9B7BE] transition-all"
          >
            <div>
              {/* Top Meta */}
              <div className="flex justify-between items-center mb-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#6B2D3A]/10 text-[#6B2D3A]">
                  <Clock className="w-3 h-3" /> {item.estimatedTime}
                </span>
                <span className="text-[10px] font-mono text-[#8C7B75]">
                  Confidence: <strong className="text-[#1A1817]">{item.confidence}</strong>
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif font-bold text-lg text-[#1A1817] leading-snug mb-4">
                {item.milestone}
              </h3>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8C7B75]">Readiness</span>
                  <span className="font-bold text-[#6B2D3A]">{item.progressPercent}%</span>
                </div>
                <div className="w-full bg-[#EAE3DE] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6B2D3A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Driver Insight */}
            <div className="pt-3 border-t border-[#EAE3DE]/60 text-xs text-[#8C7B75]">
              <span className="font-semibold text-[#1A1817] block mb-0.5 flex items-center gap-1">
                Primary Driver <ArrowUpRight className="w-3 h-3 text-[#6B2D3A]" />
              </span>
              <p className="italic leading-relaxed">{item.keyDriver}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}