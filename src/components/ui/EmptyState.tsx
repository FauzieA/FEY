interface EmptyStateProps {
  title: string;
  hint?: string;
}

export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#EAE3DE] bg-[#FFFCFA]/60 p-6 text-center">
      <p className="font-serif text-sm text-[#1A1817]">{title}</p>
      {hint && <p className="mt-1 text-xs text-[#8C7B75]">{hint}</p>}
    </div>
  );
}

export default EmptyState;
