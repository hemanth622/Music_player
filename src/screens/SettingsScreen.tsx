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
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  section: {
    marginTop: 40,
    backgroundColor: colors.card,
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 24,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  settingDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  settingArrow: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});
