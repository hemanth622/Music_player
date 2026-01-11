import { create } from 'zustand';
import { lightColors, darkColors, Colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: Colors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const THEME_KEY = 'theme_mode';

let storage: any;

if (Platform.OS === 'web') {
  storage = {
    getItem: (key: string) => {
      try {
        return (window as any).localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        (window as any).localStorage.setItem(key, value);
      } catch {}
    },
  };
} else {
  storage = {
    getItem: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {}
    },
  };
}

const getInitialTheme = (): ThemeMode => {
  if (Platform.OS === 'web') {
    try {
      const saved = storage.getItem(THEME_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>((set) => {
  const initialMode = getInitialTheme();
  const initialColors = initialMode === 'dark' ? darkColors : lightColors;
  
  if (Platform.OS !== 'web') {
    storage.getItem(THEME_KEY).then((saved: string | null) => {
      const mode = saved === 'dark' ? 'dark' : 'light';
      set({
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
      });
    }).catch(() => {});
  }
  
  return {
    mode: initialMode,
    colors: initialColors,
    
    toggleTheme: () => {
      set((state) => {
        const newMode = state.mode === 'light' ? 'dark' : 'light';
        if (Platform.OS === 'web') {
          storage.setItem(THEME_KEY, newMode);
        } else {
          storage.setItem(THEME_KEY, newMode).catch(() => {});
        }
        return {
          mode: newMode,
          colors: newMode === 'dark' ? darkColors : lightColors,
        };
      });
    },
    
    setTheme: (mode: ThemeMode) => {
      if (Platform.OS === 'web') {
        storage.setItem(THEME_KEY, mode);
      } else {
        storage.setItem(THEME_KEY, mode).catch(() => {});
      }
      set({
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
      });
    },
  };
});
