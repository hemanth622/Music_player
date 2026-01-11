import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { Song } from '../types';
import { useTheme } from '../hooks/useTheme';

export const QueueScreen: React.FC = () => {
  const { colors } = useTheme();
  const { queue, currentIndex, currentSong, removeFromQueue, reorderQueue, playSong } = usePlayerStore();

  const handleRemove = (index: number) => {
    removeFromQueue(index);
  };

  const handleSongPress = (song: Song, index: number) => {
    playSong(song, index);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) {
      reorderQueue(index, index + 1);
    }
  };

  const styles = createStyles(colors);

  const renderQueueItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrent = index === currentIndex;
    const imageUrl = item.image?.[item.image.length - 1]?.url || '';
    const primaryArtists = item.artists?.primary?.map(a => a.name).join(', ') || item.primaryArtists || 'Unknown Artist';

    return (
      <TouchableOpacity
        style={[styles.queueItem, isCurrent && styles.currentItem]}
        onPress={() => handleSongPress(item, index)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.queueImage} />
        <View style={styles.queueInfo}>
          <Text style={[styles.queueTitle, isCurrent && styles.currentText]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.queueArtist} numberOfLines={1}>
            {primaryArtists}
          </Text>
        </View>
        {isCurrent && (
          <View style={styles.currentIndicator}>
            <Text style={styles.currentIndicatorText}>▶</Text>
          </View>
        )}
        <View style={styles.queueActions}>
          {index > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMoveUp(index)}
            >
              <Text style={styles.actionButtonText}>↑</Text>
            </TouchableOpacity>
          )}
          {index < queue.length - 1 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMoveDown(index)}
            >
              <Text style={styles.actionButtonText}>↓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(index)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Queue ({queue.length})</Text>
      </View>
      {queue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Queue is empty</Text>
          <Text style={styles.emptySubtext}>Add songs from the Home screen</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          renderItem={renderQueueItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  currentItem: {
    backgroundColor: colors.primary + '20',
  },
  queueImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: colors.card,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  currentText: {
    color: colors.primary,
  },
  queueArtist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentIndicator: {
    marginLeft: 8,
    marginRight: 8,
  },
  currentIndicatorText: {
    fontSize: 16,
    color: colors.primary,
  },
  queueActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: colors.error,
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
