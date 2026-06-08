// ============================================================
// AgroSat — 6 · Registrar Leitura (CREATE via serviço/API)
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import RNSlider from '@react-native-community/slider';
import Icon from '../components/Icon';
import { Screen, Header } from '../components/Screen';
import { Button } from '../components/ui';
import { Loading, ErrorBox, EmptyBox } from '../components/AsyncBox';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import useAsync from '../hooks/useAsync';
import { getTalhoes, registrarLeitura } from '../services/dataService';

function Slider({ icon, tone, label, value, set, min, max, step = 1, unit, valueText }) {
  const { colors } = useTheme();
  const line = useTheme().line;
  return (
    <View style={{ borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: line, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(tone, 0.14) }}><Icon name={icon} size={17} color={tone} /></View>
          <Text style={{ fontSize: 13.5, color: colors.sub }}>{label}</Text>
        </View>
        <Text style={{ fontFamily: fonts.mono, color: colors.ink, fontSize: 17 }}>
          {valueText != null ? valueText : <>{value}<Text style={{ color: colors.sub, fontSize: 13 }}>{unit}</Text></>}
        </Text>
      </View>
      <RNSlider
        minimumValue={min} maximumValue={max} step={step} value={value}
        onValueChange={(v) => set(Math.round(v * 10) / 10)}
        minimumTrackTintColor={tone} maximumTrackTintColor={alpha(colors.hair, 0.12)} thumbTintColor={tone}
      />
    </View>
  );
}

export default function NovaLeituraScreen({ nav, param }) {
  const { colors, line, sev } = useTheme();
  const { t, temp: fmtTemp } = useSettings();
  const { propAtiva, dataVersion, bump } = useAppData();
  const { data, loading, error, reload } = useAsync(
    () => (propAtiva ? getTalhoes(propAtiva.id) : Promise.resolve([])),
    [propAtiva?.id, dataVersion]
  );
  const talhoes = data || [];

  const [tal, setTal] = useState(typeof param === 'string' ? param : null);
  const [solo, setSolo] = useState(38);
  const [tmp, setTmp] = useState(27.4);
  const [ar, setAr] = useState(55);
  const [lux, setLux] = useState(820);
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);

  const selecionado = tal || talhoes[0]?.id;

  async function salvar() {
    if (!selecionado) return;
    setSaving(true);
    try {
      const r = await registrarLeitura(selecionado, { solo, temp: tmp, ar, lux });
      bump();
      setResultado(r || {});
      setTimeout(() => nav('detalhe', selecionado), 1400);
    } catch (e) {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen tab>
        <Header title={t('leitura.titulo')} sub={t('leitura.sub')} />
        <Loading label={t('leitura.carregando')} />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen tab>
        <Header title={t('leitura.titulo')} sub={t('leitura.sub')} />
        <ErrorBox message={error} onRetry={reload} />
      </Screen>
    );
  }
  if (talhoes.length === 0) {
    return (
      <Screen tab>
        <Header title={t('leitura.titulo')} sub={t('leitura.sub')} />
        <EmptyBox message={t('leitura.semTalhao')} />
      </Screen>
    );
  }

  if (resultado) {
    const ag = resultado.alertaGerado;
    const sv = ag ? sev[ag.sev] : null;
    return (
      <Screen tab>
        <Header title={t('leitura.registrada')} />
        <View style={{ alignItems: 'center', marginTop: 40, gap: 14 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: alpha(colors.primary, 0.14), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={38} color={colors.primary} />
          </View>
          <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 20 }}>{t('leitura.salva')}</Text>
          {ag ? (
            <View style={{ width: '100%', marginTop: 6, borderRadius: 16, padding: 16, backgroundColor: sv.bg, borderWidth: 1, borderColor: alpha(sv.c, 0.3) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="alert" size={20} color={sv.c} />
                <Text style={{ fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 14.5 }}>{t('leitura.alertaGerado', { tipo: t('tipos.' + ag.tipo) })}</Text>
              </View>
              <Text style={{ color: colors.sub, fontSize: 13, marginTop: 8 }}>{t('leitura.foraIdeal', { rec: ag.rec })}</Text>
            </View>
          ) : (
            <Text style={{ color: colors.sub, fontSize: 14, textAlign: 'center', maxWidth: 260 }}>{t('leitura.dentroIdeal')}</Text>
          )}
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>{t('leitura.abrindo')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen tab>
      <Header title={t('leitura.titulo')} sub={t('leitura.sub')} />
      <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 4, marginTop: 20, fontFamily: fonts.displayMed }}>{t('leitura.talhao')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {talhoes.map((x) => {
          const on = selecionado === x.id;
          return (
            <Pressable key={x.id} onPress={() => setTal(x.id)}
              style={[{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, width: '48%' },
                on ? { borderColor: colors.primary, backgroundColor: alpha(colors.primary, 0.1) } : { borderColor: line, backgroundColor: alpha(colors.hair, 0.04) }]}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13.5, color: on ? colors.primary : colors.ink }}>{x.nome.replace('Talhão ', '')}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{x.cultura}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 14, marginTop: 20 }}>
        <Slider icon="droplet" tone={colors.crop} label={t('leitura.umidadeSolo')} value={solo} set={setSolo} min={0} max={100} unit="%" />
        <Slider icon="thermometer" tone={colors.high} label={t('leitura.temperatura')} value={tmp} set={setTmp} min={0} max={50} step={0.1} valueText={fmtTemp(tmp)} />
        <Slider icon="wind" tone={colors.low} label={t('leitura.umidadeAr')} value={ar} set={setAr} min={0} max={100} unit="%" />
        <Slider icon="sun" tone={colors.med} label={t('leitura.luz')} value={lux} set={setLux} min={0} max={2000} step={10} unit=" lx" />
      </View>

      <Button full icon={saving ? undefined : 'plus'} onPress={salvar} style={{ marginTop: 24 }}>
        {saving ? t('common.salvando') : t('leitura.salvar')}
      </Button>
    </Screen>
  );
}
