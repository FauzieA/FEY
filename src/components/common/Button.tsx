import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "burgundy" | "rose" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "burgundy",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium tracking-wide rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";

  const variants = {
    burgundy:
      "bg-[#6B2D3A] text-[#F8F5F2] hover:bg-[#58242F] shadow-sm shadow-[#6B2D3A]/20",
    rose: "bg-[#F2E8EA] text-[#6B2D3A] border border-[#D9B7BE]/40 hover:bg-[#EBDCDD]",
    gold: "bg-[#D4AF37] text-[#1A1817] font-semibold hover:bg-[#C29F2E] shadow-sm shadow-[#D4AF37]/20",
    ghost:
      "bg-transparent text-[#6B2D3A] hover:bg-[#F2E8EA]/50 border border-transparent",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base font-semibold",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
