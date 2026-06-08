// ============================================================
// AgroSat — contexto de autenticação (sessão do usuário)
// Mantém o usuário logado e persiste a sessão (web: localStorage),
// de forma que recarregar a página não desloga.
// ============================================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { atualizarUsuario } from '../data/agro';

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

  const entrar = useCallback((u) => {
    storeUser(u);
    setUser(u);
  }, []);

  const sair = useCallback(() => {
    storeUser(null);
    setUser(null);
  }, []);

  const atualizarUser = useCallback((patch) => {
    setUser((prev) => {
      const n = atualizarUsuario(prev.id, patch) || prev;
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
