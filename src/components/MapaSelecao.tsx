import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/colors';

// Fallback NATIVO (mobile): sem mapa interativo instalado, mostra o ponto marcado.
// Na web, MapaSelecao.web.tsx (Leaflet interativo) tem prioridade.
export default function MapaSelecao({ lat, lon }) {
  const { colors, line } = useTheme();
  return (
    <View style={{ marginTop: 8, borderRadius: 12, borderWidth: 1, borderColor: line, padding: 14, alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 18 }}>🗺️</Text>
      <Text style={{ color: colors.sub, fontSize: 12.5, textAlign: 'center' }}>
        {lat != null && lon != null
          ? `Ponto: ${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`
          : 'Busque a cidade para definir a localização.'}
      </Text>
    </View>
  );
}
