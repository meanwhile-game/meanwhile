import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, AccentId, THEMES, ACCENTS, applyThemeToDOM, ThemeConfig, AccentConfig } from './theme.js';

interface ThemeContextType {
  themeId: ThemeId;
  accentId: AccentId;
  currentTheme: ThemeConfig;
  currentAccent: AccentConfig;
  isLight: boolean;
  setTheme: (theme: ThemeId) => void;
  setAccent: (accent: AccentId) => void;
  previewTheme: (theme: ThemeId) => void;
  resetPreview: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = (localStorage.getItem('meanwhile_theme') || localStorage.getItem('veloce_theme')) as ThemeId;
    if (saved && THEMES.some(t => t.id === saved)) return saved;
    return 'obsidian';
  });

  const [accentId, setAccentIdState] = useState<AccentId>(() => {
    const saved = (localStorage.getItem('meanwhile_accent') || localStorage.getItem('veloce_accent')) as AccentId;
    if (saved && ACCENTS.some(a => a.id === saved)) return saved;
    return 'emerald';
  });

  const [activePreviewTheme, setActivePreviewTheme] = useState<ThemeId | null>(null);

  // Apply to DOM on state change
  useEffect(() => {
    const active = activePreviewTheme || themeId;
    applyThemeToDOM(active, accentId);
  }, [themeId, accentId, activePreviewTheme]);

  const setTheme = (newTheme: ThemeId) => {
    setThemeIdState(newTheme);
    setActivePreviewTheme(null);
    localStorage.setItem('meanwhile_theme', newTheme);
  };

  const setAccent = (newAccent: AccentId) => {
    setAccentIdState(newAccent);
    localStorage.setItem('meanwhile_accent', newAccent);
  };

  const previewTheme = (preview: ThemeId) => {
    setActivePreviewTheme(preview);
    applyThemeToDOM(preview, accentId);
  };

  const resetPreview = () => {
    setActivePreviewTheme(null);
    applyThemeToDOM(themeId, accentId);
  };

  const effectiveThemeId = activePreviewTheme || themeId;
  const currentTheme = THEMES.find(t => t.id === effectiveThemeId) || THEMES[0];
  const currentAccent = ACCENTS.find(a => a.id === accentId) || ACCENTS[0];
  const isLight = currentTheme.category === 'light';

  return (
    <ThemeContext.Provider
      value={{
        themeId: effectiveThemeId,
        accentId,
        currentTheme,
        currentAccent,
        isLight,
        setTheme,
        setAccent,
        previewTheme,
        resetPreview
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
