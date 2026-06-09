// ============================================================
// AgroSat — Formulário de Fazenda (CREATE / UPDATE / DELETE)
// CRUD de propriedade via camada de serviço (Axios/mock).
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen, Header } from '../components/Screen';
import { Button } from '../components/ui';
import { Loading } from '../components/AsyncBox';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import { getPropriedades, addPropriedade, updatePropriedade, deletePropriedade } from '../services/dataService';

export default function FazendaFormScreen({ nav, param }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { user, propriedades, recarregarPropriedades, setPropAtiva, bump } = useAppData();
  const editId = typeof param === 'string' ? param : null;
  const podeExcluir = (propriedades || []).length > 1;

  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [ha, setHa] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    let on = true;
    if (editId && user) {
      getPropriedades(user.id)
        .then((props) => {
          const p = (props || []).find((x) => x.id === editId);
          if (on && p) {
            setNome(p.nome || '');
            setLocal(p.local || '');
            setHa(String(p.ha ?? ''));
          }
          if (on) setLoading(false);
        })
        .catch(() => on && setLoading(false));
    }
    return () => {
      on = false;
    };
  }, [editId, user?.id]);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) return setErro(t('fazendaForm.errNome'));
    setSaving(true);
    try {
      const dados = { nome: nome.trim(), local: local.trim() || '—', ha: Number(ha) || 0 };
      if (editId) {
        await updatePropriedade(editId, dados);
      } else {
        const nova = await addPropriedade(user.id, dados);
        if (nova?.id) setPropAtiva(nova.id);
      }
      await recarregarPropriedades();
      bump();
      nav('fazendas');
    } catch (e) {
      setErro(e?.message || 'Não foi possível salvar a fazenda.');
      setSaving(false);
    }
  }

  async function excluir() {
    setSaving(true);
    try {
      await deletePropriedade(editId);
      await recarregarPropriedades();
      bump();
      nav('fazendas');
    } catch (e) {
      setErro(e?.message || 'Não foi possível excluir.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen tab>
        <Header title={t('fazendaForm.editar')} onBack={() => nav('fazendas')} />
        <Loading label={t('fazendaForm.carregando')} />
      </Screen>
    );
  }

  return (
    <Screen tab>
      <Header title={editId ? t('fazendaForm.editar') : t('fazendaForm.nova')} onBack={() => nav('fazendas')} />
      <View style={{ gap: 14, marginTop: 18 }}>
        <Field icon="pin" label={t('fazendaForm.nome')} value={nome} onChange={setNome} placeholder={t('fazendaForm.nomePh')} />
        <Field icon="satellite" label={t('fazendaForm.local')} value={local} onChange={setLocal} placeholder={t('fazendaForm.localPh')} />
        <Field icon="layers" label={t('fazendaForm.area')} value={ha} onChange={setHa} keyboardType="numeric" placeholder={t('fazendaForm.areaPh')} />

        {erro ? <Text style={{ color: colors.high, fontSize: 13, marginLeft: 4 }}>{erro}</Text> : null}

        <Button full icon={saving ? undefined : 'check'} onPress={salvar} style={{ marginTop: 4 }}>
          {saving ? t('common.salvando') : editId ? t('common.salvar') : t('fazendaForm.criar')}
        </Button>

        {editId && podeExcluir ? (
          confirmar ? (
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ color: colors.sub, fontSize: 13, textAlign: 'center' }}>{t('fazendaForm.excluirConfirm')}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Button variant="ghost" full onPress={() => setConfirmar(false)}>{t('common.cancelar')}</Button></View>
                <View style={{ flex: 1 }}>
                  <Pressable onPress={excluir} style={{ height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.high }}>
                    <Text style={{ color: '#fff', fontFamily: fonts.displaySemi, fontSize: 15 }}>{t('common.excluir')}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setConfirmar(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, height: 46 }}>
              <Icon name="trash" size={17} color={colors.high} />
              <Text style={{ color: colors.high, fontFamily: fonts.displayMed, fontSize: 14 }}>{t('fazendaForm.excluirBtn')}</Text>
            </Pressable>
          )
        ) : null}
      </View>
    </Screen>
  );
}
