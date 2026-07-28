import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";

interface InlineFormProps {
  title: string;
  submitLabel?: string;
  children: ReactNode;
  onSubmit: () => void | Promise<void>;
  /** Start expanded instead of collapsed behind the title row. */
  defaultOpen?: boolean;
}

/** Collapsible add/log form used across every module for consistency. */
export function InlineForm({ title, submitLabel = "Save", children, onSubmit, defaultOpen = false }: InlineFormProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[#6B2D3A]">
          <Plus className="h-4 w-4" />
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#8C7B75] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-[#EAE3DE] p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </form>
      )}
    </div>
  );
}

export default InlineForm;
