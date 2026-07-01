import React from 'react';

// Versão WEB: embeda a vista de satélite do Google Maps no ponto da propriedade.
// Usa React.createElement('iframe') porque na web o react-native-web renderiza via react-dom.
export default function MapaSatelite({ lat, lon, height = 190 }) {
  if (lat == null || lon == null) return null;
  const src = `https://maps.google.com/maps?q=${lat},${lon}&t=k&z=13&hl=pt-BR&output=embed`;
  return React.createElement('iframe', {
    src,
    width: '100%',
    height,
    loading: 'lazy',
    title: 'Localização da propriedade (satélite)',
    referrerPolicy: 'no-referrer-when-downgrade',
    style: { border: 0, borderRadius: 12, marginTop: 14, display: 'block' },
  });
}
