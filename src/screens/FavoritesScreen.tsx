import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useTheme } from '../hooks/useTheme';
import { SongItem } from '../components/SongItem';
import { Song } from '../types';

export const FavoritesScreen: React.FC = () => {
  const { colors } = useTheme();
  const { setQueue, addToQueue } = usePlayerStore();
  const { loadFavorites, getFavoriteSongs } = useFavoritesStore();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const favoriteSongs = getFavoriteSongs();

  const handleSongPress = (song: Song) => {
    const index = favoriteSongs.findIndex(s => s.id === song.id);
    setQueue(favoriteSongs, index >= 0 ? index : 0);
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
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>{favoriteSongs.length} songs</Text>
      </View>

      {favoriteSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyText}>No favorite songs yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any song to add it to favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteSongs}
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    color: colors.textSecondary,
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
