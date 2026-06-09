// ============================================================
// AgroSat — contexto de dados do app
// ------------------------------------------------------------
// Mantém as PROPRIEDADES do usuário logado e qual está ATIVA
// (a fazenda que o app está exibindo). Carrega via dataService
// (API/mock). Expõe `dataVersion` + `bump()` para as telas
// recarregarem após mutações (criar talhão, registrar leitura…).
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPropriedades, getAlertas } from '../services/dataService';

const Ctx = createContext(null);

export function AppDataProvider({ user, children }) {
  const [propriedades, setPropriedades] = useState([]);
  const [propAtivaId, setPropAtivaId] = useState(null);
  const [loadingProps, setLoadingProps] = useState(true);
  const [erroProps, setErroProps] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [alertasAtivos, setAlertasAtivos] = useState(0);

  const carregarPropriedades = useCallback(async () => {
    if (!user) {
      setPropriedades([]);
      setLoadingProps(false);
      return;
    }
    setLoadingProps(true);
    setErroProps(null);
    try {
      const props = await getPropriedades(user.id);
      setPropriedades(props);
      setPropAtivaId((prev) =>
        prev && props.some((p) => p.id === prev) ? prev : props[0]?.id || null
      );
    } catch (e) {
      setErroProps(e?.message || 'Erro ao carregar propriedades.');
    } finally {
      setLoadingProps(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarPropriedades();
  }, [carregarPropriedades]);

  const bump = useCallback(() => setDataVersion((v) => v + 1), []);

  const propAtiva =
    propriedades.find((p) => p.id === propAtivaId) || propriedades[0] || null;

  // Conta os alertas ativos da fazenda ativa (para o badge da TabBar)
  useEffect(() => {
    let on = true;
    const pid = propAtiva?.id;
    if (!pid) {
      setAlertasAtivos(0);
      return;
    }
    getAlertas(pid)
      .then((as) => {
        if (on) setAlertasAtivos((as || []).filter((a) => a.ativo).length);
      })
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [propAtiva?.id, dataVersion]);

  const value = {
    user,
    propriedades,
    propAtiva,
    propAtivaId: propAtiva?.id || null,
    loadingProps,
    erroProps,
    setPropAtiva: setPropAtivaId,
    recarregarPropriedades: carregarPropriedades,
    dataVersion,
    bump,
    alertasAtivos,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  return useContext(Ctx) || {};
}
