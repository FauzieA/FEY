import { Compass, CheckCircle2, Circle } from "lucide-react";
import {type SkillTreeGroup } from "@/types/character";

interface SkillTreeSectionProps {
  skillTrees: SkillTreeGroup[];
  activeSkillTab: string;
  setActiveSkillTab: (tab: string) => void;
}

export default function SkillTreeSection({
  skillTrees,
  activeSkillTab,
  setActiveSkillTab,
}: SkillTreeSectionProps) {
  const activeTreeData = skillTrees.find((t) => t.categoryName === activeSkillTab) || skillTrees[0];

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
      <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
            Progression Pathways
          </span>
          <h2 className="font-serif font-bold text-xl text-[#1A1817]">
            Skill Trees
          </h2>
        </div>
        <Compass className="w-5 h-5 text-[#6B2D3A]" />
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {skillTrees.map((tree) => (
          <button
            key={tree.categoryName}
            onClick={() => setActiveSkillTab(tree.categoryName)}
            className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSkillTab === tree.categoryName
                ? "bg-[#6B2D3A] text-white shadow-sm"
                : "bg-[#FAF8F6] text-[#8C7B75] border border-[#EAE3DE] hover:text-[#1A1817]"
            }`}
          >
            {tree.categoryName}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {activeTreeData && activeTreeData.skills.map((skill, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              skill.completed 
                ? "bg-[#FAF8F6] border-[#EAE3DE]" 
                : "bg-white border-[#EAE3DE] opacity-60"
            }`}
          >
            <span className={`font-serif text-sm ${skill.completed ? "font-bold text-[#1A1817]" : "text-[#8C7B75]"}`}>
              {skill.name}
            </span>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center">
              {skill.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#2E6B40]" />
              ) : (
                <Circle className="w-5 h-5 text-[#EAE3DE]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}