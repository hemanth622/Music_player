import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistsStore } from '../store/playlistsStore';
import { useTheme } from '../hooks/useTheme';
import { SongItem } from '../components/SongItem';
import { Song } from '../types';
import { Playlist } from '../store/playlistsStore';

export const PlaylistDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { setQueue, addToQueue } = usePlayerStore();
  const { removeSongFromPlaylist } = usePlaylistsStore();
  
  const playlist = (route.params as any)?.playlist as Playlist;

  if (!playlist) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Playlist not found</Text>
      </View>
    );
  }

  const handleShuffle = () => {
    const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
  };

  const handlePlay = () => {
    setQueue(playlist.songs, 0);
  };

  const handleSongPress = (song: Song) => {
    const index = playlist.songs.findIndex(s => s.id === song.id);
    setQueue(playlist.songs, index >= 0 ? index : 0);
  };

  const handleRemoveSong = (songId: string) => {
    removeSongFromPlaylist(playlist.id, songId);
  };

  const styles = createStyles(colors);

  const renderSongItem = ({ item }: { item: Song }) => (
    <SongItem
      song={item}
      onPress={() => handleSongPress(item)}
      onAddToQueue={() => addToQueue(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playlistInfo}>
        <View style={styles.playlistIcon}>
          <Text style={styles.playlistIconText}>📋</Text>
        </View>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.playlistCount}>
          {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
          <Text style={styles.shuffleIcon}>🔀</Text>
          <Text style={styles.shuffleText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.playText}>Play</Text>
        </TouchableOpacity>
      </View>

      {playlist.songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>This playlist is empty</Text>
          <Text style={styles.emptySubtext}>Add songs to this playlist</Text>
        </View>
      ) : (
        <FlatList
          data={playlist.songs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  playlistInfo: {
    alignItems: 'center',
    padding: 24,
  },
  playlistIcon: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  playlistIconText: {
    fontSize: 48,
  },
  playlistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  playlistCount: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  shuffleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  shuffleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  shuffleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.playButtonText,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  playText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});
