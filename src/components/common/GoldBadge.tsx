interface GoldBadgeProps {
  label: string;
  value: string | number;
}

export function GoldBadge({ label, value }: GoldBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#D4AF37]/40 px-3 py-1.5 rounded-full shadow-sm">
      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7122]">
        {label}
      </span>
      <span className="text-xs font-black text-[#1A1817]">{value}</span>
    </div>
  );
}
