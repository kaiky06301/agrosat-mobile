// ============================================================
// AgroSat — camada de serviço (fachada de dados)
// ------------------------------------------------------------
// É a ÚNICA porta de entrada de dados das telas. Decide a fonte:
//   • USE_MOCK = true  -> banco local persistente (store.js)
//   • USE_MOCK = false -> API REST Java/.NET via Axios (api.js)
// Assim o app cumpre o requisito da apostila (CRUD via API com
// Axios) e ainda roda offline para demonstração/vídeo.
// Todas as funções são assíncronas e lançam erro em falha, para
// as telas exibirem feedback visual (loading/erro).
// ============================================================
import api, { USE_MOCK, mockDelay } from './api';
import * as store from './store';

// ---------------- Propriedades ----------------
export async function getPropriedades(userId) {
  if (USE_MOCK) {
    await mockDelay();
    return store.listarPropriedades(userId);
  }
  const { data } = await api.get('/propriedades');
  return data;
}

export async function addPropriedade(userId, dados) {
  if (USE_MOCK) {
    await mockDelay();
    return store.criarPropriedade(userId, dados);
  }
  const { data } = await api.post('/propriedades', dados);
  return data;
}

export async function updatePropriedade(id, patch) {
  if (USE_MOCK) {
    await mockDelay();
    return store.atualizarPropriedade(id, patch);
  }
  const { data } = await api.put(`/propriedades/${id}`, patch);
  return data;
}

export async function deletePropriedade(id) {
  if (USE_MOCK) {
    await mockDelay();
    return store.removerPropriedade(id);
  }
  await api.delete(`/propriedades/${id}`);
  return true;
}

// ---------------- Talhões (CRUD completo) ----------------
export async function getTalhoes(propId) {
  if (USE_MOCK) {
    await mockDelay();
    return store.listarTalhoes(propId);
  }
  const { data } = await api.get('/talhoes', { params: { propriedade: propId } });
  return data;
}

export async function getTalhao(id) {
  if (USE_MOCK) {
    await mockDelay();
    return store.obterTalhao(id);
  }
  const { data } = await api.get(`/talhoes/${id}`);
  return data;
}

export async function addTalhao(propId, dados) {
  if (USE_MOCK) {
    await mockDelay();
    return store.criarTalhao(propId, dados);
  }
  const { data } = await api.post('/talhoes', { ...dados, idPropriedade: propId });
  return data;
}

export async function updateTalhao(id, patch) {
  if (USE_MOCK) {
    await mockDelay();
    return store.atualizarTalhao(id, patch);
  }
  const { data } = await api.put(`/talhoes/${id}`, patch);
  return data;
}

export async function deleteTalhao(id) {
  if (USE_MOCK) {
    await mockDelay();
    return store.removerTalhao(id);
  }
  await api.delete(`/talhoes/${id}`);
  return true;
}

// ---------------- Alertas ----------------
export async function getAlertas(propId) {
  if (USE_MOCK) {
    await mockDelay();
    return store.listarAlertas(propId);
  }
  const { data } = await api.get('/alertas', { params: { propriedade: propId } });
  return data;
}

export async function marcarAlertaResolvido(id) {
  if (USE_MOCK) {
    await mockDelay();
    return store.resolverAlerta(id);
  }
  const { data } = await api.patch(`/alertas/${id}`, { ativo: false });
  return data;
}

export async function reabrirAlerta(id) {
  if (USE_MOCK) {
    await mockDelay();
    return store.reabrirAlerta(id);
  }
  const { data } = await api.patch(`/alertas/${id}`, { ativo: true });
  return data;
}

export async function deleteAlerta(id) {
  if (USE_MOCK) {
    await mockDelay();
    return store.removerAlerta(id);
  }
  await api.delete(`/alertas/${id}`);
  return true;
}

// ---------------- Leituras de sensor ----------------
export async function getLeituras(talId) {
  if (USE_MOCK) {
    await mockDelay();
    return store.listarLeituras(talId);
  }
  const { data } = await api.get('/leituras', { params: { talhao: talId } });
  return data;
}

// Registra a leitura (CREATE) e devolve o efeito colateral:
// { leitura, alertaGerado, talhao } — usado p/ avisar o usuário.
export async function registrarLeitura(talId, valores) {
  if (USE_MOCK) {
    await mockDelay();
    return store.registrarLeitura(talId, valores);
  }
  const { data } = await api.post('/leituras', { ...valores, idTalhao: talId });
  return data;
}

// Resumo agregado de uma propriedade (dashboard)
export async function getResumoPropriedade(propId) {
  const [talhoes, alertas] = await Promise.all([getTalhoes(propId), getAlertas(propId)]);
  return { talhoes, alertas };
}
