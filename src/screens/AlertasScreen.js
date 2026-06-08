// ============================================================
// AgroSat — 5 · Alertas (dados via serviço/API) — READ + resolver
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import Icon from '../components/Icon';
import { Screen, Header } from '../components/Screen';
import { Card, SevChip, Tag, Button } from '../components/ui';
import { Loading, ErrorBox, EmptyBox } from '../components/AsyncBox';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import useAsync from '../hooks/useAsync';
import { getAlertas, marcarAlertaResolvido, deleteAlerta } from '../services/dataService';

function AlertCard({ a, onOpen, onResolver, onExcluir, resolvendo }) {
  const { colors, sev, line } = useTheme();
  const { t } = useSettings();
  const s = sev[a.sev];
  return (
    <Card style={{ padding: 16 }}>
      <Pressable onPress={onExcluir} style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="trash" size={16} color={colors.muted} />
      </Pressable>
      <Pressable onPress={onOpen} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: s.bg }}>
          <Icon name="alert" size={21} color={s.c} />
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 14.5 }}>{t('tipos.' + a.tipo)}</Text>
            <SevChip sev={a.sev} />
            {a.auto ? <Tag>{t('alertas.automatico')}</Tag> : null}
            {!a.ativo && <Tag tone="primary">✓ {t('alertas.resolvido')}</Tag>}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="pin" size={13} color={colors.sub} />
            <Text style={{ color: colors.sub, fontSize: 13 }}>{a.talhao}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <Icon name="droplet" size={14} color={s.c} />
              <Text style={{ color: s.c, fontSize: 12.5 }} numberOfLines={1}>{a.rec}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={12} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 11, fontFamily: fonts.mono }}>{a.quando}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      {a.ativo && (
        <Button variant="ghost" full icon={resolvendo ? undefined : 'check'} onPress={onResolver} style={{ marginTop: 12 }}>
          {resolvendo ? t('alertas.resolvendo') : t('alertas.resolver')}
        </Button>
      )}
    </Card>
  );
}

export default function AlertasScreen({ nav }) {
  const { colors, line } = useTheme();
  const { t } = useSettings();
  const { propAtiva, dataVersion, bump } = useAppData();
  const [filtro, setFiltro] = useState('ativos');
  const [resolvendoId, setResolvendoId] = useState(null);
  const [confirmarId, setConfirmarId] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () => (propAtiva ? getAlertas(propAtiva.id) : Promise.resolve([])),
    [propAtiva?.id, dataVersion]
  );
  const alertas = data || [];
  const list = alertas.filter((a) => filtro === 'todos' || a.ativo);
  const ativos = alertas.filter((a) => a.ativo).length;

  async function resolver(id) {
    setResolvendoId(id);
    try {
      await marcarAlertaResolvido(id);
      bump();
    } catch (e) {
      setResolvendoId(null);
    }
  }

  async function confirmarExclusao() {
    const id = confirmarId;
    setConfirmarId(null);
    try {
      await deleteAlerta(id);
      bump();
    } catch (e) {}
  }

  return (
    <Screen tab>
      <Header title={t('alertas.titulo')} sub={t('alertas.resumo', { ativos, total: alertas.length })} />
      <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginTop: 16, padding: 4, borderRadius: 16, backgroundColor: alpha(colors.hair, 0.05), borderWidth: 1, borderColor: line }}>
        {[['ativos', t('alertas.ativos')], ['todos', t('alertas.todos')]].map(([k, l]) => (
          <Pressable key={k} onPress={() => setFiltro(k)} style={[{ paddingHorizontal: 20, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, filtro === k && { backgroundColor: colors.primary }]}>
            <Text style={{ fontFamily: fonts.displayMed, fontSize: 13, color: filtro === k ? colors.white : colors.sub }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <Loading label={t('alertas.carregando')} />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyBox icon="✅" message={filtro === 'ativos' ? t('alertas.vazioAtivos') : t('alertas.vazioTodos')} />
      ) : (
        <View style={{ gap: 12, marginTop: 16 }}>
          {list.map((a) => (
            <AlertCard
              key={a.id}
              a={a}
              onOpen={() => nav('detalhe', a.talId)}
              onResolver={() => resolver(a.id)}
              onExcluir={() => setConfirmarId(a.id)}
              resolvendo={resolvendoId === a.id}
            />
          ))}
        </View>
      )}

      <Modal visible={!!confirmarId} transparent animationType="fade" onRequestClose={() => setConfirmarId(null)}>
        <Pressable onPress={() => setConfirmarId(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360, backgroundColor: colors.card, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: line }}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: alpha(colors.high, 0.14), alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={26} color={colors.high} />
              </View>
              <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 18, marginTop: 6 }}>{t('alertas.excluirTitulo')}</Text>
              <Text style={{ color: colors.sub, fontSize: 14, textAlign: 'center' }}>{t('alertas.excluirConfirm')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <View style={{ flex: 1 }}><Button variant="ghost" full onPress={() => setConfirmarId(null)}>{t('common.cancelar')}</Button></View>
              <View style={{ flex: 1 }}>
                <Pressable onPress={confirmarExclusao} style={{ height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.high }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.displaySemi, fontSize: 15 }}>{t('common.excluir')}</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
