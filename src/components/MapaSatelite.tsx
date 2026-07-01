import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/colors';

// Fallback NATIVO (mobile): sem WebView instalado, mostra as coordenadas do ponto
// que alimenta o satélite. Na web, o arquivo MapaSatelite.web.tsx (iframe) tem prioridade.
export default function MapaSatelite({ lat, lon }) {
  const { colors, line } = useTheme();
  if (lat == null || lon == null) return null;
  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: line,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 16 }}>📍</Text>
      <Text style={{ color: colors.sub, fontSize: 12, fontFamily: fonts.mono }}>
        {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
      </Text>
    </View>
  );
}
