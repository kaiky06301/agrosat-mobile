// ============================================================
// AgroSat — 1 · Login (tema dinâmico)
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import Field from '../components/Field';
import { Button, SpaceBg } from '../components/ui';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { login } from '../services/auth';

export default function LoginScreen({ nav, onAuth }) {
  const { colors, line } = useTheme();
  const { t } = useSettings();
  const styles = makeStyles(colors, line);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [show, setShow] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setErro(null);
    if (!email.trim() || !senha) return setErro(t('login.errPreencher'));
    try {
      setCarregando(true);
      const u = await login(email.trim(), senha); // recebe o token da API e guarda
      onAuth(u);
    } catch (e) {
      setErro(t('login.errCredenciais'));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SpaceBg orbit />
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }}>
        <View style={styles.logo}><Text style={{ fontSize: 30 }}>🛰️</Text></View>
        <Text style={styles.brand}>Agro<Text style={{ color: colors.primary }}>Sat</Text></Text>
        <Text style={styles.tagline}>{t('login.tagline')}</Text>

        <View style={{ marginTop: 'auto', gap: 14 }}>
          <Field icon="mail" label={t('login.email')} value={email} onChange={setEmail} placeholder={t('login.emailPh')} keyboardType="email-address" />
          <Field icon="lock" label={t('login.senha')} value={senha} onChange={setSenha} secure={!show} placeholder="••••••"
            trailing={<Pressable onPress={() => setShow((v) => !v)} hitSlop={10}><Icon name={show ? 'eyeOff' : 'eye'} size={19} color={colors.muted} /></Pressable>} />
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          <Pressable onPress={() => nav('recuperar')} style={{ alignSelf: 'flex-end' }}>
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: fonts.displayMed }}>{t('login.esqueci')}</Text>
          </Pressable>
          <Button full onPress={entrar} disabled={carregando}>{carregando ? '...' : t('login.entrar')}</Button>
          <Pressable onPress={() => nav('cadastro')}>
            <Text style={styles.foot}>{t('login.novo')}<Text style={{ color: colors.ink, fontFamily: fonts.displayMed }}>{t('login.criarConta')}</Text></Text>
          </Pressable>
          <View style={styles.demo}>
            <Text style={styles.demoTit}>{t('login.demo')}</Text>
            <Text style={styles.demoTxt}>kaiky@boavista.agr.br · soja2026</Text>
            <Text style={styles.demoTxt}>felipe@cafedoalto.agr.br · cafe2026</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors, line) => StyleSheet.create({
  logo: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: alpha(colors.primary, 0.3) },
  themeBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: line, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  brand: { fontFamily: fonts.display, color: colors.ink, fontSize: 38, marginTop: 24, letterSpacing: -0.5 },
  tagline: { color: colors.sub, fontSize: 15, marginTop: 8, maxWidth: 280, lineHeight: 21 },
  erro: { color: colors.high, fontSize: 13, marginLeft: 4 },
  foot: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 2 },
  demo: { marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: alpha(colors.hair, 0.04), borderWidth: 1, borderColor: line },
  demoTit: { color: colors.muted, fontSize: 10, fontFamily: fonts.mono, letterSpacing: 1, marginBottom: 6 },
  demoTxt: { color: colors.sub, fontSize: 12, fontFamily: fonts.mono, lineHeight: 18 },
});
