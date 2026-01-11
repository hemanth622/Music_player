import { create } from 'zustand';
import { Song } from '../types';
import { storageService } from '../services/storage';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

interface PlaylistsState {
  playlists: Playlist[];
  createPlaylist: (name: string) => string;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  getPlaylist: (id: string) => Playlist | undefined;
  loadPlaylists: () => void;
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],

  loadPlaylists: async () => {
    try {
      const playlists = await storageService.getPlaylists();
      set({ playlists });
    } catch (error) {
      console.error('Error loading playlists:', error);
      set({ playlists: [] });
    }
  },

  createPlaylist: async (name: string) => {
    const { playlists } = get();
    const id = `playlist_${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      name,
      songs: [],
    };
    const updated = [...playlists, newPlaylist];
    await storageService.savePlaylists(updated);
    set({ playlists: updated });
    return id;
  },

  deletePlaylist: async (id: string) => {
    const { playlists } = get();
    const updated = playlists.filter(p => p.id !== id);
    await storageService.savePlaylists(updated);
    set({ playlists: updated });
  },

  addSongToPlaylist: async (playlistId: string, song: Song) => {
    const { playlists } = get();
    const updated = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        if (!playlist.songs.find(s => s.id === song.id)) {
          return { ...playlist, songs: [...playlist.songs, song] };
        }
      }
      return playlist;
    });
    await storageService.savePlaylists(updated);
    set({ playlists: updated });
  },

  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
    const { playlists } = get();
    const updated = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, songs: playlist.songs.filter(s => s.id !== songId) };
      }
      return playlist;
    });
    await storageService.savePlaylists(updated);
    set({ playlists: updated });
  },

  getPlaylist: (id: string) => {
    return get().playlists.find(p => p.id === id);
  },
}));
