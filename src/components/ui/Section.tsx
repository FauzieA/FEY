import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, subtitle, actions, children, className = "" }: SectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B75]">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-[#8C7B75]/80">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export default Section;
