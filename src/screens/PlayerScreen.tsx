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
    padding: 28,
    paddingTop: 75,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 28,
    zIndex: 1000,
    padding: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.card,
    borderRadius: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  imageContainer: {
    marginBottom: 48,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 15,
  },
  albumArt: {
    width: 340,
    height: 340,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
    paddingHorizontal: 24,
  },
  songTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -1,
  },
  artistName: {
    fontSize: 22,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  albumName: {
    fontSize: 17,
    color: colors.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  seekContainer: {
    width: '100%',
    marginBottom: 48,
    paddingHorizontal: 12,
  },
  seekBar: {
    width: '100%',
    height: 52,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  timeText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonText: {
    fontSize: 26,
    color: colors.text,
    fontWeight: 'bold',
  },
  playPauseButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  playPauseButtonText: {
    fontSize: 40,
    color: colors.playButtonText,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 36,
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 28,
    backgroundColor: colors.surface,
    minWidth: 52,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryIcon: {
    fontSize: 24,
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
