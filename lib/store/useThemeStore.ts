import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeSettings {
  appBg: string;
  windowBg: string;
  sidebarBg: string;
  borderColor: string;
  
  radius: number;
  borderWidth: number;
  padding: number;
  sidebarWidth: number;
  topbarHeight: number;
  
  // Drawer / Sheet settings
  drawerRadius: number;
  drawerWidth: number;
  
  shadowStrength: number;
  
  // Typography
  fontGlobal: string;
  fontHeadings: string;
  fontMetrics: string;

  // Toggles
  showController: boolean;
}

interface ThemeState extends ThemeSettings {
  updateSetting: (key: keyof ThemeSettings, value: any) => void;
  resetToDefaults: () => void;
  applyPreset: (preset: 'subtle' | 'balanced' | 'strong') => void;
  toggleController: () => void;
}

const DEFAULTS: ThemeSettings = {
  appBg: '#e8e8e8',
  windowBg: '#ffffff',
  sidebarBg: 'transparent',
  borderColor: '#dfdddd',
  
  radius: 26,
  borderWidth: 1,
  padding: 13,
  sidebarWidth: 62,
  topbarHeight: 64,

  drawerRadius: 16,
  drawerWidth: 939,
  
  shadowStrength: 0,
  
  fontGlobal: 'Plus Jakarta Sans',
  fontHeadings: 'Manrope', // Default set to Manrope per user request
  fontMetrics: 'Nunito', 

  showController: false,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      updateSetting: (key, value) => set({ [key]: value }),
      
      resetToDefaults: () => set({ ...DEFAULTS, showController: true }),
      
      toggleController: () => set((state) => ({ showController: !state.showController })),

      applyPreset: (preset) => {
        switch (preset) {
          case 'subtle':
            set({
              radius: 12,
              padding: 16,
              shadowStrength: 10,
              borderWidth: 1,
              appBg: '#F8FAFC',
              fontGlobal: 'Inter',
              fontHeadings: 'Inter',
              fontMetrics: 'Inter',
              drawerRadius: 12,
              drawerWidth: 800,
            });
            break;
          case 'balanced':
            set({
              radius: 24,
              padding: 24,
              shadowStrength: 40,
              borderWidth: 1,
              appBg: '#F3F4F6',
              fontGlobal: 'Manrope',
              fontHeadings: 'Manrope',
              fontMetrics: 'Outfit',
              drawerRadius: 24,
              drawerWidth: 900,
            });
            break;
          case 'strong':
            set({
              radius: 32,
              padding: 32,
              shadowStrength: 80,
              borderWidth: 2,
              appBg: '#E2E8F0',
              fontGlobal: 'Plus Jakarta Sans',
              fontHeadings: 'Plus Jakarta Sans',
              fontMetrics: 'Nunito',
              drawerRadius: 32,
              drawerWidth: 1000,
            });
            break;
        }
      },
    }),
    {
      name: 'clinicflow-theme-v8', // Bump version to force Manrope default
    }
  )
);