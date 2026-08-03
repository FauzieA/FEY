import { X, Sparkles } from "lucide-react";
import { type TitleDefinition } from "@/data/titles";
import { type AchievementDefinition, RARITY_COLORS } from "@/data/achievements";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newTitle: TitleDefinition;
  xpEarned: number;
  topContributors: { activity: string; xp: number }[];
  unlockedAchievements?: AchievementDefinition[];
  cosmeticRewards?: string[];
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newTitle,
  xpEarned,
  topContributors,
  unlockedAchievements = [],
  cosmeticRewards = [],
}: LevelUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFCFA] rounded-3xl max-w-lg w-full border border-[#EAE3DE] shadow-2xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6B2D3A] via-[#8B3D4A] to-[#6B2D3A]" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F2E8EA] transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-[#8C7B75]" />
        </button>

        <div className="p-8 text-center">
          {/* Sparkles decoration */}
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-[#6B2D3A]" />
          </div>

          {/* Level badge */}
          <div className="inline-block bg-gradient-to-br from-[#6B2D3A] to-[#8B3D4A] text-white px-6 py-2 rounded-full mb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Level Up!</span>
          </div>

          {/* New level */}
          <h2 className="font-serif text-5xl text-[#1A1817] mb-2">{newLevel}</h2>
          
          {/* New title */}
          <p className="text-xl text-[#6B2D3A] font-serif mb-6">{newTitle.name}</p>
          
          {/* Title description */}
          <p className="text-sm text-[#8C7B75] italic mb-8">{newTitle.description}</p>

          {/* XP earned */}
          <div className="bg-[#F2E8EA] rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-1">
              XP Earned This Level
            </p>
            <p className="font-mono text-3xl text-[#6B2D3A]">{xpEarned}</p>
          </div>

          {/* Top contributors */}
          {topContributors.length > 0 && (
            <div className="text-left mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-3">
                What Contributed Most
              </p>
              <div className="space-y-2">
                {topContributors.slice(0, 3).map((contributor, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-[#1A1817]">{contributor.activity}</span>
                    <span className="font-mono text-[#6B2D3A]">+{contributor.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlocked achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="text-left mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-3">
                Achievements Unlocked
              </p>
              <div className="space-y-2">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-[#EAE3DE]"
                    style={{ borderLeftColor: RARITY_COLORS[achievement.rarity], borderLeftWidth: 4 }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A1817]">{achievement.name}</p>
                      <p className="text-xs text-[#8C7B75]">{achievement.description}</p>
                    </div>
                    <span className="text-xs font-mono text-[#6B2D3A]">+{achievement.xpBonus} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cosmetic rewards */}
          {cosmeticRewards.length > 0 && (
            <div className="text-left mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-3">
                Cosmetic Rewards Unlocked
              </p>
              <div className="flex flex-wrap gap-2">
                {cosmeticRewards.map((reward) => (
                  <span
                    key={reward}
                    className="px-3 py-1 bg-[#F2E8EA] text-[#6B2D3A] rounded-full text-xs"
                  >
                    {reward}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next title preview */}
          <div className="border-t border-[#EAE3DE] pt-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] mb-2">
              Next Title Awaits
            </p>
            <p className="text-sm text-[#1A1817]">Continue your journey to unlock your next identity</p>
          </div>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-[#6B2D3A] text-white rounded-xl font-medium hover:bg-[#8B3D4A] transition-colors"
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
}
