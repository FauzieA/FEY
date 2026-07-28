import { Bell, Zap } from "lucide-react";

interface DashboardHeaderProps {
  isClassDayMode: boolean;
  setIsClassDayMode: (mode: boolean) => void;
}

export default function DashboardHeader({
  isClassDayMode,
  setIsClassDayMode,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between pt-2">
      <div>
        <span className="text-xs md:text-sm text-[#8C7B75] font-serif italic">
          Weekly Overview
        </span>
        <h1 className="text-3xl md:text-4xl font-serif text-[#6B2D3A] tracking-wider font-normal uppercase">
          FEY
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsClassDayMode(!isClassDayMode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            isClassDayMode
              ? "bg-[#6B2D3A] text-[#F8F5F2] border-[#6B2D3A] shadow-md shadow-[#6B2D3A]/20"
              : "bg-[#FFFCFA] text-[#8C7B75] border-[#EAE3DE] hover:border-[#6B2D3A]"
          }`}
        >
          <Zap
            className={`w-4 h-4 ${
              isClassDayMode ? "fill-current text-[#F8F5F2]" : ""
            }`}
          />
          <span>{isClassDayMode ? "Class Day Mode" : "Standard Gym"}</span>
        </button>

        <button className="p-2.5 rounded-full bg-[#FFFCFA] border border-[#EAE3DE] text-[#6B2D3A] shadow-sm hover:bg-[#F2E8EA]/50 transition cursor-pointer">
          <Bell className="w-5 h-5 stroke-[1.75]" />
        </button>
      </div>
    </header>
  );
}