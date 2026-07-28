import {type CharacterStats } from "@/types/character";

interface CharacterHeaderProps {
  stats: CharacterStats;
}

export default function CharacterHeader({ stats }: CharacterHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-[#1A1817] via-[#2C2826] to-[#1A1817] text-white rounded-[32px] p-6 sm:p-8 border border-[#3D3734] shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#6B2D3A]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D9B7BE] block">
              Character Profile
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight text-white">
              FEY
            </h1>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6B2D3A] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              {stats.level}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/65 block">
                Level {stats.level}
              </span>
              <span className="font-serif font-bold text-sm text-white">
                "The Warrior"
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-white/70">XP {stats.xpInCurrentLevel.toLocaleString()} / {stats.xpNeededForNextLevel.toLocaleString()}</span>
            <span className="text-[#D9B7BE] font-bold">{stats.levelProgressPercent}% To Next Level</span>
          </div>
          <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-[#8C3A48] to-[#D9B7BE] h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${stats.levelProgressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Primary Class</span>
            <span className="font-serif font-bold text-xs sm:text-sm text-white">{stats.primaryClass}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Secondary Class</span>
            <span className="font-serif font-bold text-xs sm:text-sm text-white">{stats.secondaryClass}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Current Focus</span>
            <span className="font-serif font-bold text-xs sm:text-sm text-[#D9B7BE]">{stats.currentFocus}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Training Style</span>
            <span className="font-serif font-bold text-xs sm:text-sm text-white">{stats.trainingStyle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}