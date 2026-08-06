import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const controlStyles =
  "w-full rounded-xl border border-[#EAE3DE] bg-[#FFFCFA] px-3 py-2 text-sm text-[#1A1817] outline-none transition-colors placeholder:text-[#C4B7B1] focus:border-[#6B2D3A]";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className = "" }: FieldProps) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-[#8C7B75]">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlStyles} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlStyles} min-h-20 resize-y ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    props.onBlur?.(e);
    // Auto zoom out after editing on mobile
    if (document.activeElement !== e.target) {
      document.body.style.zoom = "1";
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    props.onFocus?.(e);
  };

  return (
    <select
      {...props}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={`${controlStyles} ${props.className ?? ""}`}
    />
  );
}

interface CheckRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export function CheckRow({ label, checked, onChange, hint, disabled = false }: CheckRowProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
        disabled
          ? "border-[#EAE3DE]/50 bg-[#F8F5F2] text-[#C4B7B1] cursor-not-allowed"
          : checked
          ? "border-[#6B2D3A]/40 bg-[#F2E8EA] text-[#6B2D3A]"
          : "border-[#EAE3DE] bg-[#FFFCFA] text-[#1A1817] hover:border-[#D9B7BE]"
      }`}
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-[11px] text-[#8C7B75]">{hint}</span>}
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
          disabled
            ? "border-[#EAE3DE]/50 text-[#C4B7B1]"
            : checked
            ? "border-[#6B2D3A] bg-[#6B2D3A] text-[#F8F5F2]"
            : "border-[#D9B7BE] text-transparent"
        }`}
      >
        ✓
      </span>
    </button>
  );
}

export default Field;
