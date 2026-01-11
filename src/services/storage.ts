import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const QUEUE_KEY = 'music_queue';
const CURRENT_SONG_KEY = 'current_song';
const CURRENT_INDEX_KEY = 'current_index';
const PLAY_MODE_KEY = 'play_mode';
const FAVORITES_KEY = 'favorite_songs';
const PLAYLISTS_KEY = 'playlists';

let storage: any;

if (Platform.OS === 'web') {
  storage = {
    set: async (key: string, value: string | number) => {
      try {
        localStorage.setItem(key, String(value));
      } catch (e) {
      }
    },
    getString: async (key: string): Promise<string | undefined> => {
      try {
        return localStorage.getItem(key) || undefined;
      } catch (e) {
        return undefined;
      }
    },
    getNumber: async (key: string): Promise<number | undefined> => {
      try {
        const value = localStorage.getItem(key);
        return value ? Number(value) : undefined;
      } catch (e) {
        return undefined;
      }
    },
    delete: async (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
      }
    },
  };
} else {
  storage = {
    set: async (key: string, value: string | number) => {
      try {
        await AsyncStorage.setItem(key, String(value));
      } catch (e) {
      }
    },
    getString: async (key: string): Promise<string | undefined> => {
      try {
        return await AsyncStorage.getItem(key) || undefined;
      } catch (e) {
        return undefined;
      }
    },
    getNumber: async (key: string): Promise<number | undefined> => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value ? Number(value) : undefined;
      } catch (e) {
        return undefined;
      }
    },
    delete: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (e) {
      }
    },
  };
}

export const storageService = {
  saveQueue: async (queue: Song[]) => {
    await storage.set(QUEUE_KEY, JSON.stringify(queue));
  },

  getQueue: async (): Promise<Song[]> => {
    const queueStr = await storage.getString(QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  },

  saveCurrentSong: async (song: Song | null) => {
    if (song) {
      await storage.set(CURRENT_SONG_KEY, JSON.stringify(song));
    } else {
      await storage.delete(CURRENT_SONG_KEY);
    }
  },

  getCurrentSong: async (): Promise<Song | null> => {
    const songStr = await storage.getString(CURRENT_SONG_KEY);
    return songStr ? JSON.parse(songStr) : null;
  },

  saveCurrentIndex: async (index: number) => {
    await storage.set(CURRENT_INDEX_KEY, index);
  },

  getCurrentIndex: async (): Promise<number> => {
    const value = await storage.getNumber(CURRENT_INDEX_KEY);
    return value ?? 0;
  },

  savePlayMode: async (mode: 'normal' | 'repeat' | 'repeat-one' | 'shuffle') => {
    await storage.set(PLAY_MODE_KEY, mode);
  },

  getPlayMode: async (): Promise<'normal' | 'repeat' | 'repeat-one' | 'shuffle'> => {
    const mode = await storage.getString(PLAY_MODE_KEY);
    return (mode as any) || 'normal';
  },

  saveFavorites: async (favorites: string[]) => {
    await storage.set(FAVORITES_KEY, JSON.stringify(favorites));
  },

  getFavorites: async (): Promise<string[]> => {
    const favoritesStr = await storage.getString(FAVORITES_KEY);
    return favoritesStr ? JSON.parse(favoritesStr) : [];
  },

  savePlaylists: async (playlists: Array<{ id: string; name: string; songs: Song[] }>) => {
    await storage.set(PLAYLISTS_KEY, JSON.stringify(playlists));
  },

  getPlaylists: async (): Promise<Array<{ id: string; name: string; songs: Song[] }>> => {
    const playlistsStr = await storage.getString(PLAYLISTS_KEY);
    return playlistsStr ? JSON.parse(playlistsStr) : [];
  },
};
