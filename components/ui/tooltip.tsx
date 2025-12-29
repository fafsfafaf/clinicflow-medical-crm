import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRect, setTriggerRect }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipTrigger must be used within a Tooltip");
  
  const { setOpen, setTriggerRect } = context;
  const ref = React.useRef<HTMLElement>(null);

  const updateRect = () => {
    if (ref.current) {
      setTriggerRect(ref.current.getBoundingClientRect());
    }
  };

  const child = React.Children.only(children) as React.ReactElement<any>;

  return React.cloneElement(child, {
    ref,
    onMouseEnter: (e: React.MouseEvent) => {
      updateRect();
      setOpen(true);
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setOpen(false);
      child.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      updateRect();
      setOpen(true);
      child.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      setOpen(false);
      child.props.onBlur?.(e);
    },
  });
};

export const TooltipContent = ({ children, className, sideOffset = 5 }: { children: React.ReactNode, className?: string, sideOffset?: number }) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipContent must be used within a Tooltip");
  
  const { open, triggerRect } = context;

  if (!open || !triggerRect) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: triggerRect.top - sideOffset,
    left: triggerRect.left + (triggerRect.width / 2),
    transform: 'translate(-50%, -100%)',
    zIndex: 9999, // Ensure it's on top of everything
    pointerEvents: 'none',
  };

  return createPortal(
    <div 
      className={cn(
        "z-50 overflow-hidden rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-50 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      style={style}
    >
      {children}
      {/* Tiny arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
    </div>,
    document.body
  );
};