import { Plus, Minus, Check, Trash2, Sparkles, Square, Play } from "lucide-react";

export interface SetItem {
  setNum: number;
  weightKg: number;
  reps: number;
  durationSec: number;
  completed: boolean;
}

interface SetsTableProps {
  sets: SetItem[];
  exerciseType: string;
  activeTimerIndex: number | null;
  elapsedSeconds: number;
  targetReachedSet: number | null;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onToggleSet: (index: number) => void;
  onUpdateSet: (index: number, field: "weightKg" | "reps" | "durationSec", value: number) => void;
  onToggleSetTimer: (index: number) => void;
}

export default function SetsTable({
  sets,
  exerciseType,
  activeTimerIndex,
  elapsedSeconds,
  targetReachedSet,
  onAddSet,
  onRemoveSet,
  onToggleSet,
  onUpdateSet,
  onToggleSetTimer,
}: SetsTableProps) {
  return (
    <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] block">
          SETS LOG
        </span>
        <span className="text-xs text-[#8C7B75] font-serif">
          {sets.length} {sets.length === 1 ? "Set" : "Sets"}
        </span>
      </div>

      <div className="space-y-3">
        {sets.map((st, idx) => {
          const isTimerRunning = activeTimerIndex === idx;
          const isTargetReached = targetReachedSet === idx;

          return (
            <div key={st.setNum} className="space-y-1">
              {isTargetReached && isTimerRunning && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B2D3A] bg-[#F2E8EA] px-3 py-1 rounded-xl animate-bounce w-fit mx-auto shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#6B2D3A]" />
                  <span>Target reached! Keep going or tap Stop.</span>
                </div>
              )}

              <div
                className={`flex items-center justify-between gap-2 p-3 rounded-2xl border transition-all ${
                  st.completed
                    ? "bg-[#F2E8EA]/60 border-[#6B2D3A] text-[#1A1817]"
                    : isTimerRunning
                    ? "bg-white border-[#6B2D3A] ring-2 ring-[#6B2D3A]/20 text-[#1A1817]"
                    : "bg-[#F8F5F2] border-[#EAE3DE] text-[#1A1817]"
                }`}
              >
                <span className="font-serif font-bold text-xs sm:text-sm shrink-0 w-10">
                  Set {st.setNum}
                </span>

                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {exerciseType === "weight_reps" && (
                    <div className="flex items-center gap-1 bg-white border border-[#EAE3DE] rounded-xl px-2 py-1 shrink-0">
                      <input
                        type="number"
                        step="any"
                        value={st.weightKg}
                        onChange={(e) =>
                          onUpdateSet(idx, "weightKg", parseFloat(e.target.value) || 0)
                        }
                        className="w-12 text-center font-mono text-xs sm:text-sm font-bold bg-transparent focus:outline-none text-[#1A1817]"
                      />
                      <span className="text-[11px] text-[#8C7B75] font-medium">kg</span>
                    </div>
                  )}

                  {exerciseType !== "time" && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onUpdateSet(idx, "reps", st.reps - 1)}
                        className="w-6 h-6 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs sm:text-sm font-bold min-w-[32px] text-center">
                        {st.reps}reps
                      </span>
                      <button
                        onClick={() => onUpdateSet(idx, "reps", st.reps + 1)}
                        className="w-6 h-6 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {exerciseType === "time" && (
                    <div className="flex items-center gap-2">
                      {!isTimerRunning && (
                        <button
                          onClick={() => onUpdateSet(idx, "durationSec", st.durationSec - 1)}
                          className="w-6 h-6 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      )}

                      <span className="font-mono text-sm sm:text-base font-bold text-[#6B2D3A] min-w-[42px] text-center">
                        {isTimerRunning ? `${elapsedSeconds}s` : `${st.durationSec}s`}
                      </span>

                      {!isTimerRunning && (
                        <button
                          onClick={() => onUpdateSet(idx, "durationSec", st.durationSec + 1)}
                          className="w-6 h-6 rounded-full border bg-white flex items-center justify-center text-[#8C7B75] active:scale-90 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => onToggleSetTimer(idx)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                          isTimerRunning
                            ? "bg-[#6B2D3A] text-white animate-pulse"
                            : "bg-[#F2E8EA] text-[#6B2D3A] hover:bg-[#D9B7BE]/50"
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Hold</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onToggleSet(idx)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      st.completed
                        ? "bg-[#6B2D3A] text-white shadow-sm"
                        : "border bg-white text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  {sets.length > 1 && (
                    <button
                      onClick={() => onRemoveSet(idx)}
                      className="p-1 text-[#8C7B75] hover:text-[#6B2D3A] transition-colors cursor-pointer"
                      title="Remove Set"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onAddSet}
        className="w-full py-2.5 rounded-2xl border border-dashed border-[#D9B7BE] text-[#6B2D3A] hover:bg-[#F2E8EA]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add Set</span>
      </button>
    </div>
  );
}