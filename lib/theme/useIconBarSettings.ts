import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LabelStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'capitalize';
  color: string;
  background: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  shadow: boolean;
  delay: number;
  position: 'top' | 'bottom' | 'left' | 'right';
  offsetX: number;
  offsetY: number;
  showOnHover: boolean;
  showOnFocus: boolean;
}

export interface ButtonStyle {
  size: number;        // Button diameter (px)
  iconScale: number;   // Icon size inside button (px)
  gap: number;         // Spacing between buttons (px)
  radius: number;      // Border radius (px)
  borderWidth: number; // Border width (px)
  normalColor: string;
  hoverColor: string;
  normalBg: string;
  hoverBg: string;
  borderColor: string;
  hoverBorderColor: string;
}

interface IconBarSettingsState {
  labelStyle: LabelStyle;
  buttonStyle: ButtonStyle;
  updateLabelStyle: (updates: Partial<LabelStyle>) => void;
  updateButtonStyle: (updates: Partial<ButtonStyle>) => void;
  resetDefaults: () => void;
}

const DEFAULT_LABEL_STYLE: LabelStyle = {
  fontFamily: 'Inter',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 0,
  textTransform: 'none',
  color: '#ffffff',
  background: '#1e293b',
  radius: 4,
  paddingX: 8,
  paddingY: 4,
  shadow: true,
  delay: 200,
  position: 'top',
  offsetX: 0,
  offsetY: 0,
  showOnHover: true,
  showOnFocus: true,
};

// Hardcoded defaults from screenshot
const DEFAULT_BUTTON_STYLE: ButtonStyle = {
  size: 20,
  iconScale: 12,
  gap: 1,
  radius: 30,
  borderWidth: 0,
  normalColor: '#94a3b8', 
  hoverColor: '#475569',
  normalBg: '#fafafa',
  hoverBg: '#ffffff',
  borderColor: '#ffffff',
  hoverBorderColor: '#e2e8f0',
};

export const useIconBarSettings = create<IconBarSettingsState>()(
  persist(
    (set) => ({
      labelStyle: DEFAULT_LABEL_STYLE,
      buttonStyle: DEFAULT_BUTTON_STYLE,
      updateLabelStyle: (updates) => set((state) => ({
        labelStyle: { ...state.labelStyle, ...updates }
      })),
      updateButtonStyle: (updates) => set((state) => ({
        buttonStyle: { ...state.buttonStyle, ...updates }
      })),
      resetDefaults: () => set({ 
        labelStyle: DEFAULT_LABEL_STYLE,
        buttonStyle: DEFAULT_BUTTON_STYLE 
      }),
    }),
    {
      name: 'clinicflow-icon-bar-settings-v3', // Incremented to v3 to force new defaults
    }
  )
);