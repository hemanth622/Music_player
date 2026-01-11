import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Song } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistsStore } from '../store/playlistsStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useNavigation } from '@react-navigation/native';

interface SongContextMenuProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

export const SongContextMenu: React.FC<SongContextMenuProps> = ({ visible, song, onClose }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { addToQueue, setQueue, queue } = usePlayerStore();
  const { playlists, addSongToPlaylist } = usePlaylistsStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  if (!song) return null;

  const imageUrl = song.image?.[song.image.length - 1]?.url || '';
  const primaryArtists = song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || 'Unknown Artist';
  const duration = Math.floor(song.duration / 60) + ':' + (song.duration % 60).toString().padStart(2, '0') + ' mins';
  const favorite = isFavorite(song.id);

  const handlePlay = () => {
    setQueue([song], 0);
    onClose();
  };

  const handlePlayNext = () => {
    const state = usePlayerStore.getState();
    const { queue, currentIndex } = state;
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);
    state.setQueue(newQueue, currentIndex);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(song);
    onClose();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
    onClose();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(song);
  };

  const handleGoToAlbum = () => {
    if (song.album?.id) {
      const albumSongs = queue.filter(s => s.album?.id === song.album?.id);
      if (albumSongs.length > 0) {
        const album = {
          id: song.album.id,
          name: song.album.name,
          artist: song.artists?.primary?.[0]?.name || song.primaryArtists || 'Unknown Artist',
          image: song.image?.[song.image.length - 1]?.url,
          year: song.year,
          songCount: albumSongs.length,
          songs: albumSongs,
        };
        navigation.navigate('AlbumDetail' as never, { album } as never);
        onClose();
      }
    }
  };

  const handleGoToArtist = () => {
    if (song.artists?.primary && song.artists.primary.length > 0) {
      const artist = song.artists.primary[0];
      const artistSongs = queue.filter(s => 
        s.artists?.primary?.some(a => a.id === artist.id)
      );
      if (artistSongs.length > 0) {
        const artistData = {
          id: artist.id,
          name: artist.name,
          image: song.image?.[song.image.length - 1]?.url,
          songCount: artistSongs.length,
          songs: artistSongs,
        };
        navigation.navigate('ArtistDetail' as never, { artist: artistData } as never);
        onClose();
      }
    }
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <View style={styles.songInfo}>
            <Image source={{ uri: imageUrl }} style={styles.songImage} />
            <View style={styles.songDetails}>
              <Text style={styles.songTitle} numberOfLines={1}>{song.name}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{primaryArtists}</Text>
              <Text style={styles.songDuration}>{duration}</Text>
            </View>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
              <Text style={styles.favoriteIcon}>{favorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePlay}>
              <Text style={styles.menuIcon}>▶</Text>
              <Text style={styles.menuText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePlayNext}>
              <Text style={styles.menuIcon}>⏭</Text>
              <Text style={styles.menuText}>Play Next</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleAddToQueue}>
              <Text style={styles.menuIcon}>➕</Text>
              <Text style={styles.menuText}>Add to Playing Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleGoToAlbum}>
              <Text style={styles.menuIcon}>💿</Text>
              <Text style={styles.menuText}>Go to Album</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleGoToArtist}>
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Go to Artist</Text>
            </TouchableOpacity>

            {playlists.length > 0 && (
              <>
                <View style={styles.divider} />
                {playlists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist.id}
                    style={styles.menuItem}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                  >
                    <Text style={styles.menuIcon}>📋</Text>
                    <Text style={styles.menuText}>Add to {playlist.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleToggleFavorite}>
              <Text style={styles.menuIcon}>{favorite ? '❤️' : '🤍'}</Text>
              <Text style={styles.menuText}>{favorite ? 'Remove from Favorites' : 'Add to Favorites'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📤</Text>
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  songDetails: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  songDuration: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  menuIcon: {
    fontSize: 20,
    width: 30,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
});
