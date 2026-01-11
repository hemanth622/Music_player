import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { SongItem } from '../components/SongItem';
import { Song } from '../types';

interface Album {
  id: string;
  name: string;
  artist: string;
  image?: string;
  year?: string;
  songCount: number;
  songs: Song[];
}

export const AlbumDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { setQueue, addToQueue } = usePlayerStore();
  
  const album = (route.params as any)?.album as Album;

  if (!album) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Album not found</Text>
      </View>
    );
  }

  const imageUrl = album.image || '';
  const totalDuration = album.songs.reduce((sum, song) => sum + (song.duration || 0), 0);
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')} mins`;

  const handleShuffle = () => {
    const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
  };

  const handlePlay = () => {
    setQueue(album.songs, 0);
  };

  const handleSongPress = (song: Song) => {
    const index = album.songs.findIndex(s => s.id === song.id);
    setQueue(album.songs, index >= 0 ? index : 0);
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
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.albumInfo}>
          <Image source={{ uri: imageUrl }} style={styles.albumImage} />
          <Text style={styles.albumName}>{album.name}</Text>
          <Text style={styles.albumArtist}>{album.artist}</Text>
          {album.year && (
            <Text style={styles.albumStats}>
              {album.songCount} {album.songCount === 1 ? 'Song' : 'Songs'} | {album.year} | {durationText}
            </Text>
          )}
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

        <View style={styles.songsHeader}>
          <Text style={styles.songsTitle}>Songs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={album.songs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
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
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  albumInfo: {
    alignItems: 'center',
    padding: 24,
  },
  albumImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  albumName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  albumArtist: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  albumStats: {
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
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  songsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 16,
    color: colors.primary,
  },
});
