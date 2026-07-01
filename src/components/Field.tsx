// ============================================================
// AgroSat — Campo de input reutilizável (tema dinâmico)
// ============================================================
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import Icon from './Icon';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export default function Field({ icon, label, value, onChange, secure, trailing, placeholder, keyboardType, onSubmitEditing }) {
  const { colors, line } = useTheme();
  return (
    <View>
      {label ? <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 4, marginBottom: 6 }}>{label}</Text> : null}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12, height: 54, paddingHorizontal: 16,
        borderRadius: 16, backgroundColor: alpha(colors.hair, 0.05), borderWidth: 1, borderColor: line,
      }}>
        <Icon name={icon} size={19} color={colors.muted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={onSubmitEditing ? 'search' : undefined}
          autoCapitalize="none"
          style={{ flex: 1, color: colors.ink, fontSize: 15, fontFamily: fonts.body }}
        />
        {trailing}
      </View>
    </View>
  );
}
