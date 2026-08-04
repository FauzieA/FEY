import { Bell, Zap, RefreshCw, Check, X } from "lucide-react";
import { useState } from "react";
import { syncService } from "@/services/syncService";

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

        {/* Small manual sync button */}
        <SyncButton />
      </div>
    </header>
  );
}

function SyncButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    if (state === 'loading') return;
    setState('loading');
    try {
      await syncService.processQueue();
      await syncService.syncAll();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  return (
    <button
      onClick={handleSync}
      title="Sync now"
      className={`flex items-center justify-center w-9 h-9 rounded-full border text-xs transition cursor-pointer ${
        state === 'loading'
          ? 'bg-[#F8F5F2] text-[#6B2D3A] border-[#EAE3DE]'
          : 'bg-[#FFFCFA] text-[#6B2D3A] border-[#EAE3DE] hover:bg-[#F2E8EA]/50'
      }`}
    >
      {state === 'loading' && (
        <RefreshCw className="w-4 h-4 animate-spin stroke-[2]" />
      )}
      {state === 'idle' && <RefreshCw className="w-4 h-4 stroke-[1.5]" />}
      {state === 'success' && <Check className="w-4 h-4 stroke-[2] text-green-600" />}
      {state === 'error' && <X className="w-4 h-4 stroke-[2] text-red-600" />}
    </button>
  );
}