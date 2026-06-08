// ============================================================
// AgroSat — modelo de domínio + SEED (dados iniciais)
// ------------------------------------------------------------
// Este arquivo define o "shape" do domínio usado pelo app e o
// conjunto de dados-semente. A PERSISTÊNCIA e o CRUD ficam na
// camada de serviço (src/services/*), que no modo real fala com
// a API Java/.NET via Axios e no modo mock usa AsyncStorage.
//
// Multi-usuário com isolamento: cada usuário tem UMA OU MAIS
// propriedades (fazendas); talhões e alertas pertencem a uma
// propriedade. O Felipe nunca enxerga a base do Kaiky.
// ============================================================

// ---------- Usuários (credenciais de demonstração) ----------
export const USUARIOS = [
  { id: 1, nome: 'Kaiky Oliveira', email: 'kaiky@boavista.agr.br', senha: 'soja2026' },
  { id: 2, nome: 'Felipe Souza', email: 'felipe@cafedoalto.agr.br', senha: 'cafe2026' },
];

// ---------- Propriedades (fazendas) — Kaiky tem 2, Felipe 1 ----------
export const PROPRIEDADES = [
  { id: 'p1', idUsuario: 1, nome: 'Fazenda Boa Vista', local: 'Campinas/SP', ha: 320 },
  { id: 'p2', idUsuario: 1, nome: 'Fazenda Cerrado', local: 'Rio Verde/GO', ha: 210 },
  { id: 'p3', idUsuario: 2, nome: 'Sítio Café do Alto', local: 'Patrocínio/MG', ha: 145 },
];

// ---------- Talhões — pertencem a uma propriedade ----------
export const TALHOES = [
  // Fazenda Boa Vista (p1) — Kaiky
  { id: 'k-norte', idPropriedade: 'p1', nome: 'Talhão Norte', ha: 80, cultura: 'Soja', umidade: 38, idealLo: 40, idealHi: 70, ndvi: 0.42, alerta: 'ALTA' },
  { id: 'k-leste', idPropriedade: 'p1', nome: 'Talhão Leste', ha: 65, cultura: 'Milho', umidade: 58, idealLo: 45, idealHi: 75, ndvi: 0.61, alerta: 'BAIXA' },
  { id: 'k-sul', idPropriedade: 'p1', nome: 'Talhão Sul', ha: 90, cultura: 'Café', umidade: 73, idealLo: 45, idealHi: 65, ndvi: 0.68, alerta: 'MEDIA' },
  // Fazenda Cerrado (p2) — Kaiky
  { id: 'k-chapada', idPropriedade: 'p2', nome: 'Talhão Chapada', ha: 120, cultura: 'Soja', umidade: 52, idealLo: 40, idealHi: 70, ndvi: 0.59, alerta: 'BAIXA' },
  { id: 'k-baixao', idPropriedade: 'p2', nome: 'Talhão Baixão', ha: 90, cultura: 'Milho', umidade: 44, idealLo: 45, idealHi: 75, ndvi: 0.48, alerta: 'MEDIA' },
  // Sítio Café do Alto (p3) — Felipe
  { id: 'f-cafezal', idPropriedade: 'p3', nome: 'Talhão Cafezal', ha: 55, cultura: 'Café', umidade: 64, idealLo: 50, idealHi: 70, ndvi: 0.71, alerta: 'BAIXA' },
  { id: 'f-encosta', idPropriedade: 'p3', nome: 'Talhão Encosta', ha: 40, cultura: 'Café', umidade: 33, idealLo: 50, idealHi: 70, ndvi: 0.36, alerta: 'ALTA' },
  { id: 'f-vale', idPropriedade: 'p3', nome: 'Talhão do Vale', ha: 50, cultura: 'Milho', umidade: 69, idealLo: 45, idealHi: 75, ndvi: 0.66, alerta: 'BAIXA' },
];

// ---------- Alertas — pertencem a uma propriedade/talhão ----------
export const ALERTAS = [
  { id: 1, idPropriedade: 'p1', talId: 'k-norte', tipo: 'SECA', sev: 'ALTA', talhao: 'Talhão Norte', rec: 'Irrigar 40 min', quando: 'há 12 min', ativo: true, auto: false },
  { id: 2, idPropriedade: 'p1', talId: 'k-sul', tipo: 'EXCESSO_UMIDADE', sev: 'MEDIA', talhao: 'Talhão Sul', rec: 'Suspender irrigação', quando: 'há 1 h', ativo: true, auto: false },
  { id: 3, idPropriedade: 'p2', talId: 'k-baixao', tipo: 'SECA', sev: 'MEDIA', talhao: 'Talhão Baixão', rec: 'Monitorar umidade', quando: 'há 3 h', ativo: true, auto: false },
  { id: 4, idPropriedade: 'p3', talId: 'f-encosta', tipo: 'SECA', sev: 'ALTA', talhao: 'Talhão Encosta', rec: 'Irrigar 50 min', quando: 'há 30 min', ativo: true, auto: false },
  { id: 5, idPropriedade: 'p3', talId: 'f-cafezal', tipo: 'GEADA', sev: 'MEDIA', talhao: 'Talhão Cafezal', rec: 'Atenção à temperatura', quando: 'há 3 h', ativo: true, auto: false },
];

// ---------- Leituras de sensor (histórico) ----------
export const LEITURAS = [
  { id: 1, talId: 'k-norte', solo: 41, temp: 26.2, ar: 56, lux: 780, ts: '2026-06-05T07:10:00' },
  { id: 2, talId: 'k-norte', solo: 38, temp: 27.4, ar: 55, lux: 820, ts: '2026-06-06T12:00:00' },
  { id: 3, talId: 'k-sul', solo: 70, temp: 23.1, ar: 70, lux: 540, ts: '2026-06-06T08:30:00' },
  { id: 4, talId: 'f-encosta', solo: 35, temp: 25.0, ar: 50, lux: 900, ts: '2026-06-06T09:00:00' },
];

// ============================================================
// Regras de domínio (puras) — reaproveitadas na geração de alertas
// ============================================================
export const tipoLabel = (t) => (t || '').replace(/_/g, ' ');
export const primeiraLetra = (nome) => (nome || '?').trim().charAt(0).toUpperCase();

// ---------- Culturas: faixa de umidade ideal do solo (%) por planta ----------
// Valores agronômicos de referência — usados para sugerir a faixa ideal
// automaticamente ao cadastrar/editar um talhão.
export const CULTURAS_INFO = {
  Soja: { idealLo: 40, idealHi: 70 },
  Milho: { idealLo: 45, idealHi: 75 },
  Café: { idealLo: 45, idealHi: 65 },
  Cana: { idealLo: 55, idealHi: 80 },
  Algodão: { idealLo: 40, idealHi: 65 },
  Feijão: { idealLo: 45, idealHi: 70 },
  Arroz: { idealLo: 60, idealHi: 90 },
  Trigo: { idealLo: 40, idealHi: 65 },
  Laranja: { idealLo: 50, idealHi: 70 },
  Tomate: { idealLo: 50, idealHi: 75 },
  Batata: { idealLo: 50, idealHi: 75 },
  Pastagem: { idealLo: 40, idealHi: 70 },
  Hortaliças: { idealLo: 55, idealHi: 80 },
  Outro: { idealLo: 40, idealHi: 70 },
};
export const CULTURAS = Object.keys(CULTURAS_INFO);
export const faixaDaCultura = (c) => CULTURAS_INFO[c] || CULTURAS_INFO.Outro;

// Classifica uma umidade medida contra a faixa ideal do talhão.
// Retorna o alerta que DEVE existir (ou null se está tudo certo).
export function avaliarUmidade(talhao, umidade) {
  if (!talhao) return null;
  const u = Number(umidade);
  if (Number.isNaN(u)) return null;
  if (u < talhao.idealLo) {
    const critico = u < talhao.idealLo - 10;
    return {
      tipo: 'SECA',
      sev: critico ? 'ALTA' : 'MEDIA',
      rec: critico ? 'Irrigar com urgência' : 'Programar irrigação',
    };
  }
  if (u > talhao.idealHi) {
    const critico = u > talhao.idealHi + 10;
    return {
      tipo: 'EXCESSO_UMIDADE',
      sev: critico ? 'ALTA' : 'MEDIA',
      rec: critico ? 'Suspender irrigação e drenar' : 'Reduzir irrigação',
    };
  }
  return null; // dentro do ideal
}

// ============================================================
// Autenticação (mock local; no modo real isso vai p/ authService)
// ============================================================
export function autenticar(email, senha) {
  const e = (email || '').trim().toLowerCase();
  return USUARIOS.find((u) => u.email.toLowerCase() === e && u.senha === senha) || null;
}

export function emailExiste(email) {
  const e = (email || '').trim().toLowerCase();
  return USUARIOS.some((u) => u.email.toLowerCase() === e);
}

export function cadastrar({ nome, email, senha }) {
  const novo = {
    id: USUARIOS.length + Math.floor(Math.random() * 100000) + 10,
    nome: (nome || '').trim(),
    email: (email || '').trim(),
    senha,
  };
  USUARIOS.push(novo);
  return novo;
}

export function atualizarUsuario(id, patch) {
  const i = USUARIOS.findIndex((u) => u.id === id);
  if (i < 0) return null;
  USUARIOS[i] = { ...USUARIOS[i], ...patch };
  return USUARIOS[i];
}

// ============================================================
// Seletores SÍNCRONOS sobre o SEED (compatibilidade)
// ------------------------------------------------------------
// Usados por telas ainda não migradas para a camada de serviço.
// Leem direto do seed (sem persistência). À medida que as telas
// passam a usar dataService (async), estes deixam de ser usados.
// ============================================================
export const propriedadesDe = (user) => PROPRIEDADES.filter((p) => p.idUsuario === user?.id);
export const propriedadeDe = (user) => propriedadesDe(user)[0] || null;
export const talhoesDe = (user) => {
  const ids = propriedadesDe(user).map((p) => p.id);
  return TALHOES.filter((t) => ids.includes(t.idPropriedade));
};
export const alertasDe = (user) => {
  const ids = propriedadesDe(user).map((p) => p.id);
  return ALERTAS.filter((a) => ids.includes(a.idPropriedade));
};
export const talhaoPorId = (user, id) => talhoesDe(user).find((t) => t.id === id) || talhoesDe(user)[0] || null;
export const alertaDoTalhao = (user, talId) => alertasDe(user).find((a) => a.talId === talId && a.ativo) || null;
