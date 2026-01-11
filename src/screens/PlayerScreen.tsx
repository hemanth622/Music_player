import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { SongContextMenu } from '../components/SongContextMenu';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    playMode,
    isLoading,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setPlayMode,
    downloadSong,
    downloadedSongs,
  } = usePlayerStore();

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (duration > 0 && position >= duration - 0.5 && isPlaying) {
      playNext();
    }
  }, [position, duration, isPlaying]);

  const styles = createStyles(colors);

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No song selected</Text>
      </View>
    );
  }

  const imageUrl = currentSong.image?.[currentSong.image.length - 1]?.url || '';
  const primaryArtists = currentSong.artists?.primary?.map(a => a.name).join(', ') || currentSong.primaryArtists || 'Unknown Artist';
  const isDownloaded = downloadedSongs.has(currentSong.id);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadSong(currentSong);
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSeek = (value: number) => {
    seekTo(value);
  };

  const cyclePlayMode = () => {
    const modes: Array<'normal' | 'repeat' | 'repeat-one' | 'shuffle'> = ['normal', 'repeat', 'repeat-one', 'shuffle'];
    const currentIndex = modes.indexOf(playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'repeat':
        return '🔁';
      case 'repeat-one':
        return '🔂';
      case 'shuffle':
        return '🔀';
      default:
        return '➡️';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.albumArt} />
      </View>

      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{currentSong.name}</Text>
        <Text style={styles.artistName}>{primaryArtists}</Text>
        {currentSong.album && (
          <Text style={styles.albumName}>{currentSong.album.name}</Text>
        )}
      </View>

      <View style={styles.seekContainer}>
        <Slider
          style={styles.seekBar}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={playPrevious}>
          <Text style={styles.controlButtonText}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => seekTo(Math.max(0, position - 10))}>
          <Text style={styles.controlButtonText}>⟲ 10</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.playButtonText} />
          ) : (
            <Text style={styles.playPauseButtonText}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => seekTo(Math.min(duration, position + 10))}>
          <Text style={styles.controlButtonText}>⟳ 10</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={playNext}>
          <Text style={styles.controlButtonText}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryControls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={cyclePlayMode}>
          <Text style={styles.secondaryIcon}>{getPlayModeIcon()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryIcon}>⏰</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryIcon}>📺</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setShowMenu(true)}
        >
          <Text style={styles.secondaryIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lyricsSection}>
        <TouchableOpacity>
          <Text style={styles.lyricsText}>∧ Lyrics</Text>
        </TouchableOpacity>
      </View>

      {currentSong && (
        <SongContextMenu
          visible={showMenu}
          song={currentSong}
          onClose={() => setShowMenu(false)}
        />
      )}
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 70,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 24,
    zIndex: 1000,
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  imageContainer: {
    marginBottom: 40,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  albumArt: {
    width: 320,
    height: 320,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  artistName: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  albumName: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
  },
  seekContainer: {
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  seekBar: {
    width: '100%',
    height: 48,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    backgroundColor: colors.card,
  },
  controlButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playPauseButtonText: {
    fontSize: 36,
    color: colors.playButtonText,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 32,
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: colors.card,
    minWidth: 48,
    alignItems: 'center',
  },
  secondaryIcon: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  lyricsSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  lyricsText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
    fontWeight: '500',
  },
});
