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
  Image,
  Dimensions,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { apiService } from '../services/api';
import { SongItem } from '../components/SongItem';
import { Song } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { ArtistsScreen } from './ArtistsScreen';
import { AlbumsScreen } from './AlbumsScreen';

const { width } = Dimensions.get('window');

type TabType = 'suggested' | 'songs' | 'artists' | 'albums';

export const HomeScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('suggested');
  const navigation = useNavigation();
  const { colors } = useTheme();

  const { setQueue, addToQueue, playSong, queue } = usePlayerStore();

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
  }, []);

  useEffect(() => {
    setSongs([]);
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    loadSongs(text, 1, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && searchQuery.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSongs(searchQuery, nextPage, true);
    }
  };

  const handleSongPress = (song: Song) => {
    const currentSongs = searchQuery ? songs : songs;
    const index = currentSongs.findIndex(s => s.id === song.id);
    setQueue(currentSongs, index >= 0 ? index : 0);
    Keyboard.dismiss();
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <SongItem
      song={item}
      onPress={() => handleSongPress(item)}
      onAddToQueue={() => handleAddToQueue(item)}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const styles = createStyles(colors);

  const renderSuggestedContent = () => {
    const recentSongs = (queue || []).slice(0, 10);
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {recentSongs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Played</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {recentSongs.map((song, index) => {
                const imageUrl = song.image?.[song.image.length - 1]?.url || '';
                return (
                  <TouchableOpacity
                    key={`recent-${song.id}-${index}`}
                    style={styles.albumCard}
                    onPress={() => {
                      const queueIndex = queue.findIndex(s => s.id === song.id);
                      setQueue(queue, queueIndex >= 0 ? queueIndex : 0);
                    }}
                  >
                    <Image source={{ uri: imageUrl }} style={styles.albumArt} />
                    <Text style={styles.albumTitle} numberOfLines={2}>{song.name}</Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>
                      {song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || 'Unknown'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {songs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Most Played</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {songs.slice(0, 10).map((song, index) => {
                const imageUrl = song.image?.[song.image.length - 1]?.url || '';
                return (
                  <TouchableOpacity
                    key={`mostplayed-${song.id}-${index}`}
                    style={styles.albumCard}
                    onPress={() => {
                      const songIndex = songs.findIndex(s => s.id === song.id);
                      setQueue(songs, songIndex >= 0 ? songIndex : 0);
                    }}
                  >
                    <Image source={{ uri: imageUrl }} style={styles.albumArt} />
                    <Text style={styles.albumTitle} numberOfLines={2}>{song.name}</Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>
                      {song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || 'Unknown'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!loading && recentSongs.length === 0 && songs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Start playing songs to see suggestions</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>🎵</Text>
          <Text style={styles.title}>Melodex</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {(['suggested', 'songs', 'artists', 'albums'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'suggested' && renderSuggestedContent()}

      {activeTab === 'songs' && (
        <>
          <View style={styles.songsHeader}>
            <Text style={styles.songsCount}>{songs.length} songs</Text>
            <TouchableOpacity>
              <Text style={styles.sortText}>Ascending ⬍</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={item => item.id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery.trim() ? 'No songs found. Try a different search.' : 'Search for songs to get started'}
                  </Text>
                </View>
              ) : null
            }
          />
        </>
      )}

      {activeTab === 'artists' && <ArtistsScreen />}
      {activeTab === 'albums' && <AlbumsScreen />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    letterSpacing: -0.5,
  },
  searchButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  searchIcon: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.card,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    display: 'none',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 32,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  albumCard: {
    width: width * 0.38,
    marginRight: 16,
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  albumTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  albumArtist: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    marginTop: 16,
  },
  songsCount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  sortText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  footerLoader: {
    padding: 24,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: colors.error + '15',
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
