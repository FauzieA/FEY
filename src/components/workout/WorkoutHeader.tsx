import { ChevronLeft, MoreHorizontal } from "lucide-react";

interface WorkoutHeaderProps {
  exerciseName: string;
  isFullyCompleted: boolean;
  defaultSets: number;
  exerciseType: string;
  defaultTimeSeconds?: number;
  repRange?: string;
  onBack: () => void;
}

export default function WorkoutHeader({
  exerciseName,
  isFullyCompleted,
  defaultSets,
  exerciseType,
  defaultTimeSeconds,
  repRange,
  onBack,
}: WorkoutHeaderProps) {
  return (
    <header className="flex items-center justify-between pt-2">
      <button
        onClick={onBack}
        className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors active:scale-95 cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="text-center space-y-0.5 px-2">
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-lg sm:text-xl md:text-2xl font-serif text-[#1A1817] line-clamp-1">
            {exerciseName}
          </h1>
          {isFullyCompleted && (
            <span className="bg-[#6B2D3A] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              Done ✓
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-[#8C7B75] italic">
          Target: {defaultSets} sets × {exerciseType === "time" ? `${defaultTimeSeconds || 10}s hold` : repRange}
        </p>
      </div>

      <button className="p-2 text-[#6B2D3A] hover:bg-[#F2E8EA]/50 rounded-full transition-colors">
        <MoreHorizontal className="w-6 h-6" />
      </button>
    </header>
  );
}