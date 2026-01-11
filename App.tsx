import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/themeStore';

export default function App() {
  const { mode } = useThemeStore();
  
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
