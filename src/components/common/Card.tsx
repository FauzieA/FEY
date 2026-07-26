import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  focused?: boolean;
}

export function Card({ children, className = "", focused = false }: CardProps) {
  return (
    <div
      className={`bg-[#FFFCFA] border rounded-3xl p-6 transition-all duration-300 ${
        focused
          ? "border-[#6B2D3A]/30 shadow-md shadow-[#6B2D3A]/5"
          : "border-[#EAE3DE] shadow-[0_4px_20px_-4px_rgba(26,24,23,0.03)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
