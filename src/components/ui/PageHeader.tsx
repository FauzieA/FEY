import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#EAE3DE] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <span className="text-xs font-serif italic text-[#8C7B75]">{eyebrow}</span>
        <h1 className="text-3xl font-serif tracking-tight text-[#1A1817] md:text-4xl">{title}</h1>
        {description && <p className="max-w-xl text-xs leading-relaxed text-[#8C7B75]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export default PageHeader;
