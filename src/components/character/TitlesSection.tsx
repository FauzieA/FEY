import { Award, Lock } from "lucide-react";
import { type TitleItem } from "@/types/character";

interface TitlesSectionProps {
  titles: TitleItem[];
}

export default function TitlesSection({ titles }: TitlesSectionProps) {
  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
      <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Honors & Accolades
          </span>
          <h2 className="font-serif font-bold text-xl text-[#1A1817]">
            Titles
          </h2>
        </div>
        <Award className="w-5 h-5 text-[#6B2D3A]" />
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#2E6B40] block mb-2 font-bold">
            Unlocked Titles
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {titles.filter(t => t.unlocked).map((title) => (
              <div key={title.id} className="bg-[#FAF8F6] border border-[#EAE3DE] p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#2E6B40]/10 text-[#2E6B40] flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span className="font-serif font-bold text-xs text-[#1A1817]">{title.name}</span>
              </div>
            ))}
            {titles.filter(t => t.unlocked).length === 0 && (
              <div className="col-span-3 text-xs text-[#8C7B75] py-2">
                Complete more workouts and unlock milestones to earn titles!
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block mb-2 font-bold">
            Locked Titles
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {titles.filter(t => !t.unlocked).map((title) => (
              <div key={title.id} className="bg-white border border-[#EAE3DE] p-3.5 rounded-2xl flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-xl bg-[#FAF8F6] text-[#8C7B75] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-xs text-[#8C7B75]">{title.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}