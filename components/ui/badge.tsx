import React from "react"
import { cn } from "../../lib/utils"

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    outline: "bg-white text-slate-600 border border-slate-200",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}