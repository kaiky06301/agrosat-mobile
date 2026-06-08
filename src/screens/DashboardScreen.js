// ============================================================
// AgroSat — 2 · Dashboard (dados via serviço/API + seletor de fazenda)
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { Screen } from '../components/Screen';
import { Card, SevChip, Bar } from '../components/ui';
import { Loading, ErrorBox } from '../components/AsyncBox';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import useAsync from '../hooks/useAsync';
import { primeiraLetra } from '../data/agro';
import { getResumoPropriedade } from '../services/dataService';

function saudacaoKey() {
  const h = new Date().getHours();
  if (h < 12) return 'saudacao.manha';
  if (h < 18) return 'saudacao.tarde';
  return 'saudacao.noite';
}

function Kpi({ value, label, alert }) {
  const { colors, line } = useTheme();
  const s = makeStyles(colors, line);
  return (
    <View style={s.kpi}>
      <Text style={[s.kpiVal, { color: alert ? colors.high : colors.ink }]}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}

function Shortcut({ icon, label, onPress, badge }) {
  const { colors, line } = useTheme();
  const s = makeStyles(colors, line);
  return (
    <Pressable onPress={onPress} style={s.shortcut}>
      <View style={s.shortcutIcon}><Icon name={icon} size={20} color={colors.primary} /></View>
      <Text style={s.shortcutLabel}>{label}</Text>
      {badge ? <View style={s.shortcutBadge}><Text style={s.shortcutBadgeTxt}>{badge}</Text></View> : null}
    </Pressable>
  );
}

function AlertMini({ a, onPress }) {
  const { colors, sev } = useTheme();
  const { t } = useSettings();
  const ss = makeStyles(colors);
  const s = sev[a.sev];
  return (
    <Pressable onPress={onPress} style={[ss.alertMini, { backgroundColor: s.bg, borderColor: alpha(s.c, 0.28) }]}>
      <View style={[ss.alertIcon, { backgroundColor: alpha(s.c, 0.16) }]}><Icon name="alert" size={20} color={s.c} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={ss.alertTipo}>{t('tipos.' + a.tipo)}</Text>
          <SevChip sev={a.sev} />
        </View>
        <Text style={ss.alertSub}>{a.talhao} · {a.rec}</Text>
      </View>
      <Icon name="chevR" size={18} color={colors.sub} />
    </Pressable>
  );
}

export default function DashboardScreen({ nav, user }) {
  const { colors, line, moist } = useTheme();
  const { t } = useSettings();
  const s = makeStyles(colors, line);
  const { propAtiva, propriedades, setPropAtiva, dataVersion } = useAppData();
  const [trocando, setTrocando] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => (propAtiva ? getResumoPropriedade(propAtiva.id) : Promise.resolve({ talhoes: [], alertas: [] })),
    [propAtiva?.id, dataVersion]
  );

  const talhoes = data?.talhoes || [];
  const alertas = data?.alertas || [];
  const alertasAtivos = alertas.filter((a) => a.ativo);
  const areaTotal = talhoes.reduce((acc, x) => acc + (Number(x.ha) || 0), 0);
  const primeiroNome = (user?.nome || 'Produtor').split(' ')[0];
  const destaque = alertasAtivos[0] || alertas[0];
  const temVarias = (propriedades || []).length > 1;

  return (
    <Screen tab orbit>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: colors.sub, fontSize: 14 }}>{t(saudacaoKey())}</Text>
          <Text style={s.hello}>{t('dashboard.ola', { nome: primeiroNome })}</Text>
        </View>
        <Pressable onPress={() => nav('perfil')} style={s.avatar}>
          <Text style={{ fontFamily: fonts.display, color: colors.primary, fontSize: 17 }}>{primeiraLetra(user?.nome)}</Text>
        </Pressable>
      </View>

      <Card glow style={{ marginTop: 20, padding: 20 }}>
        <Pressable
          onPress={() => temVarias && setTrocando((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="pin" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: fonts.mono, letterSpacing: 0.5 }}>{t('dashboard.propriedade')}</Text>
          </View>
          {temVarias && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="swap" size={14} color={colors.sub} />
              <Text style={{ color: colors.sub, fontSize: 12, fontFamily: fonts.displayMed }}>{t('dashboard.trocar')}</Text>
            </View>
          )}
        </Pressable>

        <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 20, marginTop: 8 }}>{propAtiva?.nome || '—'}</Text>
        <Text style={{ color: colors.sub, fontSize: 13.5, marginTop: 2 }}>{propAtiva ? `${propAtiva.local} · ${propAtiva.ha} ha` : t('dashboard.semFazenda')}</Text>

        {trocando && temVarias && (
          <View style={{ marginTop: 12, gap: 8 }}>
            {propriedades.map((p) => {
              const on = p.id === propAtiva?.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => { setPropAtiva(p.id); setTrocando(false); }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: on ? colors.primary : line, backgroundColor: on ? alpha(colors.primary, 0.1) : 'transparent' }}
                >
                  <View>
                    <Text style={{ fontFamily: fonts.displaySemi, color: on ? colors.primary : colors.ink, fontSize: 14 }}>{p.nome}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 1 }}>{p.local} · {p.ha} ha</Text>
                  </View>
                  {on ? <Icon name="check" size={16} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <Kpi value={String(talhoes.length)} label={t('dashboard.kTalhoes')} />
          <Kpi value={String(areaTotal)} label={t('dashboard.kArea')} />
          <Kpi value={String(alertasAtivos.length)} label={t('dashboard.kAlertas')} alert={alertasAtivos.length > 0} />
        </View>
      </Card>

      {loading ? (
        <Loading label={t('dashboard.carregando')} />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <>
          {destaque && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <Text style={s.section}>{t('dashboard.atencao')}</Text>
                <Pressable onPress={() => nav('alertas')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontFamily: fonts.displayMed }}>{t('common.verTodos')}</Text>
                  <Icon name="chevR" size={14} color={colors.primary} />
                </Pressable>
              </View>
              <View style={{ marginTop: 12 }}><AlertMini a={destaque} onPress={() => nav('detalhe', destaque.talId)} /></View>
            </>
          )}

          <Text style={[s.section, { marginTop: 24, marginBottom: 12 }]}>{t('dashboard.atalhos')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Shortcut icon="layers" label={t('dashboard.meusTalhoes')} onPress={() => nav('talhoes')} />
            <Shortcut icon="bell" label={t('dashboard.alertas')} badge={alertasAtivos.length ? String(alertasAtivos.length) : null} onPress={() => nav('alertas')} />
            <Shortcut icon="plus" label={t('dashboard.registrar')} onPress={() => nav('registrar')} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
            <Text style={s.section}>{t('dashboard.seusTalhoes')}</Text>
            <Pressable onPress={() => nav('talhoes')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontFamily: fonts.displayMed }}>{t('common.verTodos')}</Text>
              <Icon name="chevR" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {talhoes.map((x) => {
              const m = moist(x.umidade, x.idealLo, x.idealHi);
              return (
                <Card key={x.id} onPress={() => nav('detalhe', x.id)} style={s.miniTalhao}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={s.miniIcon}><Icon name="leaf" size={18} color={colors.low} /></View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={s.miniNome}>{x.nome}</Text>
                        <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: m.c }}>{x.umidade}% · {t('moist.' + m.key)}</Text>
                      </View>
                      <Text style={s.miniSub}>{x.ha} ha · {x.cultura}</Text>
                      <View style={{ marginTop: 8 }}><Bar value={x.umidade} color={m.c} ideal={[x.idealLo, x.idealHi]} height={6} /></View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const makeStyles = (colors, line) => StyleSheet.create({
  hello: { fontFamily: fonts.display, color: colors.ink, fontSize: 28, marginTop: -2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: line || 'transparent', alignItems: 'center', justifyContent: 'center' },
  kpi: { flex: 1, borderRadius: 16, backgroundColor: alpha(colors.bg, 0.6), borderWidth: 1, borderColor: line || 'transparent', paddingVertical: 12, alignItems: 'center' },
  kpiVal: { fontFamily: fonts.monoSemi, fontSize: 24 },
  kpiLabel: { fontSize: 10.5, color: colors.muted, marginTop: 6 },
  section: { fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 16 },
  alertMini: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1 },
  alertIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alertTipo: { fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 14 },
  alertSub: { color: colors.sub, fontSize: 12.5, marginTop: 2 },
  shortcut: { flex: 1, height: 104, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: line || 'transparent', padding: 14, justifyContent: 'space-between' },
  shortcutIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: alpha(colors.primary, 0.12), alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 12.5, fontFamily: fonts.displayMed, color: colors.ink },
  shortcutBadge: { position: 'absolute', top: 12, right: 12, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: colors.high, alignItems: 'center', justifyContent: 'center' },
  shortcutBadgeTxt: { color: '#1a0408', fontSize: 10, fontFamily: fonts.monoSemi },
  miniTalhao: { padding: 14 },
  miniIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: alpha(colors.low, 0.13), alignItems: 'center', justifyContent: 'center' },
  miniNome: { fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 15 },
  miniSub: { color: colors.sub, fontSize: 12, marginTop: 1 },
});
