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
    padding: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  artist: {
    fontSize: 14,
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
    marginLeft: 16,
    shadowColor: colors.playButton,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonText: {
    color: colors.playButtonText,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: colors.surface,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
