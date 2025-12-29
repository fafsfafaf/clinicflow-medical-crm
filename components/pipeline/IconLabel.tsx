import React from 'react';
import { createPortal } from 'react-dom';
import { useIconBarSettings } from '../../lib/theme/useIconBarSettings';
import { getLabelCss } from '../../lib/theme/iconBarTokens';

interface IconLabelProps {
  text: string;
  triggerRect: DOMRect | null;
  isOpen: boolean;
}

export const IconLabel: React.FC<IconLabelProps> = ({ text, triggerRect, isOpen }) => {
  const { labelStyle } = useIconBarSettings();

  if (!isOpen || !triggerRect) return null;

  const style = getLabelCss(labelStyle);
  
  // Calculate position logic with offsets
  const getPositionStyles = (): React.CSSProperties => {
    const gap = 6;
    let top = 0;
    let left = 0;
    
    // Apply manual offsets
    const xOff = labelStyle.offsetX || 0;
    const yOff = labelStyle.offsetY || 0;

    switch (labelStyle.position) {
      case 'top':
        top = triggerRect.top - gap + yOff;
        left = triggerRect.left + (triggerRect.width / 2) + xOff;
        return { top, left, transform: 'translate(-50%, -100%)' };
      case 'bottom':
        top = triggerRect.bottom + gap + yOff;
        left = triggerRect.left + (triggerRect.width / 2) + xOff;
        return { top, left, transform: 'translate(-50%, 0)' };
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) + yOff;
        left = triggerRect.left - gap + xOff;
        return { top, left, transform: 'translate(-100%, -50%)' };
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) + yOff;
        left = triggerRect.right + gap + xOff;
        return { top, left, transform: 'translate(0, -50%)' };
      default:
        return {};
    }
  };

  const posStyles = getPositionStyles();

  return createPortal(
    <div
      style={{
        ...style,
        position: 'fixed',
        ...posStyles,
      }}
      className="animate-in fade-in zoom-in-95 duration-200"
    >
      {text}
    </div>,
    document.body
  );
};