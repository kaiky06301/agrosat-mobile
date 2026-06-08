// ============================================================
// AgroSat — temas (claro + escuro). Dinâmico via ThemeContext.
// ============================================================

// #RRGGBB + alpha -> rgba()
export function alpha(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const dark = {
  bg: '#1C140C', surface: '#261C12', card: '#2C2116', cardhi: '#382B1D',
  ink: '#F3ECE2', sub: '#BAAA98', muted: '#8D7E6C',
  primary: '#66BE5C', crop: '#749CB2', low: '#66BE5C', med: '#E2B64E', high: '#DC6E50',
  hair: '#FFF3E6', page: '#140E08', white: '#FFFFFF',
};

export const light = {
  bg: '#F6F4EC', surface: '#FFFFFF', card: '#FFFFFF', cardhi: '#F3F1E7',
  ink: '#1D2A1A', sub: '#5A6A54', muted: '#8A9580',
  primary: '#3C8B3A', crop: '#3D86A8', low: '#2E9E54', med: '#C58A18', high: '#D2564E',
  hair: '#1C2A18', page: '#ECE9DD', white: '#FFFFFF',
};

export const themes = { dark, light };

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  displayMed: 'SpaceGrotesk_500Medium',
  body: 'SpaceGrotesk_400Regular',
  mono: 'JetBrainsMono_500Medium',
  monoSemi: 'JetBrainsMono_600SemiBold',
};

export const lineOf = (c) => alpha(c.hair, c === light ? 0.14 : 0.09);

export const makeSEV = (c) => ({
  BAIXA: { c: c.low, bg: alpha(c.low, 0.14), label: 'BAIXA' },
  MEDIA: { c: c.med, bg: alpha(c.med, 0.15), label: 'MÉDIA' },
  ALTA: { c: c.high, bg: alpha(c.high, 0.16), label: 'ALTA' },
});

// Retorna a cor + a CHAVE de estado de umidade (traduzida nas telas via t('moist.<key>'))
export const makeMoist = (c) => (v, lo = 40, hi = 70) => {
  if (v < lo) return { c: c.high, key: 'seco' };
  if (v > hi) return { c: c.crop, key: 'excesso' };
  return { c: c.low, key: 'ideal' };
};

// ---- Compat (fallback dark) p/ qualquer uso estático ----
export const colors = dark;
export const line = lineOf(dark);
export const SEV = makeSEV(dark);
export const moistState = makeMoist(dark);
