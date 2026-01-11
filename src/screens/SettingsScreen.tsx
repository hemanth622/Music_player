import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useMiniPlayerStore } from '../store/miniPlayerStore';

export const SettingsScreen: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isVisible, loadVisibility, setVisibility } = useMiniPlayerStore();

  useEffect(() => {
    loadVisibility();
  }, [loadVisibility]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Switch between light and dark theme</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Mini Player</Text>
            <Text style={styles.settingDescription}>Show or hide the bottom player bar</Text>
          </View>
          <Switch
            value={isVisible}
            onValueChange={setVisibility}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>About</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>Privacy Policy</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
