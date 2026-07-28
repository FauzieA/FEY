import type { ReactNode } from "react";

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function ListRow({ title, subtitle, meta, actions, children }: ListRowProps) {
  return (
    <div className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="font-serif text-sm text-[#1A1817]">{title}</p>
          {subtitle && <p className="text-xs text-[#8C7B75]">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {meta && <span className="font-mono text-xs text-[#6B2D3A]">{meta}</span>}
          {actions}
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default ListRow;
