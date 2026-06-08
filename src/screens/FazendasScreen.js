// ============================================================
// AgroSat — Minhas Fazendas (gerenciar propriedades)
// Lista as fazendas do produtor, permite escolher a ATIVA,
// adicionar nova e editar/excluir (CRUD de propriedade via API).
// ============================================================
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from '../components/Icon';
import { Screen, Header } from '../components/Screen';
import { Card } from '../components/ui';
import { Loading } from '../components/AsyncBox';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';

export default function FazendasScreen({ nav }) {
  const { colors, line } = useTheme();
  const { t } = useSettings();
  const { propriedades, propAtiva, setPropAtiva, loadingProps } = useAppData();

  if (loadingProps) {
    return (
      <Screen tab>
        <Header title={t('fazendas.titulo')} onBack={() => nav('perfil')} />
        <Loading label={t('fazendas.carregando')} />
      </Screen>
    );
  }

  return (
    <Screen tab>
      <Header title={t('fazendas.titulo')} sub={t('fazendas.sub', { n: propriedades.length })} onBack={() => nav('perfil')} />

      <Pressable
        onPress={() => nav('fazenda-form', null)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, height: 50, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: alpha(colors.primary, 0.5), backgroundColor: alpha(colors.primary, 0.07) }}
      >
        <Icon name="plus" size={18} color={colors.primary} />
        <Text style={{ fontFamily: fonts.displaySemi, color: colors.primary, fontSize: 14.5 }}>{t('fazendas.adicionar')}</Text>
      </Pressable>

      <View style={{ gap: 12, marginTop: 16 }}>
        {propriedades.map((p) => {
          const ativa = p.id === propAtiva?.id;
          return (
            <Card key={p.id} style={{ padding: 16, borderColor: ativa ? colors.primary : line, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: alpha(colors.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="pin" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 15.5 }}>{p.nome}</Text>
                    {ativa && (
                      <View style={{ backgroundColor: alpha(colors.primary, 0.14), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                        <Text style={{ color: colors.primary, fontSize: 10, fontFamily: fonts.mono }}>{t('fazendas.ativa')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.sub, fontSize: 12.5, marginTop: 2 }}>{p.local} · {p.ha} ha</Text>
                </View>
                <Pressable onPress={() => nav('fazenda-form', p.id)} style={{ width: 38, height: 38, borderRadius: 11, borderWidth: 1, borderColor: line, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="edit" size={16} color={colors.sub} />
                </Pressable>
              </View>
              {!ativa && (
                <Pressable onPress={() => setPropAtiva(p.id)} style={{ marginTop: 12, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(colors.primary, 0.1) }}>
                  <Text style={{ color: colors.primary, fontFamily: fonts.displaySemi, fontSize: 13.5 }}>{t('fazendas.tornarAtiva')}</Text>
                </Pressable>
              )}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
