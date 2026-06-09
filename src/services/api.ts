import axios from 'axios';

// =============================================================================
// CONFIGURAÇÃO DA API (Java / Spring Boot) — consumo simples via Axios
// =============================================================================
// A API está publicada na nuvem (Azure, HTTPS). O app só CONSOME a API:
// recebe o token JWT no login, guarda e envia nas próximas requisições.
// (A geração e a validação do JWT são feitas no backend, não no app.)
//
//  - Nuvem (padrão):        https://agrosat-api-566067.azurewebsites.net/api
//  - Local (emulador And.): http://10.0.2.2:8080/api
//
export const API_URL = 'https://agrosat-api-566067.azurewebsites.net/api';

// false -> consome a API (Axios). true -> dados locais (store.js, modo offline).
export const USE_MOCK = false;

// id do usuário logado nesta sessão (usado ao criar registros via API)
let sessionUserId = null;
export const setSessionUserId = (id) => { sessionUserId = id; };
export const getSessionUserId = () => sessionUserId;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Recebe o token do backend e passa a enviá-lo no cabeçalho das requisições.
export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export default api;
