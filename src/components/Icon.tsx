// ============================================================
// AgroSat — Icon (react-native-svg) — paths do design (Ico)
// ============================================================
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export const Ico = {
  home: 'M3 10.6 12 3l9 7.6M5 9.4V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.4',
  layers: 'M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  plus: 'M12 5v14M5 12h14',
  droplet: 'M12 3.5s6 6.2 6 10.3A6 6 0 0 1 6 13.8C6 9.7 12 3.5 12 3.5Z',
  thermometer: 'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9a3 3 0 1 1-3 3',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.5 2 8a7 7 0 0 1-7 7Zm0 0c.5-4 2-6 5-8',
  chevR: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-6 6 6 6',
  arrowL: 'M19 12H5M12 19l-7-7 7-7',
  mail: 'M3 6.5h18v11H3zM3.5 7l8.5 6 8.5-6',
  lock: 'M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  eyeOff: 'M2 12s3.5-7 10-7c1.6 0 3 .4 4.3 1M22 12s-3.5 7-10 7c-1.6 0-3-.4-4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18',
  pin: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  alert: 'M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01',
  satellite: 'M5 14l-3 3 4 4 3-3M14 5l3-3 4 4-3 3M9 9l6 6M7.5 7.5 4 11M16.5 16.5 20 13M11 4a5 5 0 0 1 5 5',
  check: 'M20 6 9 17l-5-5',
  chart: 'M3 3v18h18M7 15l3-4 3 3 4-6',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  clock: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  calendar: 'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4',
  gauge: 'M12 13l4-4M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z',
  sprout: 'M12 21v-7M12 14c0-3-2-5-5-5H4c0 3 2 5 5 5h3Zm0 0c0-3.3 2.2-6 5.5-6H20c0 3.3-2.2 6-5.5 6H12Z',
  signal: 'M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4',
  sun2: 'M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  moon: 'M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v7M14 10v7',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
  x: 'M18 6 6 18M6 6l12 12',
  swap: 'M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8',
};

export default function Icon({ name, size = 22, color, stroke = 1.8, style }) {
  const { colors } = useTheme();
  const d = Ico[name];
  if (!d) return null;
  const col = color || colors.ink;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {d.split('M').filter(Boolean).map((seg, i) => (
        <Path
          key={i}
          d={'M' + seg}
          stroke={col}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
