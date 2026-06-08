// ============================================================
// AgroSat — 4 · Detalhe do Talhão (dados via serviço/API)
// READ (talhão + histórico + alerta) · UPDATE · resolver alerta.
// Temperatura exibida na unidade escolhida (°C/°F).
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from '../components/Icon';
import { Screen, Header } from '../components/Screen';
import { Card, SevChip, Gauge, Metric, Button } from '../components/ui';
import { Loading, ErrorBox } from '../components/AsyncBox';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import useAsync from '../hooks/useAsync';
import { getTalhao, getLeituras, getAlertas, marcarAlertaResolvido } from '../services/dataService';

function Block({ icon, tone, title, caption, children }) {
  const { colors } = useTheme();
  return (
    <Card style={{ marginTop: 16, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(tone, 0.14) }}>
          <Icon name={icon} size={17} color={tone} />
        </View>
        <Text style={{ flex: 1, fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 15 }}>{title}</Text>
        {caption ? <Text style={{ fontSize: 11, color: colors.muted, fontFamily: fonts.mono }}>{caption}</Text> : null}
      </View>
      {children}
    </Card>
  );
}

function fmtData(ts) {
  try {
    const d = new Date(ts);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${hh}:${mm}`;
  } catch (e) {
    return '—';
  }
}

export default function TalhaoDetalheScreen({ nav, param }) {
  const { colors, sev, moist, line } = useTheme();
  const { t, temp } = useSettings();
  const { dataVersion, bump } = useAppData();
  const [resolvendo, setResolvendo] = useState(false);

  const { data, loading, error, reload } = useAsync(async () => {
    const tl = await getTalhao(param);
    if (!tl) return { t: null };
    const [leituras, alertas] = await Promise.all([
      getLeituras(param),
      getAlertas(tl.idPropriedade),
    ]);
    const alerta = alertas.find((a) => a.talId === param && a.ativo) || null;
    return { t: tl, leituras: leituras || [], alerta };
  }, [param, dataVersion]);

  if (loading) {
    return (
      <Screen tab>
        <Header title="Talhão" onBack={() => nav('talhoes')} />
        <Loading label={t('detalhe.carregando')} />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen tab>
        <Header title="Talhão" onBack={() => nav('talhoes')} />
        <ErrorBox message={error} onRetry={reload} />
      </Screen>
    );
  }

  const tl = data?.t;
  if (!tl) {
    return (
      <Screen tab>
        <Header title="Talhão" onBack={() => nav('talhoes')} />
        <Text style={{ color: colors.sub, marginTop: 20 }}>{t('detalhe.naoEncontrado')}</Text>
      </Screen>
    );
  }

  const leituras = data.leituras;
  const alerta = data.alerta;
  const m = moist(tl.umidade, tl.idealLo, tl.idealHi);
  const sv = alerta ? sev[alerta.sev] : null;
  const ultima = leituras[0] || null;

  async function resolver() {
    if (!alerta) return;
    setResolvendo(true);
    try {
      await marcarAlertaResolvido(alerta.id);
      bump();
    } catch (e) {
      setResolvendo(false);
    }
  }

  return (
    <Screen tab>
      <Header title={tl.nome} sub={`${tl.ha} ha · ${t('detalhe.culturaLabel', { cultura: tl.cultura })}`} onBack={() => nav('talhoes')} />

      <Pressable
        onPress={() => nav('talhao-form', tl.id)}
        style={{ position: 'absolute', right: 20, top: 6, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 38, borderRadius: 11, borderWidth: 1, borderColor: line, backgroundColor: colors.card }}
      >
        <Icon name="edit" size={15} color={colors.primary} />
        <Text style={{ color: colors.primary, fontFamily: fonts.displayMed, fontSize: 13 }}>{t('detalhe.editar')}</Text>
      </Pressable>

      {alerta && (
        <View style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: alpha(sv.c, 0.25) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: sv.bg }}>
            <Icon name="alert" size={22} color={sv.c} />
            <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 15, flex: 1 }}>{t('tipos.' + alerta.tipo)}</Text>
            <SevChip sev={alerta.sev} />
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: alpha(colors.bg, 0.4), gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="droplet" size={16} color={colors.primary} />
                <Text style={{ color: colors.sub, fontSize: 13 }}>{t('detalhe.recomendacao')}</Text>
              </View>
              <Text style={{ fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 15 }}>{alerta.rec}</Text>
            </View>
            <Button full icon={resolvendo ? undefined : 'check'} onPress={resolver}>
              {resolvendo ? t('detalhe.resolvendo') : t('detalhe.resolver')}
            </Button>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <Card style={{ flex: 1, padding: 16, alignItems: 'center' }}>
          <Gauge value={tl.umidade} color={m.c} label={t('detalhe.soloShort')} ideal={[tl.idealLo, tl.idealHi]} />
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>{t('detalhe.ideal', { lo: tl.idealLo, hi: tl.idealHi })}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 16, alignItems: 'center' }}>
          <Gauge value={tl.ndvi} max={1} unit="" color={colors.low} label="NDVI" />
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>{t('detalhe.vigor')}</Text>
        </Card>
      </View>

      <Block icon="gauge" tone={colors.primary} title={t('detalhe.ultimaLeitura')} caption={ultima ? fmtData(ultima.ts) : t('detalhe.semLeituras')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
          <View style={{ width: '50%' }}><Metric icon="droplet" label={t('detalhe.umidadeSolo')} value={String(ultima ? ultima.solo : tl.umidade)} unit="%" color={colors.crop} /></View>
          <View style={{ width: '50%' }}><Metric icon="thermometer" label={t('detalhe.temperatura')} value={ultima ? temp(ultima.temp, false) : '—'} unit={ultima ? (temp(0).includes('F') ? '°F' : '°C') : ''} color={colors.high} /></View>
          <View style={{ width: '50%' }}><Metric icon="wind" label={t('detalhe.umidadeAr')} value={ultima ? String(ultima.ar) : '—'} unit="%" color={colors.low} /></View>
          <View style={{ width: '50%' }}><Metric icon="sun" label={t('detalhe.luz')} value={ultima ? String(ultima.lux) : '—'} unit=" lx" color={colors.med} /></View>
        </View>
        <Button variant="ghost" full icon="plus" onPress={() => nav('registrar', tl.id)} style={{ marginTop: 16 }}>{t('detalhe.registrarNova')}</Button>
      </Block>

      <Block icon="chart" tone={colors.crop} title={t('detalhe.historico')} caption={t('detalhe.registros', { n: leituras.length })}>
        {leituras.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>{t('detalhe.semHistorico')}</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {leituras.slice(0, 8).map((l) => {
              const lm = moist(l.solo, tl.idealLo, tl.idealHi);
              return (
                <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: line }}>
                  <Text style={{ color: colors.sub, fontSize: 12.5, fontFamily: fonts.mono }}>{fmtData(l.ts)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: lm.c, fontSize: 13, fontFamily: fonts.mono }}>{l.solo}%</Text>
                    <Text style={{ color: colors.muted, fontSize: 12, fontFamily: fonts.mono }}>{temp(l.temp)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Block>
    </Screen>
  );
}
