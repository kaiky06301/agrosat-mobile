import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// CONFIGURAÇÃO DA API
// =============================================================================
//
// TROQUE O API_URL ABAIXO pelo IP/URL onde a API Java (Spring Boot) está rodando.
//
//  - Emulador Android:        http://10.0.2.2:8080/api
//  - Celular físico (Expo Go): http://SEU_IP_LOCAL:8080/api  (ex.: http://192.168.0.12:8080/api)
//    Descubra seu IP com `ipconfig` (Windows) ou `ifconfig` / `ipconfig getifaddr en0` (Mac).
//  - API publicada na nuvem:  https://sua-api.onrender.com/api
//
// O contrato (CONTRATO-DOMINIO.md) define a base "/api" e o login em "/api/auth/login".
//
export const API_URL = 'http://192.168.0.10:8080/api';

// =============================================================================
// MODO MOCK
// =============================================================================
// Com USE_MOCK = true o app NÃO chama a rede: usa os dados de exemplo de
// mockData.js. Útil para demonstrar/gravar o vídeo sem a API no ar.
// Quando a API Java estiver rodando, mude para false.
export const USE_MOCK = true;

// Instância axios compartilhada
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token JWT (login Java) em todas as requisições, se existir
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@agrosat:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignora falha de leitura do storage
  }
  return config;
});

// Simula latência de rede no modo mock
export const mockDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export default api;
