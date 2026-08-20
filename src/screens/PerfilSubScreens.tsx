// ============================================================
// AgroSat — sub-telas do Perfil (tema + i18n dinâmicos)
// ============================================================
import React, { useState } from 'react';
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import { Screen, Header } from '../components/Screen';
import { Card, Button } from '../components/ui';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { LOCALES } from '../i18n/translations';
import usePersistedState from '../hooks/usePersistedState';

function ToggleRow({ icon, label, desc, value, onValueChange }) {
  const { colors, line } = useTheme();
  const s = makeStyles(colors, line);
  return (
    <Card style={s.row}>
      <View style={s.rowIcon}><Icon name={icon} size={18} color={colors.primary} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {desc ? <Text style={s.rowDesc}>{desc}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: alpha(colors.hair, 0.12), true: colors.primary }}
        thumbColor={colors.white} ios_backgroundColor={alpha(colors.hair, 0.12)} />
    </Card>
  );
}

// Linha selecionável (idioma, unidade): toque expande as opções.
function SelectRow({ icon, label, current, options, onSelect }) {
  const { colors, line } = useTheme();
  const s = makeStyles(colors, line);
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen((v) => !v)} style={[s.row, { backgroundColor: 'transparent' }]}>
        <View style={s.rowIcon}><Icon name={icon} size={18} color={colors.primary} /></View>
        <Text style={[s.rowLabel, { flex: 1 }]}>{label}</Text>
        <Text style={s.rowValue}>{current}</Text>
        <Icon name={open ? 'chevL' : 'chevR'} size={16} color={colors.muted} style={{ marginLeft: 8, transform: [{ rotate: open ? '90deg' : '0deg' }] }} />
      </Pressable>
      {open && (
        <View style={{ borderTopWidth: 1, borderTopColor: line }}>
          {options.map((o) => {
            const on = o.code === current || o.short === current || o.label === current;
            return (
              <Pressable
                key={o.code}
                onPress={() => { onSelect(o.code); setOpen(false); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingHorizontal: 16, backgroundColor: on ? alpha(colors.primary, 0.08) : 'transparent' }}
              >
                {o.flag ? <Text style={{ fontSize: 17 }}>{o.flag}</Text> : null}
                <Text style={{ flex: 1, fontFamily: fonts.displayMed, color: on ? colors.primary : colors.ink, fontSize: 14.5 }}>{o.label}</Text>
                {on ? <Icon name="check" size={16} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );
}

export function EditarPerfilScreen({ nav, user, onUpdate }) {
  const { colors, line } = useTheme();
  const { t } = useSettings();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [show, setShow] = useState(false);
  const [erro, setErro] = useState(null);
  const [ok, setOk] = useState(false);

  function salvar() {
    setErro(null);
    const patch = { nome: nome.trim() || user.nome, email: email.trim() || user.email };
    const querTrocar = novaSenha || confirmar;
    if (querTrocar) {
      if (novaSenha.length < 4) return setErro(t('editarPerfil.errCurta'));
      if (novaSenha !== confirmar) return setErro(t('editarPerfil.errConfere'));
      patch.senha = novaSenha;
    }
    onUpdate(patch);
    setOk(true);
    setTimeout(() => nav('perfil'), 700);
  }

  return (
    <Screen tab>
      <Header title={t('editarPerfil.titulo')} onBack={() => nav('perfil')} />
      <View style={{ gap: 14, marginTop: 20 }}>
        <Field icon="leaf" label={t('editarPerfil.nome')} value={nome} onChange={setNome} />
        <Field icon="mail" label={t('editarPerfil.email')} value={email} onChange={setEmail} keyboardType="email-address" />

        <View style={{ height: 1, backgroundColor: line, marginTop: 6 }} />
        <Text style={{ color: colors.muted, fontSize: 12, fontFamily: fonts.displayMed, marginLeft: 4 }}>{t('editarPerfil.trocarSenha')}</Text>
        <Field icon="lock" label={t('editarPerfil.novaSenha')} value={novaSenha} onChange={setNovaSenha} secure={!show} placeholder="••••••"
          trailing={<Pressable onPress={() => setShow((s) => !s)}><Icon name="eye" size={19} color={colors.muted} /></Pressable>} />
        <Field icon="lock" label={t('editarPerfil.confirmarSenha')} value={confirmar} onChange={setConfirmar} secure={!show} placeholder="••••••"
          trailing={<Pressable onPress={() => setShow((s) => !s)}><Icon name="eye" size={19} color={colors.muted} /></Pressable>} />

        {erro ? <Text style={{ color: colors.high, fontSize: 13, marginLeft: 4 }}>{erro}</Text> : null}

        <Button full icon={ok ? 'check' : undefined} onPress={salvar} style={{ marginTop: 4 }}>{ok ? t('common.salvo') : t('common.salvar')}</Button>
      </View>
    </Screen>
  );
}

export function NotificacoesScreen({ nav }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const [seca, setSeca] = usePersistedState('@agrosat:notif:seca', true);
  const [geada, setGeada] = usePersistedState('@agrosat:notif:geada', true);
  const [umidade, setUmidade] = usePersistedState('@agrosat:notif:umidade', true);
  const [resumo, setResumo] = usePersistedState('@agrosat:notif:resumo', false);
  const [novidades, setNovidades] = usePersistedState('@agrosat:notif:novidades', false);
  return (
    <Screen tab>
      <Header title={t('notificacoes.titulo')} onBack={() => nav('perfil')} />
      <Text style={{ color: colors.sub, fontSize: 14, marginTop: 8 }}>{t('notificacoes.sub')}</Text>
      <View style={{ gap: 10, marginTop: 16 }}>
        <ToggleRow icon="alert" label={t('notificacoes.secaT')} desc={t('notificacoes.secaD')} value={seca} onValueChange={setSeca} />
        <ToggleRow icon="thermometer" label={t('notificacoes.geadaT')} desc={t('notificacoes.geadaD')} value={geada} onValueChange={setGeada} />
        <ToggleRow icon="droplet" label={t('notificacoes.umidadeT')} desc={t('notificacoes.umidadeD')} value={umidade} onValueChange={setUmidade} />
        <ToggleRow icon="calendar" label={t('notificacoes.resumoT')} desc={t('notificacoes.resumoD')} value={resumo} onValueChange={setResumo} />
        <ToggleRow icon="satellite" label={t('notificacoes.novidadesT')} desc={t('notificacoes.novidadesD')} value={novidades} onValueChange={setNovidades} />
      </View>
    </Screen>
  );
}

export function ConfiguracoesScreen({ nav }) {
  const { isDark, toggle } = useTheme();
  const { t, locale, setLocale, tempUnit, setTempUnit, unitSymbol } = useSettings();
  const [push, setPush] = usePersistedState('@agrosat:cfg:push', true);
  const [dados, setDados] = usePersistedState('@agrosat:cfg:dados', true);
  const localeShort = (LOCALES.find((l) => l.code === locale) || LOCALES[0]).short;
  const UNIDADES = [{ code: 'C', label: '°C (Celsius)' }, { code: 'F', label: '°F (Fahrenheit)' }];
  return (
    <Screen tab>
      <Header title={t('config.titulo')} onBack={() => nav('perfil')} />
      <View style={{ gap: 10, marginTop: 20 }}>
        <ToggleRow icon="bell" label={t('config.push')} value={push} onValueChange={setPush} />
        <ToggleRow icon="signal" label={t('config.dados')} desc={t('config.dadosD')} value={dados} onValueChange={setDados} />
        <ToggleRow icon="moon" label={t('config.modoEscuro')} desc={t('config.modoEscuroD')} value={isDark} onValueChange={toggle} />
        <SelectRow
          icon="thermometer"
          label={t('config.unidade')}
          current={unitSymbol}
          options={UNIDADES}
          onSelect={setTempUnit}
        />
        <SelectRow
          icon="satellite"
          label={t('config.idioma')}
          current={localeShort}
          options={LOCALES}
          onSelect={setLocale}
        />
      </View>
    </Screen>
  );
}

export function SobreScreen({ nav }) {
  const { colors, line } = useTheme();
  const { t } = useSettings();
  const s = makeStyles(colors, line);
  return (
    <Screen tab>
      <Header title={t('sobre.titulo')} onBack={() => nav('perfil')} />
      <Card style={{ padding: 22, alignItems: 'center', marginTop: 16 }}>
        <Text style={{ fontSize: 40 }}>🛰️</Text>
        <Text style={s.brand}>Agro<Text style={{ color: colors.primary }}>Sat</Text></Text>
        <Text style={s.versao}>{t('sobre.versao')}</Text>
      </Card>
      <Card style={{ padding: 18, marginTop: 14 }}>
        <Text style={s.p}>{t('sobre.p')}</Text>
        <View style={s.divider} />
        <Text style={s.cap}>{t('sobre.ods')}</Text>
        <View style={{ gap: 8, marginTop: 8 }}>
          {['ods2', 'ods8', 'ods9', 'ods13'].map((k) => (
            <View key={k} style={s.ods}><Text style={s.odsTxt}>{t('sobre.' + k)}</Text></View>
          ))}
        </View>
      </Card>
      <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 16 }}>{t('sobre.footer')}</Text>
    </Screen>
  );
}

const makeStyles = (colors, line) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  rowIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: alpha(colors.primary, 0.12), alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.displayMed, color: colors.ink, fontSize: 14.5 },
  rowDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  rowValue: { fontFamily: fonts.mono, color: colors.sub, fontSize: 14 },
  brand: { fontFamily: fonts.display, color: colors.ink, fontSize: 30, marginTop: 8 },
  versao: { color: colors.muted, fontSize: 12, fontFamily: fonts.mono, marginTop: 2 },
  p: { color: colors.sub, fontSize: 14.5, lineHeight: 22 },
  divider: { height: 1, backgroundColor: line, marginVertical: 14 },
  cap: { color: colors.muted, fontSize: 10, fontFamily: fonts.mono, letterSpacing: 1 },
  ods: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: alpha(colors.primary, 0.1), paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  odsTxt: { color: colors.primary, fontSize: 12.5, fontFamily: fonts.displayMed },
});
