interface ProgressBarProps {
  value: number;
  label?: string;
  caption?: string;
  tone?: "burgundy" | "gold" | "rose";
}

export function ProgressBar({ value, label, caption, tone = "burgundy" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fills = {
    burgundy: "bg-[#6B2D3A]",
    gold: "bg-[#D4AF37]",
    rose: "bg-[#D9B7BE]",
  } as const;

  return (
    <div className="space-y-1.5">
      {(label || caption) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && <span className="text-xs font-medium text-[#1A1817]">{label}</span>}
          {caption && <span className="text-[11px] font-mono text-[#8C7B75]">{caption}</span>}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EAE3DE]">
        <div className={`h-full rounded-full transition-all duration-500 ${fills[tone]}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
