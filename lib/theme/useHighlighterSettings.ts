
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HighlighterStyle {
  width: number;
  padding: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  shadow: boolean;
  gridColumns: number; // 2 to 6
  gap: number;
  buttonSize: number; // Size of color circles
}

interface HighlighterSettingsState {
  style: HighlighterStyle;
  updateStyle: (updates: Partial<HighlighterStyle>) => void;
  resetDefaults: () => void;
}

const DEFAULTS: HighlighterStyle = {
  width: 240,
  padding: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#e2e8f0',
  backgroundColor: '#ffffff',
  shadow: true,
  gridColumns: 4,
  gap: 8,
  buttonSize: 40,
};

export const useHighlighterSettings = create<HighlighterSettingsState>()(
  persist(
    (set) => ({
      style: DEFAULTS,
      updateStyle: (updates) => set((state) => ({ style: { ...state.style, ...updates } })),
      resetDefaults: () => set({ style: DEFAULTS }),
    }),
    { name: 'clinicflow-highlighter-settings-v1' }
  )
);
