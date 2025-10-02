import { createContext, useContext, useEffect, useState } from 'react';
import { themes, defaultTheme } from '../config/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Theme name (solar-dusk, clean-slate)
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem('themeName');
    return saved || defaultTheme;
  });

  // Theme mode (dark, light)
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Apply dark/light mode class
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme-specific CSS variables
    const currentTheme = themes[themeName];
    if (currentTheme) {
      const themeColors = mode === 'dark' ? currentTheme.dark : currentTheme.light;

      // Apply color variables
      Object.entries(themeColors).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value);
      });

      // Apply typography variables
      if (currentTheme.fonts) {
        root.style.setProperty('--font-sans', currentTheme.fonts.sans);
        root.style.setProperty('--font-serif', currentTheme.fonts.serif);
        root.style.setProperty('--font-mono', currentTheme.fonts.mono);
      }

      // Apply design tokens
      if (currentTheme.radius) {
        root.style.setProperty('--radius', currentTheme.radius);
      }
      if (currentTheme.spacing) {
        root.style.setProperty('--spacing', currentTheme.spacing);
      }
    }

    // Save to localStorage
    localStorage.setItem('themeName', themeName);
    localStorage.setItem('themeMode', mode);
  }, [themeName, mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setThemeName(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{
      themeName,
      mode,
      theme: mode, // Keep for backwards compatibility
      toggleTheme: toggleMode, // Keep for backwards compatibility
      toggleMode,
      changeTheme,
      availableThemes: Object.keys(themes).map(key => ({
        id: key,
        ...themes[key]
      }))
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
