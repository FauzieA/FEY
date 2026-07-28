import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "burgundy" | "gold";
}

export function StatTile({ label, value, hint, tone = "default" }: StatTileProps) {
  const tones = {
    default: "bg-[#FFFCFA] border-[#EAE3DE] text-[#1A1817]",
    burgundy: "bg-[#F2E8EA] border-[#D9B7BE]/50 text-[#6B2D3A]",
    gold: "bg-[#FAF7F2] border-[#D4AF37]/40 text-[#8C7122]",
  } as const;

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{label}</span>
      <span className="mt-1 block font-serif text-2xl leading-tight">{value}</span>
      {hint && <span className="mt-1 block text-[11px] text-[#8C7B75]">{hint}</span>}
    </div>
  );
}

export default StatTile;
