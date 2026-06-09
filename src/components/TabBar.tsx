// ============================================================
// AgroSat — Tab bar customizada (FAB central) — tema dinâmico
// ============================================================
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';

const TABS = [
  { key: 'dashboard', icon: 'home' },
  { key: 'talhoes', icon: 'layers' },
  { key: 'alertas', icon: 'bell' },
  { key: 'registrar', icon: 'plus', fab: true },
];

export default function TabBar({ active, onNav }) {
  const { colors, line } = useTheme();
  const { t: tr } = useSettings();
  const { alertasAtivos = 0 } = useAppData();
  const alertCount = alertasAtivos;
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, paddingHorizontal: 12, paddingBottom: insets.bottom + 8,
      backgroundColor: alpha(colors.bg, 0.96), borderTopWidth: 1, borderTopColor: line,
    }}>
      {TABS.map((t) => {
        const on = active === t.key || (t.key === 'talhoes' && active === 'detalhe');
        if (t.fab) {
          return (
            <Pressable key={t.key} onPress={() => onNav(t.key)} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View style={{ width: 46, height: 46, borderRadius: 16, marginTop: -20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
                <Icon name="plus" size={24} color={colors.white} stroke={2.4} />
              </View>
              <Text style={{ fontSize: 10, fontFamily: fonts.displayMed, color: on ? colors.primary : colors.muted }}>{tr('tabs.' + t.key)}</Text>
            </Pressable>
          );
        }
        return (
          <Pressable key={t.key} onPress={() => onNav(t.key)} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View>
              <Icon name={t.icon} size={23} color={on ? colors.primary : colors.muted} stroke={on ? 2.2 : 1.8} />
              {t.key === 'alertas' && alertCount > 0 && (
                <View style={{ position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: colors.high, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.white, fontSize: 10, fontFamily: fonts.monoSemi }}>{alertCount}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 10, fontFamily: fonts.displayMed, color: on ? colors.primary : colors.muted }}>{tr('tabs.' + t.key)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
