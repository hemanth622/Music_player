import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Platform,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { apiService } from '../services/api';
import { SongItem } from '../components/SongItem';
import { Song } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';

export const SearchScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const { setQueue, addToQueue } = usePlayerStore();

  const loadSongs = useCallback(async (query: string = '', pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let newSongs: Song[] = [];
      
      if (query.trim()) {
        const searchResponse = await apiService.searchSongs(query, pageNum, 20);
        newSongs = searchResponse.data?.results || [];
        
        if (append) {
          setSongs(prev => [...prev, ...newSongs]);
        } else {
          setSongs(newSongs);
        }
        setHasMore(newSongs.length === 20);

        if (query.trim() && !recentSearches.includes(query.trim())) {
          const newRecent = [query.trim(), ...recentSearches].slice(0, 10);
          setRecentSearches(newRecent);
        }
      } else {
        if (!append) {
          setSongs([]);
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load songs');
      console.error('Load songs error:', err);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    if (text.trim()) {
      loadSongs(text, 1, false);
    } else {
      setSongs([]);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && searchQuery.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSongs(searchQuery, nextPage, true);
    }
  };

  const handleSongPress = (song: Song) => {
    const index = songs.findIndex(s => s.id === song.id);
    setQueue(songs, index >= 0 ? index : 0);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSongs([]);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearch = (item: string) => {
    setRecentSearches(recentSearches.filter(s => s !== item));
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <SongItem
      song={item}
      onPress={() => handleSongPress(item)}
      onAddToQueue={() => addToQueue(item)}
    />
  );

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.textTertiary}
            autoFocus
            underlineColorAndroid="transparent"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.trim() === '' && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {recentSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => handleSearch(item)}
              >
                <Text style={styles.recentItemText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => removeRecentSearch(item)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {searchQuery.trim() && songs.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>😞</Text>
          <Text style={styles.emptyTitle}>Not Found</Text>
          <Text style={styles.emptyText}>
            Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
          </Text>
        </View>
      )}

      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
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
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 12,
    marginRight: 12,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    height: 56,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    paddingVertical: 0,
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      outline: 'none',
      outlineStyle: 'none',
      border: 'none',
    }),
    borderWidth: 0,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  recentContainer: {
    padding: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  clearAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 4,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentItemText: {
    fontSize: 17,
    color: colors.text,
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  removeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 140,
  },
  footerLoader: {
    padding: 32,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 24,
    backgroundColor: colors.error + '10',
    margin: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.error + '25',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  emptyText: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
