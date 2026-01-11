import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { ArtistDetailScreen } from '../screens/ArtistDetailScreen';
import { AlbumDetailScreen } from '../screens/AlbumDetailScreen';
import { PlaylistDetailScreen } from '../screens/PlaylistDetailScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlaylistsStore } from '../store/playlistsStore';

const Tab = createBottomTabNavigator();
const Stack = Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator();

const HomeTabs = () => {
  const { currentSong } = usePlayerStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: currentSong ? 75 : 0,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarLabel: 'Favorites',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>❤️</Text>,
          }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{
            tabBarLabel: 'Playlists',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
      <View style={styles.miniPlayerContainer}>
        <MiniPlayer />
      </View>
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  const { loadQueue } = usePlayerStore();
  const { loadFavorites } = useFavoritesStore();
  const { loadPlaylists } = usePlaylistsStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadQueue();
        await loadFavorites();
        await loadPlaylists();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    initializeApp();
  }, [loadQueue, loadFavorites, loadPlaylists]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
        <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
        <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={
            Platform.OS === 'web' 
              ? {} 
              : ({
                  presentation: 'fullScreenModal',
                } as any)
          }
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
