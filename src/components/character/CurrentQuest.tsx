import { Zap } from "lucide-react";
import { type QuestItem } from "@/types/character";

interface CurrentQuestProps {
  currentQuest: QuestItem;
}

export default function CurrentQuest({ currentQuest }: CurrentQuestProps) {
  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
      <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Active Objectives
          </span>
          <h2 className="font-serif font-bold text-xl text-[#1A1817]">
            Current Quest
          </h2>
        </div>
        <Zap className="w-5 h-5 text-[#6B2D3A]" />
      </div>

      <div className="bg-[#FAF8F6] border border-[#EAE3DE] p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#1A1817]">
            {currentQuest.title}
          </h3>
          <span className="font-mono font-bold text-sm text-[#6B2D3A]">
            {currentQuest.progressPercent}%
          </span>
        </div>

        <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#EAE3DE] p-0.5">
          <div
            className="bg-[#6B2D3A] h-full rounded-full transition-all duration-700"
            style={{ width: `${currentQuest.progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}