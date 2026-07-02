import React, { useRef, useEffect, useState } from 'react';

// Carrega Leaflet (CDN) uma vez.
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

// Area geodesica de um poligono [[lon,lat],...] em m² (aproximacao esferica).
export function areaHectares(coords) {
  if (!coords || coords.length < 3) return 0;
  const R = 6378137;
  const rad = (d) => (d * Math.PI) / 180;
  let s = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[(i + 1) % coords.length];
    s += rad(lon2 - lon1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  const m2 = Math.abs((s * R * R) / 2);
  return m2 / 10000; // hectares
}

// Centro (centroide simples) do poligono -> [lat, lon]
export function centro(coords) {
  if (!coords || !coords.length) return null;
  let la = 0, lo = 0;
  coords.forEach(([lon, lat]) => { la += lat; lo += lon; });
  return [la / coords.length, lo / coords.length];
}

/**
 * Mapa em SATÉLITE onde o usuário DESENHA o contorno (clica nos cantos).
 * onChange({ coords, areaHa, centro }) dispara a cada mudança. `center` centraliza (busca).
 * `coordsIniciais` (GeoJSON ring [[lon,lat],...]) reidrata um contorno já salvo.
 */
export default function MapaDesenho({ center, coordsIniciais, onChange, height = 300 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const polyRef = useRef(null);
  const markersRef = useRef([]);
  const ptsRef = useRef(coordsIniciais && coordsIniciais.length ? [...coordsIniciais] : []);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [qtd, setQtd] = useState(ptsRef.current.length);
  const [areaHa, setAreaHa] = useState(areaHectares(ptsRef.current));

  function redesenhar() {
    const L = window.L, map = mapRef.current;
    if (!L || !map) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polyRef.current) { map.removeLayer(polyRef.current); polyRef.current = null; }
    const pts = ptsRef.current;
    const latlngs = pts.map(([lon, lat]) => [lat, lon]);
    if (latlngs.length >= 2) {
      polyRef.current = (latlngs.length >= 3 ? L.polygon(latlngs, { color: '#7CC242', weight: 2, fillOpacity: 0.15 }) : L.polyline(latlngs, { color: '#7CC242', weight: 2 })).addTo(map);
    }
    latlngs.forEach((ll, i) => {
      const mk = L.circleMarker(ll, { radius: 6, color: '#fff', weight: 2, fillColor: '#7CC242', fillOpacity: 1 }).addTo(map);
      markersRef.current.push(mk);
    });
    const a = areaHectares(pts);
    setQtd(pts.length);
    setAreaHa(a);
    onChangeRef.current && onChangeRef.current({
      coords: pts.length >= 3 ? pts : null,
      areaHa: a,
      centro: pts.length >= 3 ? centro(pts) : null,
    });
  }

  useEffect(() => {
    let vivo = true;
    garantirLeaflet().then(() => {
      if (!vivo || !elRef.current || mapRef.current) return;
      const L = window.L;
      const ini = coordsIniciais && coordsIniciais.length ? centro(coordsIniciais)
        : (center || [-14.5, -52.0]);
      const map = L.map(elRef.current).setView(ini, coordsIniciais?.length || center ? 14 : 4);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri', maxZoom: 18 }).addTo(map);
      map.on('click', (e) => {
        ptsRef.current.push([e.latlng.lng, e.latlng.lat]);
        redesenhar();
      });
      mapRef.current = map;
      setTimeout(() => { map.invalidateSize(); redesenhar(); }, 200);
    });
    return () => { vivo = false; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Recentraliza quando busca por cidade muda o center
  useEffect(() => {
    if (mapRef.current && center) mapRef.current.setView(center, Math.max(mapRef.current.getZoom(), 13));
  }, [center && center[0], center && center[1]]);

  function desfazer() { ptsRef.current.pop(); redesenhar(); }
  function limpar() { ptsRef.current = []; redesenhar(); }

  return React.createElement('div', {}, [
    React.createElement('div', { key: 'map', ref: elRef, style: { width: '100%', height, borderRadius: 12, overflow: 'hidden', marginTop: 8, zIndex: 0 } }),
    React.createElement('div', { key: 'ctrl', style: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' } }, [
      React.createElement('span', { key: 'a', style: { color: '#9fb3a0', fontSize: 12, fontFamily: 'monospace' } },
        qtd < 3 ? `Toque nos cantos da fazenda (${qtd}/3+ pontos)` : `Área: ${areaHa.toFixed(1)} ha · ${qtd} pontos`),
      React.createElement('button', { key: 'u', onClick: desfazer, style: btnStyle }, 'Desfazer'),
      React.createElement('button', { key: 'c', onClick: limpar, style: btnStyle }, 'Limpar'),
    ]),
  ]);
}

const btnStyle = { padding: '4px 10px', borderRadius: 8, border: '1px solid #3a3a3a', background: 'transparent', color: '#cfcfcf', fontSize: 12, cursor: 'pointer' };
