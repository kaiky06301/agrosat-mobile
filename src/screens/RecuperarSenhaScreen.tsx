// ============================================================
// AgroSat — Recuperar senha (tema dinâmico)
// ============================================================
import React, { useState } from 'react';
import { Text, View, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { Button, SpaceBg } from '../components/ui';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';

export default function RecuperarSenhaScreen({ nav }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SpaceBg />
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }}>
        <Pressable onPress={() => nav('login')} style={{ alignSelf: 'flex-start', padding: 4, marginLeft: -4 }}>
          <Icon name="arrowL" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.titulo}>{t('recuperar.titulo')}</Text>
        <Text style={styles.sub}>{t('recuperar.sub')}</Text>
        {enviado ? (
          <View style={styles.ok}>
            <Icon name="check" size={22} color={colors.primary} />
            <Text style={styles.okTxt}>{t('recuperar.enviado')}</Text>
          </View>
        ) : (
          <View style={{ gap: 14, marginTop: 24 }}>
            <Field icon="mail" label={t('recuperar.email')} value={email} onChange={setEmail} placeholder={t('login.emailPh')} keyboardType="email-address" />
            <Button full onPress={() => setEnviado(true)}>{t('recuperar.enviar')}</Button>
          </View>
        )}
        <Pressable onPress={() => nav('login')} style={{ marginTop: 18 }}>
          <Text style={styles.foot}>{t('recuperar.voltarLogin')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  titulo: { fontFamily: fonts.display, color: colors.ink, fontSize: 30, marginTop: 12 },
  sub: { color: colors.sub, fontSize: 15, marginTop: 6, lineHeight: 21 },
  foot: { textAlign: 'center', color: colors.primary, fontSize: 14, fontFamily: fonts.displayMed },
  ok: { marginTop: 24, padding: 18, borderRadius: 16, backgroundColor: alpha(colors.primary, 0.1), flexDirection: 'row', alignItems: 'center', gap: 12 },
  okTxt: { color: colors.ink, fontSize: 15, flex: 1, lineHeight: 21 },
});
