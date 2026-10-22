export type ThemeId = 'obsidian' | 'porcelain' | 'midnight';
export type AccentId = 'emerald' | 'cobalt' | 'amber' | 'crimson' | 'violet' | 'monolith';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light';
  description: string;
  previewBg: string;
  previewCard: string;
  previewBorder: string;
}

export interface AccentConfig {
  id: AccentId;
  name: string;
  hex: string;
  hoverHex: string;
  subtleBgDark: string;
  subtleBgLight: string;
  textColorDark: string;
  textColorLight: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    category: 'dark',
    description: 'Deep charcoal surfaces with crisp typography and subtle hairline borders.',
    previewBg: '#0b0c0e',
    previewCard: '#13151a',
    previewBorder: 'rgba(255,255,255,0.1)'
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    category: 'light',
    description: 'Warm editorial off-white surfaces with rich dark type and quiet contrast.',
    previewBg: '#f6f6f4',
    previewCard: '#ffffff',
    previewBorder: 'rgba(0,0,0,0.08)'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    category: 'dark',
    description: 'Subtle slate-blue shadows, deep oceanic tone, and cool restrained accents.',
    previewBg: '#07090e',
    previewCard: '#0e1219',
    previewBorder: 'rgba(56,189,248,0.15)'
  }
];

export const ACCENTS: AccentConfig[] = [
  {
    id: 'emerald',
    name: 'Racing Green',
    hex: '#10b981',
    hoverHex: '#059669',
    subtleBgDark: 'rgba(16, 185, 129, 0.12)',
    subtleBgLight: 'rgba(16, 185, 129, 0.12)',
    textColorDark: '#34d399',
    textColorLight: '#047857'
  },
  {
    id: 'cobalt',
    name: 'Electric Cobalt',
    hex: '#3b82f6',
    hoverHex: '#2563eb',
    subtleBgDark: 'rgba(59, 130, 246, 0.12)',
    subtleBgLight: 'rgba(59, 130, 246, 0.12)',
    textColorDark: '#60a5fa',
    textColorLight: '#1d4ed8'
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    hex: '#f59e0b',
    hoverHex: '#d97706',
    subtleBgDark: 'rgba(245, 158, 11, 0.12)',
    subtleBgLight: 'rgba(245, 158, 11, 0.12)',
    textColorDark: '#fbbf24',
    textColorLight: '#b45309'
  },
  {
    id: 'crimson',
    name: 'Nitro Crimson',
    hex: '#f43f5e',
    hoverHex: '#e11d48',
    subtleBgDark: 'rgba(244, 63, 94, 0.12)',
    subtleBgLight: 'rgba(244, 63, 94, 0.12)',
    textColorDark: '#fb7185',
    textColorLight: '#be123c'
  },
  {
    id: 'violet',
    name: 'Stealth Violet',
    hex: '#8b5cf6',
    hoverHex: '#7c3aed',
    subtleBgDark: 'rgba(139, 92, 246, 0.12)',
    subtleBgLight: 'rgba(139, 92, 246, 0.12)',
    textColorDark: '#a78bfa',
    textColorLight: '#6d28d9'
  },
  {
    id: 'monolith',
    name: 'Monolith',
    hex: '#e2e8f0',
    hoverHex: '#cbd5e1',
    subtleBgDark: 'rgba(255, 255, 255, 0.1)',
    subtleBgLight: 'rgba(0, 0, 0, 0.08)',
    textColorDark: '#ffffff',
    textColorLight: '#0f172a'
  }
];

export function applyThemeToDOM(themeId: ThemeId, accentId: AccentId): void {
  const root = document.documentElement;
  const isLight = themeId === 'porcelain';

  root.setAttribute('data-theme', themeId);
  root.setAttribute('data-accent', accentId);
  root.classList.toggle('dark', !isLight);
  root.classList.toggle('light', isLight);

  const accent = ACCENTS.find(a => a.id === accentId) || ACCENTS[0];

  // Dynamically set CSS variables on the root element
  root.style.setProperty('--accent', accent.hex);
  root.style.setProperty('--accent-hover', accent.hoverHex);
  root.style.setProperty(
    '--accent-subtle',
    isLight ? accent.subtleBgLight : accent.subtleBgDark
  );
  root.style.setProperty(
    '--accent-text',
    isLight ? accent.textColorLight : accent.textColorDark
  );

  // Apply theme-specific palette
  if (themeId === 'porcelain') {
    root.style.setProperty('--bg-primary', '#f6f6f4');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-elevated', '#efeee9');
    root.style.setProperty('--bg-muted', '#e7e6e1');
    root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--border-default', 'rgba(0, 0, 0, 0.11)');
    root.style.setProperty('--border-strong', 'rgba(0, 0, 0, 0.22)');
    root.style.setProperty('--text-primary', '#111317');
    root.style.setProperty('--text-secondary', '#525866');
    root.style.setProperty('--text-muted', '#868c98');
    root.style.setProperty('--card-shadow', '0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 24px -8px rgba(0, 0, 0, 0.06)');
  } else if (themeId === 'midnight') {
    root.style.setProperty('--bg-primary', '#07090e');
    root.style.setProperty('--bg-secondary', '#0d1118');
    root.style.setProperty('--bg-elevated', '#131922');
    root.style.setProperty('--bg-muted', '#1b222f');
    root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.06)');
    root.style.setProperty('--border-default', 'rgba(255, 255, 255, 0.11)');
    root.style.setProperty('--border-strong', 'rgba(56, 189, 248, 0.25)');
    root.style.setProperty('--text-primary', '#f0f6fc');
    root.style.setProperty('--text-secondary', '#8b949e');
    root.style.setProperty('--text-muted', '#545d68');
    root.style.setProperty('--card-shadow', '0 4px 20px -2px rgba(0, 0, 0, 0.5)');
  } else {
    // Obsidian (Default dark)
    root.style.setProperty('--bg-primary', '#0b0c0e');
    root.style.setProperty('--bg-secondary', '#121418');
    root.style.setProperty('--bg-elevated', '#171a20');
    root.style.setProperty('--bg-muted', '#20242d');
    root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.06)');
    root.style.setProperty('--border-default', 'rgba(255, 255, 255, 0.11)');
    root.style.setProperty('--border-strong', 'rgba(255, 255, 255, 0.2)');
    root.style.setProperty('--text-primary', '#f4f4f6');
    root.style.setProperty('--text-secondary', '#9499a5');
    root.style.setProperty('--text-muted', '#5b616e');
    root.style.setProperty('--card-shadow', '0 4px 20px -2px rgba(0, 0, 0, 0.55)');
  }
}
