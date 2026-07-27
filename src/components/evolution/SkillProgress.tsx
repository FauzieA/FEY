import { Check, Circle } from "lucide-react";

interface SkillStep {
  label: string;
  status: "completed" | "current" | "upcoming";
}

interface SkillTree {
  id: string;
  title: string;
  percentage: number;
  thenText: string;
  nowText: string;
  steps: SkillStep[];
}

const SKILL_TREES: SkillTree[] = [
  {
    id: "pull-up",
    title: "Unassisted Pull-up",
    percentage: 68,
    thenText: "92kg Assistance",
    nowText: "70kg Assistance",
    steps: [
      { label: "Band/Machine 92kg", status: "completed" },
      { label: "Machine 85kg", status: "completed" },
      { label: "Machine 70kg", status: "current" },
      { label: "Negative Pull-ups", status: "upcoming" },
      { label: "First Strict Rep", status: "upcoming" },
    ],
  },
  {
    id: "push-up",
    title: "Full Floor Push-up",
    percentage: 60,
    thenText: "Wall Push-ups",
    nowText: "Incline Push-ups",
    steps: [
      { label: "Wall Push-ups", status: "completed" },
      { label: "Bench Push-ups", status: "completed" },
      { label: "Incline Push-ups", status: "current" },
      { label: "Knee Push-ups", status: "upcoming" },
      { label: "Full Floor Push-ups", status: "upcoming" },
    ],
  },
  {
    id: "deep-squat",
    title: "Deep Squat Hold",
    percentage: 82,
    thenText: "15s sec Hold",
    nowText: "45s sec Hold",
    steps: [
      { label: "15s Assisted Hold", status: "completed" },
      { label: "30s Assisted Hold", status: "completed" },
      { label: "45s Bodyweight Hold", status: "completed" },
      { label: "60s Unassisted Hold", status: "current" },
      { label: "Deep Weighted Hold", status: "upcoming" },
    ],
  },
  {
    id: "grip-hang",
    title: "Grip & Dead Hang",
    percentage: 70,
    thenText: "0 sec (Fell instantly)",
    nowText: "21 sec Hold",
    steps: [
      { label: "0s Hold", status: "completed" },
      { label: "10s Hold", status: "completed" },
      { label: "20s Hold", status: "completed" },
      { label: "45s Hold", status: "current" },
      { label: "1 min Hold", status: "upcoming" },
    ],
  },
  {
    id: "core-stability",
    title: "Core Stability",
    percentage: 65,
    thenText: "Basic Hold",
    nowText: "Advanced Control",
    steps: [
      { label: "Forearm Plank 30s", status: "completed" },
      { label: "Forearm Plank 60s", status: "completed" },
      { label: "Plank 90s", status: "current" },
      { label: "Side Plank 30s", status: "upcoming" },
      { label: "Hanging Knee Raise", status: "upcoming" },
    ],
  },
];

export default function SkillProgress() {
  return (
    <>
      {SKILL_TREES.map((skill) => (
        <div
          key={skill.id}
          className="bg-white rounded-3xl p-5 border border-[#EAE3DE] shadow-xs flex flex-col justify-between space-y-5 hover:border-[#D9B7BE] transition-all"
        >
          {/* Skill Card Header */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif font-bold text-[#1A1817] text-base leading-snug">
                {skill.title}
              </h3>
              
              {/* Circular Progress Badge */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF8F6] border border-[#EAE3DE] shrink-0 ml-2">
                <span className="font-serif font-bold text-xs text-[#6B2D3A]">
                  {skill.percentage}%
                </span>
              </div>
            </div>

            {/* Baseline Context */}
            <p className="text-[11px] text-[#8C7B75] font-sans">
              <span className="font-semibold text-[#1A1817]">Then:</span> {skill.thenText}
              <br />
              <span className="font-semibold text-[#6B2D3A]">Now:</span> {skill.nowText}
            </p>
          </div>

          {/* Skill Tree Nodes */}
          <div className="space-y-2.5 pt-2 border-t border-[#F8F5F2]">
            {skill.steps.map((step, idx) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-xs transition-colors"
                >
                  {/* Status Indicator Icon */}
                  {isCompleted && (
                    <div className="w-4 h-4 rounded-full bg-[#2E6B40]/10 text-[#2E6B40] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {isCurrent && (
                    <div className="w-4 h-4 rounded-full bg-[#6B2D3A] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                  )}

                  {!isCompleted && !isCurrent && (
                    <div className="w-4 h-4 rounded-full border border-[#EAE3DE] flex items-center justify-center shrink-0">
                      <Circle className="w-2 h-2 text-[#EAE3DE]" />
                    </div>
                  )}

                  {/* Node Label */}
                  <span
                    className={`font-sans tracking-tight ${
                      isCompleted
                        ? "text-[#8C7B75] line-through decoration-[#8C7B75]/40"
                        : isCurrent
                        ? "text-[#1A1817] font-bold"
                        : "text-[#8C7B75]/70"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}