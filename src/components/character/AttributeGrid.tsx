import { Shield } from "lucide-react";
import { type CharacterStats } from "@/types/character";

interface AttributeGridProps {
  stats: CharacterStats;
}

export default function AttributeGrid({ stats }: AttributeGridProps) {
  const attributes = [
    { name: "Strength", level: stats.strengthLevel },
    { name: "Athleticism", level: stats.athleticismLevel },
    { name: "Mobility", level: stats.mobilityLevel },
    { name: "Balance", level: stats.balanceLevel },
    { name: "Endurance", level: stats.enduranceLevel },
    { name: "Grip", level: stats.gripLevel },
    { name: "Core", level: stats.coreLevel },
  ];

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
      <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Attributes Breakdown
          </span>
          <h2 className="font-serif font-bold text-xl text-[#1A1817]">
            Overall Attributes
          </h2>
        </div>
        <Shield className="w-5 h-5 text-[#6B2D3A]" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {attributes.map((attr, idx) => (
          <div 
            key={idx} 
            className="bg-[#FAF8F6] border border-[#EAE3DE] p-4 rounded-2xl flex items-center justify-between shadow-2xs hover:border-[#D9B7BE] transition-all"
          >
            <span className="font-serif font-bold text-sm text-[#1A1817]">
              {attr.name}
            </span>
            <span className="font-mono font-bold text-sm bg-white border border-[#EAE3DE] px-3 py-1 rounded-xl text-[#6B2D3A] shadow-2xs">
              Lv.{attr.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}