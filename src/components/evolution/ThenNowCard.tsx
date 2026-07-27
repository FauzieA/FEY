import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface ThenNowCardProps {
  title: string;
  thenVal: string;
  nowVal: string;
  metric: string;
  description: string;
  trend?: "up" | "down";
  sparklinePath?: string; // Optional custom SVG path
}

export default function ThenNowCard({
  title,
  thenVal,
  nowVal,
  metric,
  description,
  trend = "up",
}: ThenNowCardProps) {
  const isPositiveGrowth = trend === "up";

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE3DE] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9B7BE] transition-all">
      {/* Title */}
      <div>
        <h3 className="font-serif font-semibold text-[#1A1817] text-base mb-1">
          {title}
        </h3>
      </div>

      {/* Baseline Comparison */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            THEN
          </span>
          <span className="font-serif font-bold text-lg text-[#8C7B75]">
            {thenVal}
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-[#D9B7BE]" />

        <div className="text-right">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#6B2D3A] font-bold block">
            NOW
          </span>
          <span className="font-serif font-bold text-2xl text-[#1A1817]">
            {nowVal}
          </span>
        </div>
      </div>

      {/* Micro Sparkline Placeholder (Clean vector curve) */}
      <div className="w-full h-8 flex items-center justify-center pt-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
          <path
            d={
              isPositiveGrowth
                ? "M 0 20 Q 25 18, 50 12 T 100 4"
                : "M 0 4 Q 25 8, 50 15 T 100 22"
            }
            fill="none"
            stroke="#6B2D3A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy={isPositiveGrowth ? "4" : "22"}
            r="3.5"
            fill="#6B2D3A"
          />
        </svg>
      </div>

      {/* Footer Metric & Story */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F8F5F2]">
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
            isPositiveGrowth
              ? "bg-[#2E6B40]/10 text-[#2E6B40]"
              : "bg-[#6B2D3A]/10 text-[#6B2D3A]"
          }`}
        >
          {isPositiveGrowth ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {metric}
        </span>
        <span className="text-[11px] text-[#8C7B75] italic text-right truncate max-w-[140px]">
          {description}
        </span>
      </div>
    </div>
  );
}