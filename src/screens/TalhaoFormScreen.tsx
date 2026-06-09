// ============================================================
// AgroSat — Formulário de Talhão (CREATE / UPDATE / DELETE)
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen, Header } from '../components/Screen';
import { Button } from '../components/ui';
import { Loading } from '../components/AsyncBox';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { alpha, fonts } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../context/Settings';
import { useAppData } from '../context/AppData';
import { getTalhao, addTalhao, updateTalhao, deleteTalhao } from '../services/dataService';
import { CULTURAS, faixaDaCultura } from '../data/agro';

export default function TalhaoFormScreen({ nav, param }) {
  const { colors, line } = useTheme();
  const { t } = useSettings();
  const { propAtiva, bump } = useAppData();
  const editId = typeof param === 'string' ? param : null;

  const [nome, setNome] = useState('');
  const [cultura, setCultura] = useState('Soja');
  const [culturaCustom, setCulturaCustom] = useState('');
  const [ha, setHa] = useState('');
  const [idealLo, setIdealLo] = useState('40');
  const [idealHi, setIdealHi] = useState('70');
  const [umidade, setUmidade] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    let on = true;
    if (editId) {
      getTalhao(editId)
        .then((tl) => {
          if (on && tl) {
            setNome(tl.nome || '');
            const conhecida = CULTURAS.includes(tl.cultura);
            setCultura(conhecida ? tl.cultura : 'Outro');
            if (!conhecida) setCulturaCustom(tl.cultura || '');
            setHa(String(tl.ha ?? ''));
            setIdealLo(String(tl.idealLo ?? '40'));
            setIdealHi(String(tl.idealHi ?? '70'));
            setUmidade(String(tl.umidade ?? ''));
          }
          if (on) setLoading(false);
        })
        .catch(() => on && setLoading(false));
    }
    return () => { on = false; };
  }, [editId]);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) return setErro(t('talhaoForm.errNome'));
    if (Number(idealLo) >= Number(idealHi)) return setErro(t('talhaoForm.errFaixa'));
    setSaving(true);
    try {
      const dados = {
        nome: nome.trim(),
        cultura: cultura === 'Outro' ? (culturaCustom.trim() || 'Outro') : cultura,
        ha: Number(ha) || 0,
        idealLo: Number(idealLo) || 40,
        idealHi: Number(idealHi) || 70,
        umidade: Number(umidade) || Number(idealLo) || 40,
      };
      if (editId) await updateTalhao(editId, dados);
      else await addTalhao(propAtiva.id, dados);
      bump();
      nav('talhoes');
    } catch (e) {
      setErro(e?.message || 'Erro');
      setSaving(false);
    }
  }

  async function excluir() {
    setSaving(true);
    try {
      await deleteTalhao(editId);
      bump();
      nav('talhoes');
    } catch (e) {
      setErro(e?.message || 'Erro');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen tab>
        <Header title={t('talhaoForm.editar')} onBack={() => nav('talhoes')} />
        <Loading label={t('talhaoForm.carregando')} />
      </Screen>
    );
  }

  return (
    <Screen tab>
      <Header title={editId ? t('talhaoForm.editar') : t('talhaoForm.novo')} onBack={() => nav('talhoes')} />

      <View style={{ gap: 14, marginTop: 18 }}>
        <Field icon="leaf" label={t('talhaoForm.nome')} value={nome} onChange={setNome} placeholder={t('talhaoForm.nomePh')} />

        <View>
          <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 4, marginBottom: 8, fontFamily: fonts.displayMed }}>{t('talhaoForm.cultura')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CULTURAS.map((c) => {
              const on = cultura === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => {
                    setCultura(c);
                    const f = faixaDaCultura(c);
                    setIdealLo(String(f.idealLo));
                    setIdealHi(String(f.idealHi));
                  }}
                  style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, borderWidth: 1, borderColor: on ? colors.primary : line, backgroundColor: on ? alpha(colors.primary, 0.12) : 'transparent' }}
                >
                  <Text style={{ fontFamily: fonts.displayMed, fontSize: 13, color: on ? colors.primary : colors.sub }}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
          {cultura === 'Outro' ? (
            <>
              <View style={{ marginTop: 12 }}>
                <Field icon="leaf" label={t('talhaoForm.culturaOutro')} value={culturaCustom} onChange={setCulturaCustom} placeholder={t('talhaoForm.culturaOutroPh')} />
              </View>
              <Text style={{ color: colors.med, fontSize: 12, marginTop: 8, marginLeft: 4 }}>{t('talhaoForm.outroAjuste')}</Text>
            </>
          ) : (
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8, marginLeft: 4 }}>
              {t('talhaoForm.sugerida', { cultura, lo: faixaDaCultura(cultura).idealLo, hi: faixaDaCultura(cultura).idealHi })}
            </Text>
          )}
        </View>

        <Field icon="layers" label={t('talhaoForm.area')} value={ha} onChange={setHa} keyboardType="numeric" placeholder={t('talhaoForm.areaPh')} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field icon="droplet" label={t('talhaoForm.idealMin')} value={idealLo} onChange={setIdealLo} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field icon="droplet" label={t('talhaoForm.idealMax')} value={idealHi} onChange={setIdealHi} keyboardType="numeric" />
          </View>
        </View>

        <Field icon="gauge" label={t('talhaoForm.umidadeAtual')} value={umidade} onChange={setUmidade} keyboardType="numeric" placeholder={t('common.opcional')} />

        {erro ? <Text style={{ color: colors.high, fontSize: 13, marginLeft: 4 }}>{erro}</Text> : null}

        <Button full icon={saving ? undefined : 'check'} onPress={salvar} style={{ marginTop: 4 }}>
          {saving ? t('common.salvando') : editId ? t('common.salvar') : t('talhaoForm.criar')}
        </Button>

        {editId ? (
          confirmar ? (
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ color: colors.sub, fontSize: 13, textAlign: 'center' }}>{t('talhaoForm.excluirConfirm')}</Text>
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
              <Text style={{ color: colors.high, fontFamily: fonts.displayMed, fontSize: 14 }}>{t('talhaoForm.excluirBtn')}</Text>
            </Pressable>
          )
        ) : null}
      </View>
    </Screen>
  );
}
