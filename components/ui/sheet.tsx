import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button";
import { useBreakpoint } from "../../lib/hooks/useBreakpoint";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  size?: 'md' | 'lg' | 'xl';
  height?: string; // CSS height value (e.g. "90vh")
  className?: string;
  contentClassName?: string;
}

export function Sheet({ isOpen, onClose, children, title, height, className, contentClassName }: SheetProps) {
  const { isMobile } = useBreakpoint();

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "relative z-[101] bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
          isMobile 
            ? "w-full h-full m-0 rounded-none animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" 
            : "m-4 animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)]",
          className
        )}
        style={{
           width: isMobile ? '100%' : 'var(--drawer-width, 600px)',
           borderRadius: isMobile ? '0' : 'var(--drawer-radius, 16px)',
           height: isMobile ? '100%' : (height || 'calc(100vh - 2rem)'),
        }}
      >
        {/* Default Header - Only shown if no custom header provided in children (implicit check) */}
        {/* We actually render children directly to allow full control if needed, but for standard sheets we keep this structure */}
        {/* In NewLeadSheet we render our own header, so we might want to make this optional or just wrap children */}
        
        {/* If title is passed, we render standard header, otherwise we assume children handle it or it's headless */}
        {title && (
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 bg-white/50 backdrop-blur-sm shrink-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate pr-4">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 rounded-full w-8 h-8 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={cn("flex-1 overflow-hidden flex flex-col", contentClassName)}>
          {children}
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
