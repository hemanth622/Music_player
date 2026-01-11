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
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  artist: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.playButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.playButton,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonText: {
    color: colors.playButtonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 24,
  },
  favoriteButtonText: {
    fontSize: 22,
  },
  menuButton: {
    padding: 12,
    borderRadius: 24,
  },
  menuButtonText: {
    color: colors.textSecondary,
    fontSize: 22,
    fontWeight: 'bold',
  },
});
