// ============================================================
// AgroSat — Formulário de Fazenda (CREATE / UPDATE / DELETE)
// CRUD de propriedade via camada de serviço (Axios/mock).
// ============================================================
import React, { useState, useEffect } from 'react';
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
import MapaSelecao from '../components/MapaSelecao';

export default function FazendaFormScreen({ nav, param }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { user, propriedades, recarregarPropriedades, setPropAtiva, bump } = useAppData();
  const editId = typeof param === 'string' ? param : null;
  const podeExcluir = (propriedades || []).length > 1;

  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [ha, setHa] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmar, setConfirmar] = useState(false);
  // Localização geocodada (cidade/uf/coordenadas) que alimenta o satélite.
  const [busca, setBusca] = useState('');
  const [geo, setGeo] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erroGeo, setErroGeo] = useState(null);

  async function buscarLocal() {
    const q = busca.trim();
    if (!q) return;
    setErroGeo(null);
    setBuscando(true);
    try {
      const g = await geocode(q);
      if (g?.lat == null) {
        setErroGeo('Local não encontrado. Tente "Cidade, UF".');
        setGeo(null);
      } else {
        setGeo(g);
        setLocal(g.uf ? `${g.cidade}/${g.uf}` : g.cidade);
      }
    } catch (e) {
      setErroGeo('Não foi possível buscar o local agora.');
      setGeo(null);
    }
    setBuscando(false);
  }

  // Usuário clicou/arrastou o pin no mapa: guarda o ponto exato e identifica cidade/estado.
  async function onPontoMapa(la, lo) {
    setGeo((g) => ({ ...(g || {}), lat: la, lon: lo }));
    setErroGeo(null);
    try {
      const g = await geocodeReverso(la, lo);
      setGeo({ cidade: g.cidade, estado: g.estado, uf: g.uf, lat: la, lon: lo });
      setLocal(g.uf ? `${g.cidade}/${g.uf}` : g.cidade || '');
    } catch (e) {
      const msg = e?.response?.data?.error || 'Ponto sem localidade reconhecida. Marque sobre terra, no Brasil.';
      setErroGeo(msg);
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
            setHa(String(p.ha ?? ''));
          }
          if (on) setLoading(false);
        })
        .catch(() => on && setLoading(false));
    }
    return () => {
      on = false;
    };
  }, [editId, user?.id]);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) return setErro(t('fazendaForm.errNome'));
    if (!editId && geo?.lat == null) return setErro('Marque a localização da fazenda no mapa (busque a cidade e toque no ponto).');
    setSaving(true);
    try {
      const dados = {
        nome: nome.trim(),
        local: local.trim() || '—',
        ha: Number(ha) || 0,
        uf: geo?.uf,
        lat: geo?.lat,
        lon: geo?.lon,
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

        {/* Localização: usuário digita a cidade/região e o sistema resolve estado, cidade e coordenadas (satélite). */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.sub, fontSize: 12.5, marginLeft: 4, fontFamily: fonts.displayMed }}>Localização (cidade/região)</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Field icon="satellite" value={busca} onChange={setBusca} placeholder="Ex.: Sorriso, MT" onSubmitEditing={buscarLocal} />
            </View>
            <Pressable
              onPress={buscarLocal}
              style={{ height: 52, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}
            >
              <Text style={{ color: '#04140a', fontFamily: fonts.displaySemi, fontSize: 14 }}>{buscando ? '…' : 'Buscar'}</Text>
            </Pressable>
          </View>
          {erroGeo ? <Text style={{ color: colors.high, fontSize: 12.5, marginLeft: 4 }}>{erroGeo}</Text> : null}
          {geo && geo.cidade ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <Icon name="pin" size={15} color={colors.primary} />
              <Text style={{ color: colors.ink, fontSize: 13.5, fontFamily: fonts.displayMed }}>
                {geo.cidade}{geo.uf ? `, ${geo.uf}` : ''}{geo.estado ? ` · ${geo.estado}` : ''}
              </Text>
            </View>
          ) : null}
          <Text style={{ color: colors.muted, fontSize: 11.5, marginLeft: 4 }}>
            Toque no mapa (ou arraste o pino) para marcar o ponto exato da fazenda.
          </Text>
          <MapaSelecao lat={geo?.lat} lon={geo?.lon} onChange={onPontoMapa} height={260} />
          {geo?.lat != null ? (
            <Text style={{ color: colors.muted, fontSize: 10.5, marginLeft: 4, fontFamily: fonts.mono }}>
              {Number(geo.lat).toFixed(5)}, {Number(geo.lon).toFixed(5)}
            </Text>
          ) : null}
        </View>

        <Field icon="layers" label={t('fazendaForm.area')} value={ha} onChange={setHa} keyboardType="numeric" placeholder={t('fazendaForm.areaPh')} />

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
