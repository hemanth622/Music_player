import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const MINI_PLAYER_VISIBLE_KEY = 'mini_player_visible';

interface MiniPlayerState {
  isVisible: boolean;
  loadVisibility: () => Promise<void>;
  setVisibility: (visible: boolean) => Promise<void>;
  toggleVisibility: () => Promise<void>;
}

export const useMiniPlayerStore = create<MiniPlayerState>((set, get) => ({
  isVisible: true,

  loadVisibility: async () => {
    try {
      if (Platform.OS === 'web') {
        const saved = (window as any).localStorage?.getItem(MINI_PLAYER_VISIBLE_KEY);
        set({ isVisible: saved !== 'false' });
      } else {
        const saved = await AsyncStorage.getItem(MINI_PLAYER_VISIBLE_KEY);
        set({ isVisible: saved !== 'false' });
      }
    } catch {
      set({ isVisible: true });
    }
  },

  setVisibility: async (visible: boolean) => {
    try {
      if (Platform.OS === 'web') {
        (window as any).localStorage?.setItem(MINI_PLAYER_VISIBLE_KEY, String(visible));
      } else {
        await AsyncStorage.setItem(MINI_PLAYER_VISIBLE_KEY, String(visible));
      }
      set({ isVisible: visible });
    } catch {
      set({ isVisible: visible });
    }
  },

  toggleVisibility: async () => {
    const { isVisible, setVisibility } = get();
    await setVisibility(!isVisible);
  },
}));
