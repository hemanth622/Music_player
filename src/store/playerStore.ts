import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { Song, PlayMode } from '../types';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import * as FileSystem from 'expo-file-system/legacy';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  playMode: PlayMode;
  sound: Audio.Sound | null;
  isLoading: boolean;
  downloadedSongs: Set<string>;

  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  playSong: (song: Song, index?: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setPlayMode: (mode: PlayMode) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  loadQueue: () => void;
  downloadSong: (song: Song) => Promise<void>;
  getSongUrl: (song: Song) => Promise<string>;
  cleanup: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  position: 0,
  duration: 0,
  playMode: 'normal',
  sound: null,
  isLoading: false,
  downloadedSongs: new Set<string>(),

  loadQueue: async () => {
    try {
      const queue = await storageService.getQueue();
      const currentSong = await storageService.getCurrentSong();
      const currentIndex = await storageService.getCurrentIndex();
      const playMode = await storageService.getPlayMode();
      
      set({ queue, currentSong, currentIndex, playMode });
    } catch (error) {
      console.error('Error loading queue:', error);
      set({ queue: [], currentSong: null, currentIndex: 0, playMode: 'normal' });
    }
  },

  setQueue: async (songs: Song[], startIndex = 0) => {
    await storageService.saveQueue(songs);
    await storageService.saveCurrentIndex(startIndex);
    set({ queue: songs, currentIndex: startIndex });
    if (songs.length > startIndex) {
      get().playSong(songs[startIndex], startIndex);
    }
  },

  addToQueue: async (song: Song) => {
    const { queue } = get();
    const newQueue = [...queue, song];
    await storageService.saveQueue(newQueue);
    set({ queue: newQueue });
  },

  removeFromQueue: async (index: number) => {
    const { queue, currentIndex } = get();
    if (index < 0 || index >= queue.length) return;

    const newQueue = queue.filter((_, i) => i !== index);
    await storageService.saveQueue(newQueue);

    let newCurrentIndex = currentIndex;
    if (index < currentIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (index === currentIndex && newQueue.length > 0) {
      newCurrentIndex = Math.min(currentIndex, newQueue.length - 1);
      get().playSong(newQueue[newCurrentIndex], newCurrentIndex);
    } else if (newQueue.length === 0) {
      get().cleanup();
      set({ currentSong: null, currentIndex: 0 });
    }

    await storageService.saveCurrentIndex(newCurrentIndex);
    set({ queue: newQueue, currentIndex: newCurrentIndex });
  },

  reorderQueue: async (fromIndex: number, toIndex: number) => {
    const { queue } = get();
    const newQueue = [...queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);

    const { currentIndex } = get();
    let newCurrentIndex = currentIndex;

    if (fromIndex === currentIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newCurrentIndex = currentIndex + 1;
    }

    await storageService.saveQueue(newQueue);
    await storageService.saveCurrentIndex(newCurrentIndex);
    set({ queue: newQueue, currentIndex: newCurrentIndex });
  },

  getSongUrl: async (song: Song): Promise<string> => {
    let songDownloadUrl = song.downloadUrl?.[song.downloadUrl.length - 1]?.url;
    
    if (!songDownloadUrl) {
      try {
        const response = await apiService.getSongById(song.id);
        if (response.data && response.data.length > 0) {
          const fullSong = response.data[0];
          songDownloadUrl = fullSong.downloadUrl?.[fullSong.downloadUrl.length - 1]?.url;
        }
      } catch (error) {
        console.error('Failed to fetch song details:', error);
      }
    }
    
    if (!songDownloadUrl) {
      throw new Error('No download URL available for this song');
    }
    
    
    if (Platform.OS === 'web') {
      return songDownloadUrl;
    }

    const { downloadedSongs } = get();
    const songId = song.id;
    const docDir = (FileSystem as any).documentDirectory || '';
    const localPath = `${docDir}${songId}.mp4`;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    
    if (fileInfo.exists && downloadedSongs.has(songId)) {
      return localPath;
    }

    return songDownloadUrl;
  },

  downloadSong: async (song: Song) => {
    const { downloadedSongs } = get();
    const songId = song.id;
    
    if (downloadedSongs.has(songId)) {
      return;
    }

    try {
      const downloadUrl = song.downloadUrl?.[song.downloadUrl.length - 1]?.url;
      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      if (Platform.OS === 'web') {
        throw new Error('Downloads are only available on Android/iOS. Please use a mobile device.');
      }
      
      if (!FileSystem || !(FileSystem as any).documentDirectory) {
        throw new Error('File system not available');
      }
      const docDir = (FileSystem as any).documentDirectory || '';
      const localPath = `${docDir}${songId}.mp4`;
      const downloadResult = await FileSystem.downloadAsync(downloadUrl, localPath);
      
      const newDownloadedSongs = new Set(downloadedSongs);
      newDownloadedSongs.add(songId);
      set({ downloadedSongs: newDownloadedSongs });
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  playSong: async (song: Song, index?: number) => {
    const { sound, cleanup } = get();
    
    await cleanup();

    set({ isLoading: true, currentSong: song });
    if (index !== undefined) {
      set({ currentIndex: index });
      await storageService.saveCurrentIndex(index);
    }
    await storageService.saveCurrentSong(song);

    try {
      const { Audio } = await import('expo-av');
      
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      }

      const songUrl = await get().getSongUrl(song);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: songUrl },
        { 
          shouldPlay: true,
          ...(Platform.OS === 'web' && {
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }),
        }
      );

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          set({
            position: status.positionMillis / 1000,
            duration: status.durationMillis ? status.durationMillis / 1000 : 0,
            isPlaying: status.isPlaying,
          });
        } else {
          if ('error' in status) {
            console.error('Playback status error:', (status as any).error);
          }
        }
      });

      set({ sound: newSound, isLoading: false, isPlaying: true });
    } catch (error) {
      console.error('Play error:', error);
      set({ isLoading: false, isPlaying: false });
      if (Platform.OS !== 'web') {
        alert(`Failed to play song: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  playNext: async () => {
    const { queue, currentIndex, playMode } = get();
    if (queue.length === 0) return;

    let nextIndex: number;

    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (playMode === 'repeat-one') {
      nextIndex = currentIndex;
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
      if (nextIndex === 0 && playMode !== 'repeat') {
        get().cleanup();
        set({ isPlaying: false });
        return;
      }
    }

    if (queue[nextIndex]) {
      get().playSong(queue[nextIndex], nextIndex);
    }
  },

  playPrevious: async () => {
    const { queue, currentIndex, playMode } = get();
    if (queue.length === 0) return;

    let prevIndex: number;

    if (playMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (playMode === 'repeat-one') {
      prevIndex = currentIndex;
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = playMode === 'repeat' ? queue.length - 1 : 0;
      }
    }

    if (queue[prevIndex]) {
      get().playSong(queue[prevIndex], prevIndex);
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying, currentSong } = get();
    
    if (!sound || !currentSong) {
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      set({ isPlaying: !isPlaying });
    } catch (error) {
      console.error('Toggle play/pause error:', error);
    }
  },

  seekTo: async (position: number) => {
    const { sound } = get();
    if (!sound) return;

    try {
      await sound.setPositionAsync(position * 1000);
      set({ position });
    } catch (error) {
      console.error('Seek error:', error);
    }
  },

  setPlayMode: async (mode: PlayMode) => {
    await storageService.savePlayMode(mode);
    set({ playMode: mode });
  },

  setPosition: (position: number) => {
    set({ position });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  cleanup: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    set({ sound: null });
  },
}));
