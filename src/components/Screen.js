// ============================================================
// AgroSat — Screen shell (scroll + safe area) e Header (tema dinâmico)
// ============================================================
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { SpaceBg } from './ui';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export function Screen({ children, tab, orbit }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SpaceBg orbit={orbit} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: (tab ? 104 : 28) + insets.bottom,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

export function Header({ title, sub, onBack, right }) {
  const { colors, line } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {onBack && (
        <Pressable
          onPress={onBack}
          style={{ width: 40, height: 40, borderRadius: 12, marginLeft: -2, backgroundColor: alpha(colors.hair, 0.05), borderWidth: 1, borderColor: line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrowL" size={20} color={colors.ink} />
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 24 }}>{title}</Text>
        {sub ? <Text style={{ color: colors.sub, fontSize: 13, marginTop: 2 }} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}
