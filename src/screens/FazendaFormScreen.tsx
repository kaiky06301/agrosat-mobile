// ============================================================
// AgroSat — Formulário de Fazenda (CREATE / UPDATE / DELETE)
// Localização por DESENHO do contorno no mapa de satélite:
// o usuário busca a cidade (centraliza) e desenha o perímetro da
// fazenda; a área (ha), o centro (lat/lon) e a cidade/UF saem do desenho.
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen, Header } from '../components/Screen';
import { Button } from '../components/ui';
import { Loading } from '../components/AsyncBox';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import { getPropriedades, addPropriedade, updatePropriedade, deletePropriedade, geocode, geocodeReverso } from '../services/dataService';
import MapaDesenho from '../components/MapaDesenho';

export default function FazendaFormScreen({ nav, param }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { user, propriedades, recarregarPropriedades, setPropAtiva, bump } = useAppData();
  const editId = typeof param === 'string' ? param : null;
  const podeExcluir = (propriedades || []).length > 1;

  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmar, setConfirmar] = useState(false);

  const [busca, setBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [erroGeo, setErroGeo] = useState(null);
  const [center, setCenter] = useState(null); // [lat, lon] p/ centralizar o mapa
  const [contorno, setContorno] = useState(null); // [[lon,lat],...]
  const [areaHa, setAreaHa] = useState(0);
  const [local, setLocal] = useState(''); // "Cidade/UF" (do reverse)
  const [uf, setUf] = useState(null);
  const [centro, setCentro] = useState(null); // [lat, lon] do polígono
  const revTimer = useRef(null);

  // Busca a cidade só para o mapa "voar" até a região (não marca nada ainda).
  async function buscarLocal() {
    const q = busca.trim();
    if (!q) return;
    setErroGeo(null);
    setBuscando(true);
    try {
      const g = await geocode(q);
      if (g?.lat == null) setErroGeo('Local não encontrado. Tente "Cidade, UF".');
      else setCenter([g.lat, g.lon]);
    } catch (e) {
      setErroGeo('Não foi possível buscar o local agora.');
    }
    setBuscando(false);
  }

  // O usuário está desenhando o contorno: guarda coords/área/centro e (com atraso)
  // identifica a cidade/UF do centro do polígono.
  function onDesenho({ coords, areaHa: a, centro: c }) {
    setContorno(coords);
    setAreaHa(a || 0);
    setCentro(c);
    if (revTimer.current) clearTimeout(revTimer.current);
    if (c) {
      revTimer.current = setTimeout(async () => {
        try {
          const g = await geocodeReverso(c[0], c[1]);
          setLocal(g.uf ? `${g.cidade}/${g.uf}` : g.cidade || '');
          setUf(g.uf || null);
          setErroGeo(null);
        } catch (e) {
          setErroGeo(e?.response?.data?.error || 'Contorno fora de área reconhecida (marque no Brasil).');
        }
      }, 1200);
    }
  }

  useEffect(() => {
    let on = true;
    if (editId && user) {
      getPropriedades(user.id)
        .then((props) => {
          const p = (props || []).find((x) => x.id === editId);
          if (on && p) {
            setNome(p.nome || '');
            setLocal(p.local || '');
            setAreaHa(Number(p.ha) || 0);
            if (p.contorno) {
              try {
                const gj = typeof p.contorno === 'string' ? JSON.parse(p.contorno) : p.contorno;
                const ring = gj?.coordinates?.[0];
                if (ring?.length) { setContorno(ring); setCenter([ring[0][1], ring[0][0]]); }
              } catch (e) {}
            }
          }
          if (on) setLoading(false);
        })
        .catch(() => on && setLoading(false));
    }
    return () => { on = false; if (revTimer.current) clearTimeout(revTimer.current); };
  }, [editId, user?.id]);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) return setErro(t('fazendaForm.errNome'));
    if (!editId && (!contorno || contorno.length < 3)) {
      return setErro('Desenhe o contorno da fazenda no mapa (toque nos cantos, 3+ pontos).');
    }
    setSaving(true);
    try {
      // GeoJSON Polygon com o anel fechado (primeiro ponto repetido no fim).
      let geojson = null;
      if (contorno && contorno.length >= 3) {
        const ring = [...contorno, contorno[0]];
        geojson = JSON.stringify({ type: 'Polygon', coordinates: [ring] });
      }
      const dados = {
        nome: nome.trim(),
        local: local.trim() || '—',
        ha: Number(areaHa.toFixed ? areaHa.toFixed(2) : areaHa) || 0,
        uf: uf,
        lat: centro ? centro[0] : undefined,
        lon: centro ? centro[1] : undefined,
        contorno: geojson,
      };
      if (editId) {
        await updatePropriedade(editId, dados);
      } else {
        const nova = await addPropriedade(user.id, dados);
        if (nova?.id) setPropAtiva(nova.id);
      }
      await recarregarPropriedades();
      bump();
      nav('fazendas');
    } catch (e) {
      setErro(e?.message || 'Não foi possível salvar a fazenda.');
      setSaving(false);
    }
  }

  async function excluir() {
    setSaving(true);
    try {
      await deletePropriedade(editId);
      await recarregarPropriedades();
      bump();
      nav('fazendas');
    } catch (e) {
      setErro(e?.message || 'Não foi possível excluir.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen tab>
        <Header title={t('fazendaForm.editar')} onBack={() => nav('fazendas')} />
        <Loading label={t('fazendaForm.carregando')} />
      </Screen>
    );
  }

  return (
    <Screen tab>
      <Header title={editId ? t('fazendaForm.editar') : t('fazendaForm.nova')} onBack={() => nav('fazendas')} />
      <View style={{ gap: 14, marginTop: 18 }}>
        <Field icon="pin" label={t('fazendaForm.nome')} value={nome} onChange={setNome} placeholder={t('fazendaForm.nomePh')} />

        {/* 1) Busca a cidade só para centralizar o mapa. */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.sub, fontSize: 12.5, marginLeft: 4, fontFamily: fonts.displayMed }}>Localização da fazenda</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Field icon="satellite" value={busca} onChange={setBusca} placeholder="Busque a cidade (ex.: Sorriso, MT)" onSubmitEditing={buscarLocal} />
            </View>
            <Pressable onPress={buscarLocal} style={{ height: 52, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
              <Text style={{ color: '#04140a', fontFamily: fonts.displaySemi, fontSize: 14 }}>{buscando ? '…' : 'Buscar'}</Text>
            </Pressable>
          </View>

          <Text style={{ color: colors.muted, fontSize: 11.5, marginLeft: 4 }}>
            2) Toque nos cantos da fazenda no mapa para desenhar o contorno. A área é calculada sozinha.
          </Text>

          {/* 2) Desenho do contorno no satélite. */}
          <MapaDesenho center={center} coordsIniciais={contorno} onChange={onDesenho} height={300} />

          {erroGeo ? <Text style={{ color: colors.high, fontSize: 12.5, marginLeft: 4 }}>{erroGeo}</Text> : null}

          {local ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <Icon name="pin" size={15} color={colors.primary} />
              <Text style={{ color: colors.ink, fontSize: 13.5, fontFamily: fonts.displayMed }}>{local}</Text>
            </View>
          ) : null}
        </View>

        {/* Área calculada do desenho (não é digitada). */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 54, borderRadius: 16, borderWidth: 1, borderColor: colors.line || '#2a2a2a', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="layers" size={19} color={colors.muted} />
            <Text style={{ color: colors.sub, fontSize: 13 }}>Área total (calculada)</Text>
          </View>
          <Text style={{ color: colors.ink, fontSize: 15, fontFamily: fonts.displaySemi }}>{areaHa ? `${areaHa.toFixed(1)} ha` : '—'}</Text>
        </View>

        {erro ? <Text style={{ color: colors.high, fontSize: 13, marginLeft: 4 }}>{erro}</Text> : null}

        <Button full icon={saving ? undefined : 'check'} onPress={salvar} style={{ marginTop: 4 }}>
          {saving ? t('common.salvando') : editId ? t('common.salvar') : t('fazendaForm.criar')}
        </Button>

        {editId && podeExcluir ? (
          confirmar ? (
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ color: colors.sub, fontSize: 13, textAlign: 'center' }}>{t('fazendaForm.excluirConfirm')}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Button variant="ghost" full onPress={() => setConfirmar(false)}>{t('common.cancelar')}</Button></View>
                <View style={{ flex: 1 }}>
                  <Pressable onPress={excluir} style={{ height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.high }}>
                    <Text style={{ color: '#fff', fontFamily: fonts.displaySemi, fontSize: 15 }}>{t('common.excluir')}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setConfirmar(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, height: 46 }}>
              <Icon name="trash" size={17} color={colors.high} />
              <Text style={{ color: colors.high, fontFamily: fonts.displayMed, fontSize: 14 }}>{t('fazendaForm.excluirBtn')}</Text>
            </Pressable>
          )
        ) : null}
      </View>
    </Screen>
  );
}
