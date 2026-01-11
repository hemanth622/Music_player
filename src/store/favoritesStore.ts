import { create } from 'zustand';
import { Song } from '../types';
import { storageService } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FAVORITE_SONGS_KEY = 'favorite_songs_data';

interface FavoritesState {
  favorites: Set<string>;
  favoriteSongs: Song[];
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  getFavoriteSongs: () => Song[];
  loadFavorites: () => void;
}

let favoriteSongsStorage: any;

if (Platform.OS === 'web') {
  favoriteSongsStorage = {
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
  favoriteSongsStorage = {
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

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: new Set<string>(),
  favoriteSongs: [],

  loadFavorites: async () => {
    try {
      const favoriteIds = await storageService.getFavorites();
      const favoriteSongsStr = await favoriteSongsStorage.getItem(FAVORITE_SONGS_KEY);
      const favoriteSongs = favoriteSongsStr ? JSON.parse(favoriteSongsStr) : [];
      set({ 
        favorites: new Set(favoriteIds),
        favoriteSongs: favoriteSongs || []
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
      set({ favorites: new Set(), favoriteSongs: [] });
    }
  },

  toggleFavorite: async (song: Song) => {
    const { favorites, favoriteSongs } = get();
    const newFavorites = new Set(favorites);
    let newFavoriteSongs = [...favoriteSongs];
    
    if (newFavorites.has(song.id)) {
      newFavorites.delete(song.id);
      newFavoriteSongs = newFavoriteSongs.filter(s => s.id !== song.id);
    } else {
      newFavorites.add(song.id);
      if (!newFavoriteSongs.find(s => s.id === song.id)) {
        newFavoriteSongs.push(song);
      }
    }
    
    await storageService.saveFavorites(Array.from(newFavorites));
    await favoriteSongsStorage.setItem(FAVORITE_SONGS_KEY, JSON.stringify(newFavoriteSongs));
    set({ favorites: newFavorites, favoriteSongs: newFavoriteSongs });
  },

  isFavorite: (songId: string) => {
    return get().favorites.has(songId);
  },

  getFavoriteSongs: () => {
    return get().favoriteSongs;
  },
}));
