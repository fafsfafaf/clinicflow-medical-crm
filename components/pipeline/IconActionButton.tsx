import React, { useState, useRef, useEffect } from 'react';
import { IconLabel } from './IconLabel';
import { useIconBarSettings } from '../../lib/theme/useIconBarSettings';
import { cn } from '../../lib/utils';

interface IconActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const IconActionButton: React.FC<IconActionButtonProps> = ({ icon, label, onClick, className }) => {
  const { labelStyle, buttonStyle } = useIconBarSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const updateRect = () => {
    if (buttonRef.current) {
      setTriggerRect(buttonRef.current.getBoundingClientRect());
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!labelStyle.showOnHover) return;
    updateRect();
    clearTimer();
    
    if (labelStyle.delay > 0) {
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, labelStyle.delay);
    } else {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    clearTimer();
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!labelStyle.showOnFocus) return;
    setIsHovered(true); // Treat focus like hover for style
    updateRect();
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsHovered(false);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  // Dynamic Styles
  const dynamicStyle: React.CSSProperties = {
    width: `${buttonStyle.size}px`,
    height: `${buttonStyle.size}px`,
    borderRadius: `${buttonStyle.radius}px`,
    borderWidth: `${buttonStyle.borderWidth}px`,
    borderColor: isHovered ? buttonStyle.hoverBorderColor : buttonStyle.borderColor,
    backgroundColor: isHovered ? buttonStyle.hoverBg : buttonStyle.normalBg,
    color: isHovered ? buttonStyle.hoverColor : buttonStyle.normalColor,
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type="button"
        style={dynamicStyle}
        className={cn(
          "flex items-center justify-center transition-all duration-200",
          "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-95",
          className
        )}
        aria-label={label}
      >
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
          style: { width: buttonStyle.iconScale, height: buttonStyle.iconScale } 
        }) : icon}
      </button>
      
      <IconLabel 
        text={label} 
        isOpen={isOpen} 
        triggerRect={triggerRect} 
      />
    </>
  );
};