import { useEffect, useState } from "react";
import { Timer, X, Plus } from "lucide-react";

interface RestTimerProps {
  initialSeconds: number;
  onClose: () => void;
}

export default function RestTimer({ initialSeconds, onClose }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onClose();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onClose]);

  const addTime = (secs: number) => {
    setSecondsLeft((prev) => prev + secs);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-zinc-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 animate-pulse">
          <Timer className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-zinc-400">
            Rest Timer
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => addTime(30)}
          className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-2 rounded-xl border border-zinc-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>30s</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl border border-zinc-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
