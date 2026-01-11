import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Song } from '../types';

const { width } = Dimensions.get('window');

interface Album {
  id: string;
  name: string;
  artist: string;
  image?: string;
  songCount: number;
  year?: string;
  songs: Song[];
}

export const AlbumsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { queue } = usePlayerStore();
  const navigation = useNavigation();

  const albums = useMemo(() => {
    const albumMap = new Map<string, Album>();

    queue.forEach((song) => {
      if (!song.album?.id) return;

      const albumId = song.album.id;
      if (!albumMap.has(albumId)) {
        const primaryArtists = song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || 'Unknown Artist';
        
        albumMap.set(albumId, {
          id: albumId,
          name: song.album.name,
          artist: primaryArtists,
          image: song.image?.[song.image.length - 1]?.url,
          year: song.year,
          songCount: 0,
          songs: [],
        });
      }
      
      const albumData = albumMap.get(albumId)!;
      if (!albumData.songs.find(s => s.id === song.id)) {
        albumData.songs.push(song);
        albumData.songCount = albumData.songs.length;
      }
    });

    return Array.from(albumMap.values()).sort((a, b) => {
      if (a.year && b.year) {
        return b.year.localeCompare(a.year);
      }
      return a.name.localeCompare(b.name);
    });
  }, [queue]);

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('AlbumDetail' as never, { album } as never);
  };

  const styles = createStyles(colors);

  const renderAlbumItem = ({ item }: { item: Album }) => {
    const imageUrl = item.image || '';

    return (
      <TouchableOpacity
        style={styles.albumItem}
        onPress={() => handleAlbumPress(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.albumImage} />
        <View style={styles.albumInfo}>
          <Text style={styles.albumName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.albumArtist} numberOfLines={1}>
            {item.artist}
          </Text>
          {item.year && (
            <Text style={styles.albumYear}>{item.year}</Text>
          )}
          <Text style={styles.albumCount}>
            {item.songCount} {item.songCount === 1 ? 'song' : 'songs'}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{albums.length} albums</Text>
        <TouchableOpacity>
          <Text style={styles.sortText}>Date Modified ⬍</Text>
        </TouchableOpacity>
      </View>

      {albums.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No albums found</Text>
          <Text style={styles.emptySubtext}>Add songs to your queue to see albums</Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          renderItem={renderAlbumItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
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
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  albumItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  albumImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  albumYear: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  albumCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: colors.surface + 'CC',
    borderRadius: 16,
  },
  menuButtonText: {
    fontSize: 16,
    color: colors.text,
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
