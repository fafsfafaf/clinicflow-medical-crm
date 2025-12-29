import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NewLeadSheetSettings {
  // Header
  headerPaddingX: number;
  headerPaddingY: number;
  
  // Body / Content
  contentPaddingTop: number;
  contentPaddingBottom: number;
  contentPaddingX: number;
  
  // Footer
  footerPaddingTop: number;
  footerPaddingBottom: number;
  footerPaddingX: number;
  
  // Spacing & Gaps
  sectionGap: number;
  fieldGap: number;
  contentFooterGap: number;
  
  // Layout & Behavior
  sheetMaxHeightVh: number; // Max height in VH
  scrollBehavior: 'content' | 'body'; // Fixed header/footer vs full scroll
  safeAreaBottom: boolean; // Add extra padding for home indicator
}

interface NewLeadSheetSettingsState extends NewLeadSheetSettings {
  updateSettings: (updates: Partial<NewLeadSheetSettings>) => void;
  resetDefaults: () => void;
}

const DEFAULTS: NewLeadSheetSettings = {
  headerPaddingX: 30,
  headerPaddingY: 26,
  
  contentPaddingTop: 36,
  contentPaddingBottom: 26,
  contentPaddingX: 33,
  
  footerPaddingTop: 16,
  footerPaddingBottom: 3,
  footerPaddingX: 30, // Matching header padding for alignment
  
  sectionGap: 44,
  fieldGap: 16,
  contentFooterGap: 17,
  
  sheetMaxHeightVh: 92,
  scrollBehavior: 'content',
  safeAreaBottom: false,
};

export const useNewLeadSheetSettings = create<NewLeadSheetSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
      resetDefaults: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'clinicflow-sheet-settings-v3', // Bump version to force new defaults
    }
  )
);
