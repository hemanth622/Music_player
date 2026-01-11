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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    padding: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface + 'CC',
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  albumName: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  seekContainer: {
    width: '100%',
    marginBottom: 32,
  },
  seekBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  controlButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  playPauseButtonText: {
    fontSize: 32,
    color: colors.playButtonText,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  secondaryButton: {
    padding: 8,
  },
  secondaryIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  lyricsSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  lyricsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
