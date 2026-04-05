import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  dark: {
    bg:           '#1F2937',
    surface:      '#111827',
    border:       '#4B5563',
    borderMuted:  'rgba(75,85,99,0.5)',
    text:         '#E5E7EB',
    textMuted:    '#9CA3AF',
    textFaint:    '#4B5563',
    accent:       '#B45309',
    accentHover:  '#D97706',
    accentBg:     'rgba(180,83,9,0.1)',
    accentBorder: 'rgba(180,83,9,0.25)',
    accentGlow:   'rgba(180,83,9,0.4)',
    accentSoft:   'rgba(180,83,9,0.06)',
    accentSofter: 'rgba(180,83,9,0.04)',
    grid:         'rgba(180,83,9,0.04)',
    scanline:     'rgba(180,83,9,0.05)',
    particle:     '#B45309',
    ambient:      'rgba(180,83,9,0.07)',
    victory:      '#B45309',
    defeat:       '#9CA3AF',
    cardHoverShadow: '0 0 24px rgba(180,83,9,0.15), 0 4px 16px rgba(0,0,0,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(180,83,9,0.06) 0%, rgba(75,85,99,0.04) 100%)',
    topbarGradient: 'linear-gradient(90deg, #B45309, transparent)',
    sidebarAccent:  '#B45309',
    mode: 'dark',
  },
  light: {
    bg:           '#FDF6EC',
    surface:      '#FEF9F3',
    border:       '#D6C4A8',
    borderMuted:  'rgba(214,196,168,0.5)',
    text:         '#1C1917',
    textMuted:    '#78716C',
    textFaint:    '#A8997F',
    accent:       '#B45309',
    accentHover:  '#D97706',
    accentBg:     'rgba(180,83,9,0.08)',
    accentBorder: 'rgba(180,83,9,0.3)',
    accentGlow:   'rgba(180,83,9,0.35)',
    accentSoft:   'rgba(180,83,9,0.05)',
    accentSofter: 'rgba(180,83,9,0.03)',
    grid:         'rgba(180,83,9,0.035)',
    scanline:     'rgba(180,83,9,0.04)',
    particle:     '#D97706',
    ambient:      'rgba(180,83,9,0.06)',
    victory:      '#B45309',
    defeat:       '#78716C',
    cardHoverShadow: '0 0 24px rgba(180,83,9,0.12), 0 4px 16px rgba(0,0,0,0.08)',
    bannerGradient: 'linear-gradient(135deg, rgba(180,83,9,0.05) 0%, rgba(214,196,168,0.06) 100%)',
    topbarGradient: 'linear-gradient(90deg, #B45309, transparent)',
    sidebarAccent:  '#B45309',
    mode: 'light',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('argumind-theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('argumind-theme', mode);
  }, [mode]);

  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark');
  const theme  = themes[mode];

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);