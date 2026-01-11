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
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.playButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playButtonText: {
    color: colors.playButtonText,
    fontSize: 14,
  },
  favoriteButton: {
    padding: 8,
    marginRight: 4,
  },
  favoriteButtonText: {
    fontSize: 18,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
