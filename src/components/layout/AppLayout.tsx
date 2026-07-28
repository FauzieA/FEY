import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { MODULES } from "@/config/modules";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { buildCharacter } from "@/services/characterService";
import { computeMetrics } from "@/services/insightsService";
import { startOfWeek, today } from "@/utils/date";
import { formatNumber } from "@/utils/format";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MobileNav } from "@/components/layout/MobileNav";

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {MODULES.map((module) => {
        const Icon = module.icon;
        return (
          <NavLink
            key={module.id}
            to={module.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-[#F2E8EA] text-[#6B2D3A]"
                  : "text-[#8C7B75] hover:bg-[#F2E8EA]/50 hover:text-[#1A1817]"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-tight">{module.label}</span>
              <span className="block truncate text-[10px] text-[#8C7B75]">{module.tagline}</span>
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const snapshot = useFeySnapshot();
  const character = buildCharacter(snapshot.xpEvents, computeMetrics(snapshot), startOfWeek(), today());

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#EAE3DE] bg-[#FFFCFA] p-5 md:flex">
        <Brand character={{ level: character.level, title: character.title.name, progress: character.progress }} />
        <div className="mt-6 flex-1 overflow-y-auto">
          <NavItems />
        </div>
        <p className="pt-4 text-[10px] leading-relaxed text-[#8C7B75]">
          {formatNumber(character.totalXp)} XP earned across every module.
        </p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[#EAE3DE] bg-[#FFFCFA]/95 px-4 py-3 backdrop-blur md:hidden">
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
          <Menu className="h-5 w-5 text-[#6B2D3A]" />
        </button>
        <span className="font-serif text-lg tracking-[0.3em] text-[#6B2D3A]">FEY</span>
        <span className="rounded-full border border-[#D4AF37]/40 bg-[#FAF7F2] px-2.5 py-1 text-[10px] font-bold text-[#8C7122]">
          LV {character.level}
        </span>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-[#1A1817]/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-[#FFFCFA] p-5">
            <div className="flex items-start justify-between">
              <Brand character={{ level: character.level, title: character.title.name, progress: character.progress }} />
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5 text-[#8C7B75]" />
              </button>
            </div>
            <div className="mt-6">
              <NavItems onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl space-y-6 p-4 pb-32 md:p-8">
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

function Brand({ character }: { character: { level: number; title: string; progress: number } }) {
  return (
    <div className="space-y-2">
      <div>
        <span className="font-serif text-2xl tracking-[0.35em] text-[#6B2D3A]">FEY</span>
        <p className="text-[10px] uppercase tracking-widest text-[#8C7B75]">Life operating system</p>
      </div>
      <div className="rounded-2xl border border-[#EAE3DE] bg-[#F8F5F2] p-3">
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-sm text-[#1A1817]">Level {character.level}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#8C7122]">{character.title}</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={character.progress} tone="gold" />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
