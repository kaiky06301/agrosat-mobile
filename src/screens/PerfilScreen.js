// ============================================================
// AgroSat — Perfil do usuário (tema dinâmico)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { Screen, Header } from '../components/Screen';
import { Card, Button } from '../components/ui';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import { primeiraLetra } from '../data/agro';

const OPCOES = [
  { icon: 'leaf', key: 'editarPerfil', screen: 'editar-perfil' },
  { icon: 'layers', key: 'minhasFazendas', screen: 'fazendas' },
  { icon: 'bell', key: 'notificacoes', screen: 'notificacoes' },
  { icon: 'gauge', key: 'config', screen: 'configuracoes' },
  { icon: 'satellite', key: 'sobre', screen: 'sobre' },
];

export default function PerfilScreen({ nav, user, onLogout }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const styles = makeStyles(colors);
  const { propAtiva, propriedades } = useAppData();
  const prop = propAtiva || { nome: '—' };
  const qtd = (propriedades || []).length;
  return (
    <Screen tab>
      <Header title={t('perfil.titulo')} onBack={() => nav('dashboard')} />

      <Card style={{ padding: 22, alignItems: 'center', marginTop: 16 }}>
        <View style={styles.avatar}><Text style={styles.avatarTxt}>{primeiraLetra(user?.nome)}</Text></View>
        <Text style={styles.nome}>{user?.nome || 'Usuário'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.tag}>
          <Icon name="pin" size={13} color={colors.primary} />
          <Text style={styles.tagTxt}>{t('perfil.produtor', { fazenda: prop.nome })}{qtd > 1 ? ` (+${qtd - 1})` : ''}</Text>
        </View>
      </Card>

      <View style={{ gap: 10, marginTop: 16 }}>
        {OPCOES.map((o) => (
          <Card key={o.key} onPress={() => nav(o.screen)} style={styles.opt}>
            <View style={styles.optIcon}><Icon name={o.icon} size={18} color={colors.primary} /></View>
            <Text style={styles.optLabel}>{t('perfil.' + o.key)}</Text>
            <Icon name="chevR" size={18} color={colors.muted} />
          </Card>
        ))}
      </View>

      <Button variant="ghost" full icon="arrowL" onPress={onLogout} style={{ marginTop: 20 }}>{t('perfil.sair')}</Button>
      <Text style={styles.versao}>{t('perfil.versao')}</Text>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: alpha(colors.primary, 0.12), borderWidth: 1, borderColor: alpha(colors.primary, 0.3), alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: fonts.display, color: colors.primary, fontSize: 34 },
  nome: { fontFamily: fonts.display, color: colors.ink, fontSize: 20, marginTop: 12 },
  email: { color: colors.sub, fontSize: 13.5, marginTop: 2 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: alpha(colors.primary, 0.1), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  tagTxt: { color: colors.primary, fontSize: 12.5, fontFamily: fonts.displayMed },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  optIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: alpha(colors.primary, 0.12), alignItems: 'center', justifyContent: 'center' },
  optLabel: { flex: 1, fontFamily: fonts.displayMed, color: colors.ink, fontSize: 15 },
  versao: { textAlign: 'center', color: colors.muted, fontSize: 12, fontFamily: fonts.mono, marginTop: 18 },
});
