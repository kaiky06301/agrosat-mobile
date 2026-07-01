// ============================================================
// AgroSat — camada de dados (consumo da API Java via Axios)
// ------------------------------------------------------------
// É a única porta de dados das telas. Decide a fonte:
//   • USE_MOCK = false -> API REST Java (Axios)  [padrão]
//   • USE_MOCK = true  -> dados locais (store.js, modo offline)
// As funções "map..." traduzem o formato da API para o formato
// que as telas já usam (e vice-versa), para não mudar as telas.
// ============================================================
import api, { USE_MOCK, mockDelay, getSessionUserId } from './api';
import * as store from './store';

// ---- helpers de tradução API <-> app ----

// HATEOAS: a lista pode vir embrulhada em { _embedded: { ...: [] } }.
function comoLista(data) {
  if (Array.isArray(data)) return data;
  if (data && data._embedded) {
    const chave = Object.keys(data._embedded)[0];
    return data._embedded[chave] || [];
  }
  return [];
}

function num(v) { return v == null ? 0 : Number(v); }

// avalia a umidade do talhão (regra de negócio usada para alerta/cor)
function avaliar(umidade, idealLo, idealHi) {
  if (umidade == null) return null;
  if (umidade < idealLo) return { tipo: 'SECA', sev: umidade < idealLo - 15 ? 'ALTA' : 'MEDIA', rec: 'Irrigar o talhao.' };
  if (umidade > idealHi) return { tipo: 'EXCESSO_UMIDADE', sev: umidade > idealHi + 15 ? 'ALTA' : 'MEDIA', rec: 'Suspender a irrigacao.' };
  return null;
}

function propDaApi(p) {
  return {
    id: p.id,
    idUsuario: p.idUsuario,
    nome: p.nome,
    local: p.municipio || p.uf || '—',
    ha: num(p.areaTotalHa),
  };
}
function propParaApi(userId, d) {
  const base = { idUsuario: userId, nome: d.nome, municipio: d.local, areaTotalHa: num(d.ha) };
  if (d.uf) base.uf = d.uf;
  if (d.lat != null) base.latitude = d.lat;
  if (d.lon != null) base.longitude = d.lon;
  return base;
}

function talhaoDaApi(t) {
  const idealLo = t.umidadeIdealMin != null ? Number(t.umidadeIdealMin) : 40;
  const idealHi = t.umidadeIdealMax != null ? Number(t.umidadeIdealMax) : 70;
  const umidade = t.umidadeAtual != null ? Number(t.umidadeAtual) : idealLo;
  const diag = avaliar(umidade, idealLo, idealHi);
  return {
    id: t.id,
    idPropriedade: t.idPropriedade,
    nome: t.nome,
    ha: num(t.areaHa),
    cultura: t.cultura || 'Soja',
    umidade,
    idealLo,
    idealHi,
    ndvi: t.ndvi != null ? Number(t.ndvi) : 0.5,
    alerta: diag ? diag.sev : 'BAIXA',
  };
}
function talhaoParaApi(propId, d) {
  return {
    idPropriedade: propId,
    nome: d.nome,
    areaHa: num(d.ha),
    cultura: d.cultura || 'Soja',
    umidadeAtual: d.umidade != null ? Number(d.umidade) : null,
    umidadeIdealMin: d.idealLo != null ? Number(d.idealLo) : 40,
    umidadeIdealMax: d.idealHi != null ? Number(d.idealHi) : 70,
    ndvi: d.ndvi != null ? Number(d.ndvi) : 0.5,
  };
}

function alertaDaApi(a) {
  return {
    id: a.id,
    idPropriedade: a.idPropriedade,
    talId: a.idTalhao,
    tipo: a.tipo,
    sev: a.severidade || 'MEDIA',
    talhao: a.mensagem || '',
    rec: a.mensagem || '',
    quando: 'agora',
    ativo: a.resolvido !== 'S',
    auto: true,
  };
}

function leituraDaApi(l) {
  return {
    id: l.id,
    talId: l.idTalhao,
    solo: num(l.umidadeSolo),
    temp: num(l.temperatura),
    ar: num(l.umidadeAr),
    lux: num(l.luminosidade),
    ts: l.dataHora,
  };
}

// ---------------- Propriedades ----------------
export async function getPropriedades(userId) {
  if (USE_MOCK) { await mockDelay(); return store.listarPropriedades(userId); }
  const { data } = await api.get('/propriedades');
  return comoLista(data).map(propDaApi).filter((p) => p.idUsuario === userId);
}

// Geocodifica um texto (cidade/regiao) -> { cidade, estado, uf, lat, lon }.
export async function geocode(q) {
  const { data } = await api.get('/geocode', { params: { q } });
  return {
    cidade: data.cidade,
    estado: data.estado,
    uf: data.uf,
    lat: data.latitude != null ? Number(data.latitude) : null,
    lon: data.longitude != null ? Number(data.longitude) : null,
    descricao: data.descricao,
  };
}

export async function addPropriedade(userId, dados) {
  if (USE_MOCK) { await mockDelay(); return store.criarPropriedade(userId, dados); }
  const { data } = await api.post('/propriedades', propParaApi(userId, dados));
  return propDaApi(data);
}

export async function updatePropriedade(id, patch) {
  if (USE_MOCK) { await mockDelay(); return store.atualizarPropriedade(id, patch); }
  const { data } = await api.put(`/propriedades/${id}`, propParaApi(getSessionUserId(), patch));
  return propDaApi(data);
}

export async function deletePropriedade(id) {
  if (USE_MOCK) { await mockDelay(); return store.removerPropriedade(id); }
  await api.delete(`/propriedades/${id}`);
  return true;
}

// ---------------- Talhões ----------------
export async function getTalhoes(propId) {
  if (USE_MOCK) { await mockDelay(); return store.listarTalhoes(propId); }
  const { data } = await api.get('/talhoes');
  return comoLista(data).map(talhaoDaApi).filter((t) => t.idPropriedade === propId);
}

export async function getTalhao(id) {
  if (USE_MOCK) { await mockDelay(); return store.obterTalhao(id); }
  const { data } = await api.get(`/talhoes/${id}`);
  return talhaoDaApi(data);
}

export async function addTalhao(propId, dados) {
  if (USE_MOCK) { await mockDelay(); return store.criarTalhao(propId, dados); }
  const { data } = await api.post('/talhoes', talhaoParaApi(propId, dados));
  return talhaoDaApi(data);
}

export async function updateTalhao(id, patch) {
  if (USE_MOCK) { await mockDelay(); return store.atualizarTalhao(id, patch); }
  // mescla com o atual para não perder campos que a tela não enviou
  const atual = await getTalhao(id);
  const { data } = await api.put(`/talhoes/${id}`, talhaoParaApi(atual.idPropriedade, { ...atual, ...patch }));
  return talhaoDaApi(data);
}

export async function deleteTalhao(id) {
  if (USE_MOCK) { await mockDelay(); return store.removerTalhao(id); }
  await api.delete(`/talhoes/${id}`);
  return true;
}

// ---------------- Alertas ----------------
export async function getAlertas(propId) {
  if (USE_MOCK) { await mockDelay(); return store.listarAlertas(propId); }
  const { data } = await api.get('/alertas');
  return comoLista(data).map(alertaDaApi).filter((a) => a.idPropriedade === propId);
}

export async function marcarAlertaResolvido(id) {
  if (USE_MOCK) { await mockDelay(); return store.resolverAlerta(id); }
  return setResolvido(id, 'S');
}

export async function reabrirAlerta(id) {
  if (USE_MOCK) { await mockDelay(); return store.reabrirAlerta(id); }
  return setResolvido(id, 'N');
}

async function setResolvido(id, valor) {
  const { data: a } = await api.get(`/alertas/${id}`);
  const { data } = await api.put(`/alertas/${id}`, {
    idTalhao: a.idTalhao, idPropriedade: a.idPropriedade, tipo: a.tipo,
    severidade: a.severidade, mensagem: a.mensagem, resolvido: valor,
  });
  return alertaDaApi(data);
}

export async function deleteAlerta(id) {
  if (USE_MOCK) { await mockDelay(); return store.removerAlerta(id); }
  await api.delete(`/alertas/${id}`);
  return true;
}

// ---------------- Leituras de sensor ----------------
export async function getLeituras(talId) {
  if (USE_MOCK) { await mockDelay(); return store.listarLeituras(talId); }
  const { data } = await api.get('/leituras');
  return comoLista(data).map(leituraDaApi).filter((l) => l.talId === talId)
    .sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

// Registra a leitura (CREATE via API), atualiza a umidade do talhão e gera/
// resolve o alerta automático. Devolve { leitura, alertaGerado, talhao }.
export async function registrarLeitura(talId, valores) {
  if (USE_MOCK) { await mockDelay(); return store.registrarLeitura(talId, valores); }

  // 1) grava a leitura
  const { data: lRaw } = await api.post('/leituras', {
    idTalhao: talId, umidadeSolo: num(valores.solo), temperatura: num(valores.temp),
    umidadeAr: num(valores.ar), luminosidade: num(valores.lux),
  });
  const leitura = leituraDaApi(lRaw);

  // 2) atualiza a umidade atual do talhão
  const talhao = await updateTalhao(talId, { umidade: num(valores.solo) });

  // 3) avalia: gera alerta se fora do ideal, ou resolve os existentes
  const diag = avaliar(talhao.umidade, talhao.idealLo, talhao.idealHi);
  let alertaGerado = null;
  const alertasTalhao = (await api.get('/alertas')).data;
  const existente = comoLista(alertasTalhao).map(alertaDaApi)
    .find((a) => a.talId === talId && (a.tipo === 'SECA' || a.tipo === 'EXCESSO_UMIDADE'));

  if (diag) {
    const corpo = {
      idTalhao: talId, idPropriedade: talhao.idPropriedade, tipo: diag.tipo,
      severidade: diag.sev, mensagem: `${talhao.nome}: ${diag.rec}`, resolvido: 'N',
    };
    if (existente) {
      const { data } = await api.put(`/alertas/${existente.id}`, corpo);
      alertaGerado = alertaDaApi(data);
    } else {
      const { data } = await api.post('/alertas', corpo);
      alertaGerado = alertaDaApi(data);
    }
  } else if (existente && existente.ativo) {
    await setResolvido(existente.id, 'S');
  }

  return { leitura, alertaGerado, talhao };
}

// ---------------- Satélite (NASA POWER — dados reais) ----------------
// Consome GET /api/satelite/propriedade/{id}: clima e radiação solar reais
// de satélite (MERRA-2/CERES), cruzados com a lat/lon da propriedade.
export async function getSatelite(propId) {
  if (USE_MOCK) { await mockDelay(); return null; }
  const { data } = await api.get(`/satelite/propriedade/${propId}`);
  return data;
}

// Resumo agregado de uma propriedade (dashboard)
export async function getResumoPropriedade(propId) {
  const [talhoes, alertas] = await Promise.all([getTalhoes(propId), getAlertas(propId)]);
  return { talhoes, alertas };
}
