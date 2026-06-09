// ============================================================
// AgroSat — Contexto de tema (claro/escuro dinâmico)
// ============================================================
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { themes, lineOf, makeSEV, makeMoist } from './colors';

const ThemeCtx = createContext(null);

// Lê o tema salvo (web: localStorage) — mantém a escolha entre reloads
function getInitialMode() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('agrosat-theme') || 'dark';
    }
  } catch (e) {}
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  // Web: salva a escolha + acompanha o fundo da página ao tema
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try { localStorage.setItem('agrosat-theme', mode); } catch (e) {}
      const page = themes[mode].page;
      document.body.style.backgroundColor = page;
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = page;
    }
  }, [mode]);

  const value = useMemo(() => {
    const colors = themes[mode];
    return {
      mode,
      colors,
      line: lineOf(colors),
      sev: makeSEV(colors),
      moist: makeMoist(colors),
      isDark: mode === 'dark',
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
      setMode,
    };
  }, [mode]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx) || {
    mode: 'dark', colors: themes.dark, line: lineOf(themes.dark),
    sev: makeSEV(themes.dark), moist: makeMoist(themes.dark), isDark: true,
    toggle: () => {}, setMode: () => {},
  };
}
