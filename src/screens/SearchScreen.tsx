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
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
    ...(Platform.OS === 'web' && {
      outline: 'none',
      outlineStyle: 'none',
      border: 'none',
    }),
    borderWidth: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  recentContainer: {
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearAllText: {
    fontSize: 16,
    color: colors.primary,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  recentItemText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colors.error + '20',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
