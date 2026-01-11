import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Song } from '../types';

interface Artist {
  id: string;
  name: string;
  image?: string;
  songCount: number;
  songs: Song[];
}

export const ArtistsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { queue } = usePlayerStore();
  const navigation = useNavigation();

  const artists = useMemo(() => {
    const artistMap = new Map<string, Artist>();

    queue.forEach((song) => {
      const primaryArtists = song.artists?.primary || [];
      
      primaryArtists.forEach((artist) => {
        if (!artistMap.has(artist.id)) {
          artistMap.set(artist.id, {
            id: artist.id,
            name: artist.name,
            image: song.image?.[song.image.length - 1]?.url,
            songCount: 0,
            songs: [],
          });
        }
        
        const artistData = artistMap.get(artist.id)!;
        if (!artistData.songs.find(s => s.id === song.id)) {
          artistData.songs.push(song);
          artistData.songCount = artistData.songs.length;
        }
      });
    });

    return Array.from(artistMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [queue]);

  const handleArtistPress = (artist: Artist) => {
    navigation.navigate('ArtistDetail' as never, { artist } as never);
  };

  const styles = createStyles(colors);

  const renderArtistItem = ({ item }: { item: Artist }) => {
    const imageUrl = item.image || '';

    return (
      <TouchableOpacity
        style={styles.artistItem}
        onPress={() => handleArtistPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.artistImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.artistImage} />
          ) : (
            <View style={[styles.artistImage, styles.artistPlaceholder]}>
              <Text style={styles.artistPlaceholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.artistInfo}>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.artistCount}>
            {item.songCount} {item.songCount === 1 ? 'Song' : 'Songs'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
          }}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{artists.length} artists</Text>
        <TouchableOpacity>
          <Text style={styles.sortText}>Date Added ⬍</Text>
        </TouchableOpacity>
      </View>

      {artists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No artists found</Text>
          <Text style={styles.emptySubtext}>Add songs to your queue to see artists</Text>
        </View>
      ) : (
        <FlatList
          data={artists}
          renderItem={renderArtistItem}
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  sortText: {
    fontSize: 16,
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 100,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  artistImageContainer: {
    marginRight: 12,
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
  },
  artistPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '30',
  },
  artistPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  artistCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: 'bold',
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
