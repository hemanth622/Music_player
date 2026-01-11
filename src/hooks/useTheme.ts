import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const { colors, mode, toggleTheme, setTheme } = useThemeStore();
  return {
    colors,
    isDark: mode === 'dark',
    mode,
    toggleTheme,
    setTheme,
  };
};
