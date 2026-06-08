// ============================================================
// AgroSat — Criar conta (tema dinâmico)
// ============================================================
import React, { useState } from 'react';
import { Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { Button, SpaceBg } from '../components/ui';
import { fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { emailExiste, cadastrar } from '../data/agro';

export default function CadastroScreen({ nav, onAuth }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [show, setShow] = useState(false);
  const [erro, setErro] = useState(null);

  function criar() {
    setErro(null);
    if (!nome.trim() || !email.trim() || !senha) return setErro(t('cadastro.errCampos'));
    if (!email.includes('@')) return setErro(t('cadastro.errCampos'));
    if (emailExiste(email)) return setErro(t('cadastro.errEmail'));
    onAuth(cadastrar({ nome, email, senha }));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SpaceBg />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => nav('login')} style={{ alignSelf: 'flex-start', padding: 4, marginLeft: -4 }}>
          <Icon name="arrowL" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.titulo}>{t('cadastro.titulo')}</Text>
        <Text style={styles.sub}>{t('cadastro.sub')}</Text>
        <View style={{ gap: 14, marginTop: 24 }}>
          <Field icon="leaf" label={t('cadastro.nome')} value={nome} onChange={setNome} placeholder={t('cadastro.nome')} />
          <Field icon="mail" label={t('cadastro.email')} value={email} onChange={setEmail} placeholder={t('login.emailPh')} keyboardType="email-address" />
          <Field icon="lock" label={t('cadastro.senha')} value={senha} onChange={setSenha} secure={!show} placeholder="••••••"
            trailing={<Pressable onPress={() => setShow((s) => !s)}><Icon name="eye" size={19} color={colors.muted} /></Pressable>} />
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          <Button full onPress={criar} style={{ marginTop: 4 }}>{t('cadastro.criar')}</Button>
          <Pressable onPress={() => nav('login')}>
            <Text style={styles.foot}>{t('cadastro.jaTenho')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  titulo: { fontFamily: fonts.display, color: colors.ink, fontSize: 30, marginTop: 8 },
  sub: { color: colors.sub, fontSize: 15, marginTop: 6 },
  erro: { color: colors.high, fontSize: 13, marginLeft: 4 },
  foot: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 4 },
});
