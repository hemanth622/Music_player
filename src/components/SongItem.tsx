import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Song } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useFavoritesStore } from '../store/favoritesStore';
import { SongContextMenu } from './SongContextMenu';

interface SongItemProps {
  song: Song;
  onPress: () => void;
  onAddToQueue?: () => void;
  showPlayButton?: boolean;
  showFavorite?: boolean;
}

export const SongItem: React.FC<SongItemProps> = ({ song, onPress, onAddToQueue, showPlayButton = true, showFavorite = true }) => {
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const imageUrl = song.image?.[song.image.length - 1]?.url || '';
  const primaryArtists = song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || 'Unknown Artist';
  const favorite = isFavorite(song.id);

  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {primaryArtists}
        </Text>
      </View>
      {showPlayButton && (
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={(e) => {
            e.stopPropagation();
            onPress();
          }}
        >
          <Text style={styles.playButtonText}>▶</Text>
        </TouchableOpacity>
      )}
      {showFavorite && (
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
        >
          <Text style={styles.favoriteButtonText}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={(e) => {
          e.stopPropagation();
          setShowContextMenu(true);
        }}
      >
        <Text style={styles.menuButtonText}>⋮</Text>
      </TouchableOpacity>
      
      <SongContextMenu
        visible={showContextMenu}
        song={song}
        onClose={() => setShowContextMenu(false)}
      />
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  artist: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.playButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.playButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playButtonText: {
    color: colors.playButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 10,
    marginRight: 4,
    borderRadius: 20,
  },
  favoriteButtonText: {
    fontSize: 20,
  },
  menuButton: {
    padding: 10,
    borderRadius: 20,
  },
  menuButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
