import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useMiniPlayerStore } from '../store/miniPlayerStore';

export const MiniPlayer: React.FC = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, togglePlayPause } = usePlayerStore();
  const { colors } = useTheme();
  const { isVisible, loadVisibility, setVisibility } = useMiniPlayerStore();

  useEffect(() => {
    loadVisibility();
  }, [loadVisibility]);

  const handleClose = async (e: any) => {
    e.stopPropagation();
    await setVisibility(false);
  };

  if (!currentSong || !isVisible) {
    return null;
  }

  const imageUrl = currentSong.image?.[currentSong.image.length - 1]?.url || '';
  const primaryArtists = currentSong.artists?.primary?.map(a => a.name).join(', ') || currentSong.primaryArtists || 'Unknown Artist';

  const handlePress = () => {
    navigation.navigate('Player' as never);
  };

  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentSong.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {primaryArtists}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={(e) => {
          e.stopPropagation();
          togglePlayPause();
        }}
      >
        <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: colors.card,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.playButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  playButtonText: {
    color: colors.playButtonText,
    fontSize: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
