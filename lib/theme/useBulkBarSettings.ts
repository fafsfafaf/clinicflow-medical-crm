import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BulkBarStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontFamily: string;
  bottomOffset: number;
  borderWidth: number;
  showGlassEffect: boolean;
}

interface BulkBarSettingsState {
  style: BulkBarStyle;
  updateStyle: (updates: Partial<BulkBarStyle>) => void;
  resetDefaults: () => void;
}

// Updated defaults based on the screenshot provided
const DEFAULTS: BulkBarStyle = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  borderColor: '#f5f5f5',
  accentColor: '#2563eb',
  borderRadius: 14,
  paddingX: 10,
  paddingY: 8,
  fontFamily: 'Inter',
  bottomOffset: 18,
  borderWidth: 1,
  showGlassEffect: true,
};

export const useBulkBarSettings = create<BulkBarSettingsState>()(
  persist(
    (set) => ({
      style: DEFAULTS,
      updateStyle: (updates) => set((state) => ({ style: { ...state.style, ...updates } })),
      resetDefaults: () => set({ style: DEFAULTS }),
    }),
    { name: 'clinicflow-bulk-bar-settings-v3' } // Version bumped to force new defaults
  )
);