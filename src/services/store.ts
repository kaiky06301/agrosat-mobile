// ============================================================
// AgroSat — "banco" local persistente (modo MOCK)
// ------------------------------------------------------------
// Implementa o CRUD sobre AsyncStorage (no navegador usa o
// localStorage por baixo; no celular, o storage nativo). Serve
// de backend quando USE_MOCK = true: as ações do usuário (criar
// talhão, registrar leitura, resolver alerta) PERSISTEM de
// verdade entre recarregamentos. Quando a API Java/.NET estiver
// no ar, o dataService passa a usar Axios e ignora este arquivo.
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PROPRIEDADES,
  TALHOES,
  ALERTAS,
  LEITURAS,
  avaliarUmidade,
} from '../data/agro';

const DB_KEY = '@agrosat:db:v1';

// Monta o estado inicial a partir do seed (cópia profunda simples)
function seed() {
  return {
    propriedades: JSON.parse(JSON.stringify(PROPRIEDADES)),
    talhoes: JSON.parse(JSON.stringify(TALHOES)),
    alertas: JSON.parse(JSON.stringify(ALERTAS)),
    leituras: JSON.parse(JSON.stringify(LEITURAS)),
    seq: 1000,
  };
}

let cache = null; // memoriza o DB na sessão p/ evitar I/O repetido

async function getDB() {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(DB_KEY);
    cache = raw ? JSON.parse(raw) : seed();
  } catch (e) {
    cache = seed();
  }
  return cache;
}

async function setDB(db) {
  cache = db;
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    // se falhar a escrita, mantém ao menos em memória nesta sessão
  }
  return db;
}

// Reinicia o banco para o seed (útil para demonstração/reset)
export async function resetDB() {
  return setDB(seed());
}

function nextId(db) {
  db.seq = (db.seq || 1000) + 1;
  return db.seq;
}

// ---------- Propriedades ----------
export async function listarPropriedades(userId) {
  const db = await getDB();
  return db.propriedades.filter((p) => p.idUsuario === userId);
}

export async function criarPropriedade(userId, dados) {
  const db = await getDB();
  const nova = {
    id: 'p' + nextId(db),
    idUsuario: userId,
    nome: dados.nome || 'Nova Fazenda',
    local: dados.local || '—',
    ha: Number(dados.ha) || 0,
  };
  db.propriedades.push(nova);
  await setDB(db);
  return nova;
}

export async function atualizarPropriedade(id, patch) {
  const db = await getDB();
  const i = db.propriedades.findIndex((p) => p.id === id);
  if (i < 0) return null;
  db.propriedades[i] = { ...db.propriedades[i], ...patch, ha: patch.ha != null ? Number(patch.ha) : db.propriedades[i].ha };
  await setDB(db);
  return db.propriedades[i];
}

export async function removerPropriedade(id) {
  const db = await getDB();
  db.propriedades = db.propriedades.filter((p) => p.id !== id);
  // remove talhões/alertas órfãos
  const talhoesRemovidos = db.talhoes.filter((t) => t.idPropriedade === id).map((t) => t.id);
  db.talhoes = db.talhoes.filter((t) => t.idPropriedade !== id);
  db.alertas = db.alertas.filter((a) => a.idPropriedade !== id);
  db.leituras = db.leituras.filter((l) => !talhoesRemovidos.includes(l.talId));
  await setDB(db);
  return true;
}

// ---------- Talhões ----------
export async function listarTalhoes(propId) {
  const db = await getDB();
  return db.talhoes.filter((t) => t.idPropriedade === propId);
}

export async function obterTalhao(id) {
  const db = await getDB();
  return db.talhoes.find((t) => t.id === id) || null;
}

export async function criarTalhao(propId, dados) {
  const db = await getDB();
  const idealLo = Number(dados.idealLo) || 40;
  const idealHi = Number(dados.idealHi) || 70;
  const umidade = Number(dados.umidade) || idealLo;
  const novo = {
    id: 't' + nextId(db),
    idPropriedade: propId,
    nome: dados.nome || 'Novo Talhão',
    ha: Number(dados.ha) || 0,
    cultura: dados.cultura || 'Soja',
    umidade,
    idealLo,
    idealHi,
    ndvi: Number(dados.ndvi) || 0.5,
    alerta: severidadeDe(umidade, { idealLo, idealHi }),
  };
  db.talhoes.push(novo);
  await setDB(db);
  return novo;
}

export async function atualizarTalhao(id, patch) {
  const db = await getDB();
  const i = db.talhoes.findIndex((t) => t.id === id);
  if (i < 0) return null;
  const merged = { ...db.talhoes[i], ...patch };
  ['ha', 'umidade', 'idealLo', 'idealHi', 'ndvi'].forEach((k) => {
    if (patch[k] != null) merged[k] = Number(patch[k]);
  });
  merged.alerta = severidadeDe(merged.umidade, merged);
  db.talhoes[i] = merged;
  // editar re-avalia o alerta: se a umidade continua fora do ideal, ele volta
  // a ficar ativo; só fica resolvido se a umidade entrar na faixa ideal.
  reavaliarUmidade(db, merged);
  await setDB(db);
  return merged;
}

export async function removerTalhao(id) {
  const db = await getDB();
  db.talhoes = db.talhoes.filter((t) => t.id !== id);
  db.alertas = db.alertas.filter((a) => a.talId !== id);
  db.leituras = db.leituras.filter((l) => l.talId !== id);
  await setDB(db);
  return true;
}

// ---------- Alertas ----------
export async function listarAlertas(propId) {
  const db = await getDB();
  // mantém os alertas coerentes com o estado atual dos talhões:
  // talhão fora do ideal -> alerta ativo; dentro do ideal -> resolvido.
  db.talhoes
    .filter((t) => t.idPropriedade === propId)
    .forEach((t) => reavaliarUmidade(db, t));
  await setDB(db);
  return db.alertas.filter((a) => a.idPropriedade === propId);
}

export async function resolverAlerta(id) {
  const db = await getDB();
  const i = db.alertas.findIndex((a) => a.id === id);
  if (i < 0) return null;
  db.alertas[i] = { ...db.alertas[i], ativo: false };
  await setDB(db);
  return db.alertas[i];
}

export async function reabrirAlerta(id) {
  const db = await getDB();
  const i = db.alertas.findIndex((a) => a.id === id);
  if (i < 0) return null;
  db.alertas[i] = { ...db.alertas[i], ativo: true };
  await setDB(db);
  return db.alertas[i];
}

export async function removerAlerta(id) {
  const db = await getDB();
  db.alertas = db.alertas.filter((a) => a.id !== id);
  await setDB(db);
  return true;
}

// ---------- Leituras (+ geração automática de alerta) ----------
export async function listarLeituras(talId) {
  const db = await getDB();
  return db.leituras
    .filter((l) => l.talId === talId)
    .sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

// Registra uma leitura: atualiza a umidade do talhão, grava o
// histórico e — se a medição sair da faixa ideal — gera um alerta
// automático; se voltar ao normal, resolve os alertas automáticos.
export async function registrarLeitura(talId, valores) {
  const db = await getDB();
  const t = db.talhoes.find((x) => x.id === talId);
  if (!t) return null;

  const leitura = {
    id: nextId(db),
    talId,
    solo: Number(valores.solo),
    temp: Number(valores.temp),
    ar: Number(valores.ar),
    lux: Number(valores.lux),
    ts: new Date().toISOString(),
  };
  db.leituras.push(leitura);

  // atualiza a umidade atual do talhão com a medição do solo
  t.umidade = leitura.solo;
  t.alerta = severidadeDe(t.umidade, t);

  // regra de negócio: reavalia o alerta de umidade conforme a leitura nova
  const alertaGerado = reavaliarUmidade(db, t);

  await setDB(db);
  return { leitura, alertaGerado, talhao: t };
}

// Severidade de exibição do talhão a partir da umidade atual
function severidadeDe(umidade, talhao) {
  const diag = avaliarUmidade(talhao, umidade);
  if (!diag) return 'BAIXA';
  return diag.sev; // 'ALTA' | 'MEDIA'
}

const ehUmidade = (tp) => tp === 'SECA' || tp === 'EXCESSO_UMIDADE';

// Reavalia o alerta de umidade de um talhão conforme a umidade ATUAL dele.
// Mantém UM alerta de umidade por talhão, refletindo o estado real:
//   • fora do ideal  -> garante ALERTA ATIVO (reativa/atualiza/cria)
//   • dentro do ideal -> resolve o alerta de umidade
// Chamado ao registrar leitura E ao editar o talhão.
function reavaliarUmidade(db, t) {
  const diag = avaliarUmidade(t, t.umidade);
  if (diag) {
    let alerta = db.alertas.find((a) => a.talId === t.id && ehUmidade(a.tipo));
    if (alerta) {
      alerta.tipo = diag.tipo;
      alerta.sev = diag.sev;
      alerta.rec = diag.rec;
      alerta.talhao = t.nome;
      alerta.quando = 'agora';
      alerta.ativo = true; // reativa se estava resolvido e o problema persiste
      alerta.auto = true;
    } else {
      alerta = {
        id: nextId(db),
        idPropriedade: t.idPropriedade,
        talId: t.id,
        tipo: diag.tipo,
        sev: diag.sev,
        talhao: t.nome,
        rec: diag.rec,
        quando: 'agora',
        ativo: true,
        auto: true,
      };
      db.alertas.unshift(alerta);
    }
    return alerta;
  }
  // voltou ao ideal -> resolve alertas de umidade ativos do talhão
  db.alertas = db.alertas.map((a) =>
    a.talId === t.id && a.ativo && ehUmidade(a.tipo) ? { ...a, ativo: false } : a
  );
  return null;
}
