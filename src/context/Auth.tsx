// ============================================================
// AgroSat — contexto de autenticação (sessão do usuário)
// Mantém o usuário logado e persiste a sessão (web: localStorage),
// de forma que recarregar a página não desloga. O token JWT é
// guardado/restaurado pelo serviço de auth (AsyncStorage).
// ============================================================
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { restaurarSessao, logout as apiLogout } from '../services/auth';
import { setSessionUserId } from '../services/api';

function getStoredUser() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const s = localStorage.getItem('agrosat-user');
      return s ? JSON.parse(s) : null;
    }
  } catch (e) {}
  return null;
}

function storeUser(u) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      if (u) localStorage.setItem('agrosat-user', JSON.stringify(u));
      else localStorage.removeItem('agrosat-user');
    }
  } catch (e) {}
}

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  // Ao abrir o app: restaura o token salvo e o id do usuário (para o CRUD via API).
  useEffect(() => {
    restaurarSessao();
    if (user?.id) setSessionUserId(user.id);
  }, []);

  const entrar = useCallback((u) => {
    storeUser(u);
    if (u?.id) setSessionUserId(u.id);
    setUser(u);
  }, []);

  const sair = useCallback(() => {
    apiLogout();
    storeUser(null);
    setUser(null);
  }, []);

  // Atualiza os dados do usuário em memória (edição de perfil).
  const atualizarUser = useCallback((patch) => {
    setUser((prev) => {
      const n = { ...prev, ...patch };
      storeUser(n);
      return n;
    });
  }, []);

  return (
    <Ctx.Provider value={{ user, entrar, sair, atualizarUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx) || { user: null, entrar: () => {}, sair: () => {}, atualizarUser: () => {} };
}
