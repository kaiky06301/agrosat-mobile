import React, { useRef, useEffect } from 'react';

// Carrega Leaflet (CDN) uma vez. Sem chave, gratuito.
let carregando = null;
function garantirLeaflet() {
  if (typeof window !== 'undefined' && window.L) return Promise.resolve();
  if (carregando) return carregando;
  carregando = new Promise((resolve, reject) => {
    try {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    } catch (e) { reject(e); }
  });
  return carregando;
}

// Mapa interativo em vista de SATÉLITE (Esri World Imagery) para o usuário marcar
// o ponto EXATO da fazenda: clica no mapa ou arrasta o pin. onChange(lat, lon)
// dispara a cada ajuste. lat/lon externos (ex.: busca por cidade) recentralizam.
export default function MapaSelecao({ lat, lon, onChange, height = 280 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let vivo = true;
    garantirLeaflet().then(() => {
      if (!vivo || !elRef.current || mapRef.current) return;
      const L = window.L;
      const inicio = [lat ?? -14.5, lon ?? -52.0];
      const zoom = lat != null ? 14 : 4;
      const map = L.map(elRef.current).setView(inicio, zoom);
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri', maxZoom: 18 }
      ).addTo(map);
      const marker = L.marker(inicio, { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        onChangeRef.current && onChangeRef.current(p.lat, p.lng);
      });
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current && onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = map;
      markerRef.current = marker;
      setTimeout(() => map.invalidateSize(), 200);
    });
    return () => {
      vivo = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  }, []);

  // Recentraliza quando lat/lon mudam por fora (busca por cidade), sem criar loop.
  useEffect(() => {
    const map = mapRef.current, marker = markerRef.current;
    if (!map || !marker || lat == null || lon == null) return;
    const atual = marker.getLatLng();
    if (Math.abs(atual.lat - lat) > 1e-6 || Math.abs(atual.lng - lon) > 1e-6) {
      marker.setLatLng([lat, lon]);
      map.setView([lat, lon], Math.max(map.getZoom(), 13));
    }
  }, [lat, lon]);

  return React.createElement('div', {
    ref: elRef,
    style: { width: '100%', height, borderRadius: 12, overflow: 'hidden', marginTop: 8, zIndex: 0 },
  });
}
