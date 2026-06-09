// ============================================================
// AgroSat — UI primitives (tema dinâmico via useTheme)
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, G, Rect, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';

/* ---------- BUTTON ---------- */
export function Button({ children, onPress, variant = 'primary', full, icon, style }) {
  const { colors, line } = useTheme();
  const v = {
    primary: { bg: colors.primary, fg: colors.white, border: 'transparent' },
    ghost: { bg: alpha(colors.hair, 0.05), fg: colors.ink, border: line },
    soft: { bg: alpha(colors.primary, 0.1), fg: colors.primary, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        { height: 52, paddingHorizontal: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
        { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border === 'transparent' ? 0 : 1 },
        full && { alignSelf: 'stretch' },
        hovered && (variant === 'ghost'
          ? { backgroundColor: alpha(colors.primary, 0.12), borderColor: alpha(colors.primary, 0.45) }
          : { opacity: 0.9 }),
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {icon && <Icon name={icon} size={19} color={v.fg} />}
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: v.fg }}>{children}</Text>
    </Pressable>
  );
}

/* ---------- SEV CHIP ---------- */
export function SevChip({ sev, size = 'sm' }) {
  const { sev: SEV } = useTheme();
  const { t } = useSettings();
  const s = SEV[sev] || SEV.BAIXA;
  const small = size === 'sm';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, alignSelf: 'flex-start', backgroundColor: s.bg, paddingHorizontal: small ? 10 : 12, paddingVertical: small ? 3 : 4 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.c }} />
      <Text style={{ fontFamily: fonts.mono, letterSpacing: 0.5, color: s.c, fontSize: small ? 10.5 : 12 }}>{t('sev.' + (sev || 'BAIXA'))}</Text>
    </View>
  );
}

/* ---------- TAG ---------- */
export function Tag({ children, tone = 'sub' }) {
  const { colors } = useTheme();
  const t = {
    sub: { c: colors.sub, bg: alpha(colors.hair, 0.06) },
    primary: { c: colors.primary, bg: alpha(colors.primary, 0.1) },
    crop: { c: colors.crop, bg: alpha(colors.crop, 0.1) },
  }[tone];
  return (
    <View style={{ borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', backgroundColor: t.bg }}>
      <Text style={{ color: t.c, fontSize: 11, fontFamily: fonts.displayMed }}>{children}</Text>
    </View>
  );
}

/* ---------- CARD ---------- */
export function Card({ children, style, onPress, glow }) {
  const { colors, line } = useTheme();
  const base = [
    { borderRadius: 26, backgroundColor: colors.card, borderWidth: 1, borderColor: line },
    glow && { borderColor: alpha(colors.primary, 0.12) },
    style,
  ];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && { transform: [{ scale: 0.99 }] }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

/* ---------- RADIAL GAUGE ---------- */
export function Gauge({ value, max = 100, unit = '%', label, color, size = 116, ideal }) {
  const { colors } = useTheme();
  const stroke = color || colors.primary;
  const r = size / 2 - 11;
  const cx = size / 2;
  const C2 = 2 * Math.PI * r;
  const span = 0.74;
  const pct = Math.max(0, Math.min(1, value / max));
  const track = `${span * C2} ${C2}`;
  const val = `${pct * span * C2} ${C2}`;
  const idealDash = ideal ? `0 ${span * C2 * (ideal[0] / max)} ${span * C2 * ((ideal[1] - ideal[0]) / max)} ${C2}` : null;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation={133} origin={`${cx}, ${cx}`}>
          <Circle cx={cx} cy={cx} r={r} fill="none" stroke={alpha(colors.hair, 0.1)} strokeWidth={9} strokeDasharray={track} strokeLinecap="round" />
          {idealDash && <Circle cx={cx} cy={cx} r={r} fill="none" stroke={alpha(colors.hair, 0.2)} strokeWidth={9} strokeDasharray={idealDash} />}
          <Circle cx={cx} cy={cx} r={r} fill="none" stroke={stroke} strokeWidth={9} strokeDasharray={val} strokeLinecap="round" />
        </G>
      </Svg>
      <View style={{ alignItems: 'center', paddingBottom: 6 }}>
        <Text style={{ fontFamily: fonts.monoSemi, color: colors.ink, fontSize: size * 0.27 }}>
          {value}
          <Text style={{ fontFamily: fonts.body, color: colors.sub, fontSize: size * 0.14 }}>{unit}</Text>
        </Text>
        {label ? <Text style={{ fontSize: 9.5, letterSpacing: 1, color: colors.muted, marginTop: 2, textTransform: 'uppercase' }}>{label}</Text> : null}
      </View>
    </View>
  );
}

/* ---------- LINEAR BAR ---------- */
export function Bar({ value, max = 100, color, ideal, height = 7 }) {
  const { colors } = useTheme();
  const fill = color || colors.low;
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <View style={{ height, borderRadius: 99, backgroundColor: alpha(colors.hair, 0.09), overflow: 'hidden' }}>
      {ideal && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${(ideal[0] / max) * 100}%`, width: `${((ideal[1] - ideal[0]) / max) * 100}%`, backgroundColor: alpha(colors.hair, 0.1) }} />
      )}
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, borderRadius: 99, backgroundColor: fill }} />
    </View>
  );
}

/* ---------- METRIC ---------- */
export function Metric({ icon, label, value, unit, color }) {
  const { colors } = useTheme();
  const c = color || colors.primary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(c, 0.14) }}>
        <Icon name={icon} size={18} color={c} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
        <Text style={{ fontFamily: fonts.mono, color: colors.ink, fontSize: 15 }}>
          {value}
          <Text style={{ color: colors.sub, fontSize: 12 }}>{unit}</Text>
        </Text>
      </View>
    </View>
  );
}

/* ---------- STATUS BAR ---------- */
export function StatusBar({ time = '08:24' }) {
  const { colors } = useTheme();
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 14 }} pointerEvents="none">
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink }}>{time}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="signal" size={15} color={colors.ink} stroke={2.2} />
        <Svg width={22} height={13}>
          <Rect x={1} y={1.5} width={17} height={10} rx={2.5} fill="none" stroke={colors.ink} strokeWidth={1.2} />
          <Rect x={2.6} y={3} width={12} height={7} rx={1.2} fill={colors.ink} />
          <Rect x={19} y={4.5} width={1.6} height={4} rx={1} fill={colors.ink} />
        </Svg>
      </View>
    </View>
  );
}

/* ---------- SPACE BACKGROUND ---------- */
export function SpaceBg({ orbit }) {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[alpha(colors.primary, 0.07), 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }} />
      {orbit && (
        <Svg width={340} height={340} style={{ position: 'absolute', top: -110, right: -90, opacity: 0.12 }} viewBox="0 0 360 360">
          <Ellipse cx={180} cy={180} rx={150} ry={60} fill="none" stroke={colors.primary} strokeWidth={1} rotation={-25} origin="180, 180" />
          <Ellipse cx={180} cy={180} rx={120} ry={120} fill="none" stroke={colors.primary} strokeWidth={0.6} strokeDasharray="3 6" />
          <Circle cx={312} cy={120} r={3} fill={colors.primary} />
        </Svg>
      )}
    </View>
  );
}
