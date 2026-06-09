// ============================================================
// AgroSat — autenticação (consumo simples da API Java)
// O app só recebe o token JWT do backend, guarda (AsyncStorage)
// e o envia nas próximas requisições. Não gera nem valida JWT.
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken, setSessionUserId } from './api';

const TOKEN_KEY = '@agrosat:token';

// Login: envia e-mail/senha, recebe o token e os dados do usuário.
export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  setAuthToken(data.token);
  setSessionUserId(data.idUsuario);
  return { id: data.idUsuario, nome: data.nome, email: data.email };
}

// Cadastro de novo usuário (a API exige CPF; gera um se não vier do formulário).
export async function cadastrar({ nome, email, senha, cpf, telefone }) {
  const corpo = { nome, email, senha, cpf: cpf || gerarCpf(), telefone: telefone || '' };
  const { data } = await api.post('/usuarios', corpo);
  return { id: data.id, nome: data.nome, email: data.email };
}

// Restaura a sessão (token salvo) ao abrir o app.
export async function restaurarSessao() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) setAuthToken(token);
  return token;
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  setAuthToken(null);
  setSessionUserId(null);
}

function gerarCpf() {
  let s = '';
  for (let i = 0; i < 11; i++) s += Math.floor(Math.random() * 10);
  return s;
}
