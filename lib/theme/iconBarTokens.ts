import React from 'react';
import { LabelStyle } from "./useIconBarSettings";

export const getLabelCss = (style: LabelStyle): React.CSSProperties => {
  return {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    letterSpacing: `${style.letterSpacing}em`,
    textTransform: style.textTransform,
    color: style.color,
    backgroundColor: style.background,
    borderRadius: `${style.radius}px`,
    padding: `${style.paddingY}px ${style.paddingX}px`,
    boxShadow: style.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 9999,
  };
};

export const FONTS = [
  'Inter',
  'system-ui',
  'Manrope',
  'Plus Jakarta Sans',
  'Outfit',
  'Roboto',
  'Open Sans',
];

export const POSITIONS = ['top', 'bottom', 'left', 'right'] as const;