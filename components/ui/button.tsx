import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, icon, children, ...props }, ref) => {
    const variants = {
      default: "bg-primary text-white hover:bg-blue-700 shadow-sm border border-transparent",
      outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
      secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent",
    }

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && icon}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }