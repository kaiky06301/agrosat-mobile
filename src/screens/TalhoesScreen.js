// ============================================================
// AgroSat — 3 · Lista de Talhões (dados via serviço/API)
// ============================================================
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from '../components/Icon';
import { Screen, Header } from '../components/Screen';
import { Card, SevChip, Bar } from '../components/ui';
import { Loading, ErrorBox, EmptyBox } from '../components/AsyncBox';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import useAsync from '../hooks/useAsync';
import { getTalhoes } from '../services/dataService';

function TalhaoCard({ t, onPress }) {
  const { colors, moist } = useTheme();
  const { t: tr } = useSettings();
  const m = moist(t.umidade, t.idealLo, t.idealHi);
  return (
    <Card onPress={onPress} style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: alpha(colors.low, 0.13), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="leaf" size={20} color={colors.low} />
          </View>
          <View>
            <Text style={{ fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 16 }}>{t.nome}</Text>
            <Text style={{ color: colors.sub, fontSize: 12.5, marginTop: 2 }}>{t.ha} ha · {t.cultura}</Text>
          </View>
        </View>
        {t.alerta === 'ALTA' ? <SevChip sev="ALTA" /> : <Icon name="chevR" size={18} color={colors.muted} />}
      </View>
      <View style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>{tr('talhoes.umidadeSolo')}</Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: m.c }}>{t.umidade}% · {tr('moist.' + m.key)}</Text>
        </View>
        <Bar value={t.umidade} color={m.c} ideal={[t.idealLo, t.idealHi]} />
      </View>
    </Card>
  );
}

export default function TalhoesScreen({ nav }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { propAtiva, dataVersion } = useAppData();
  const { data, loading, error, reload } = useAsync(
    () => (propAtiva ? getTalhoes(propAtiva.id) : Promise.resolve([])),
    [propAtiva?.id, dataVersion]
  );
  const talhoes = data || [];
  const area = talhoes.reduce((s, x) => s + (Number(x.ha) || 0), 0);

  return (
    <Screen tab>
      <Header
        title={t('talhoes.titulo')}
        sub={propAtiva ? t('talhoes.resumo', { nome: propAtiva.nome, n: talhoes.length, area }) : t('talhoes.selecione')}
      />

      <Pressable
        onPress={() => nav('talhao-form', null)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, height: 50, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: alpha(colors.primary, 0.5), backgroundColor: alpha(colors.primary, 0.07) }}
      >
        <Icon name="plus" size={18} color={colors.primary} />
        <Text style={{ fontFamily: fonts.displaySemi, color: colors.primary, fontSize: 14.5 }}>{t('talhoes.novo')}</Text>
      </Pressable>

      {loading ? (
        <Loading label={t('talhoes.carregando')} />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : talhoes.length === 0 ? (
        <EmptyBox message={t('talhoes.vazio')} />
      ) : (
        <View style={{ gap: 14, marginTop: 16 }}>
          {talhoes.map((x) => (
            <TalhaoCard key={x.id} t={x} onPress={() => nav('detalhe', x.id)} />
          ))}
        </View>
      )}
    </Screen>
  );
}
