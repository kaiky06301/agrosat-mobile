// ============================================================
// AgroSat — estados de carregamento / erro / vazio (feedback visual)
// Usados junto do hook useAsync para cumprir o requisito da
// apostila: "feedbacks visuais (mensagens, loaders, alertas)".
// ============================================================
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './ui';

export function Loading({ label = 'Carregando…' }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 56, alignItems: 'center', gap: 12 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.sub, fontSize: 14 }}>{label}</Text>
    </View>
  );
}

export function ErrorBox({ message, onRetry }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 44, alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 36 }}>⚠️</Text>
      <Text style={{ color: colors.sub, fontSize: 14, textAlign: 'center', maxWidth: 260 }}>
        {message || 'Não foi possível carregar os dados.'}
      </Text>
      {onRetry ? <Button onPress={onRetry}>Tentar novamente</Button> : null}
    </View>
  );
}

export function EmptyBox({ icon = '🌱', message = 'Nada por aqui ainda.' }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 44, alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 36 }}>{icon}</Text>
      <Text style={{ color: colors.sub, fontSize: 14, textAlign: 'center', maxWidth: 260 }}>{message}</Text>
    </View>
  );
}
