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

const getInitialTheme = async (): Promise<ThemeMode> => {
  try {
    const saved = await storage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const useThemeStore = create<ThemeState>((set) => {
  let initialMode: ThemeMode = 'light';
  
  getInitialTheme().then((mode) => {
    initialMode = mode;
    set({
      mode: initialMode,
      colors: initialMode === 'dark' ? darkColors : lightColors,
    });
  });
  
  return {
    mode: initialMode,
    colors: lightColors,
    
    toggleTheme: () => {
      set((state) => {
        const newMode = state.mode === 'light' ? 'dark' : 'light';
        storage.setItem(THEME_KEY, newMode).catch(() => {});
        return {
          mode: newMode,
          colors: newMode === 'dark' ? darkColors : lightColors,
        };
      });
    },
    
    setTheme: (mode: ThemeMode) => {
      storage.setItem(THEME_KEY, mode).catch(() => {});
      set({
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
      });
    },
  };
});
