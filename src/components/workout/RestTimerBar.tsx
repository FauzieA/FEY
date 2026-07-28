import { Timer, Play, Pause, RotateCcw } from "lucide-react";

interface RestTimerBarProps {
  restSeconds: number;
  isRestActive: boolean;
  onToggleRest: () => void;
  onResetRest: () => void;
}

export default function RestTimerBar({
  restSeconds,
  isRestActive,
  onToggleRest,
  onResetRest,
}: RestTimerBarProps) {
  return (
    <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Timer className="w-5 h-5 text-[#6B2D3A]" />
        <span className="text-xs font-serif font-bold text-[#1A1817]">
          Rest Timer:
        </span>
        <span className="font-mono text-base font-bold text-[#6B2D3A]">
          {Math.floor(restSeconds / 60)}:
          {String(restSeconds % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRest}
          className="p-2 rounded-xl bg-[#F2E8EA] text-[#6B2D3A] hover:bg-[#D9B7BE]/40 transition cursor-pointer"
        >
          {isRestActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={onResetRest}
          className="p-2 rounded-xl bg-[#F8F5F2] border border-[#EAE3DE] text-[#8C7B75] hover:text-[#1A1817] transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}