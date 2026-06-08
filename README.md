# 📱 AgroSat — App Mobile (React Native + Expo)

App mobile do projeto **AgroSat** — Global Solution FIAP 2026/1, disciplina **Mobile Application Development**.

**AgroSat** é uma solução de **agricultura de precisão**: cruza **dados de satélite** (NDVI,
umidade estimada, previsão de chuva) com **sensores IoT (ESP32) no campo** (umidade do solo,
temperatura, etc.) e gera **alertas e recomendações de irrigação** por talhão. Tema da GS:
**economia espacial**. ODS 2, 8, 9 e 13.

---

## 👥 Integrantes do grupo
- Erick Bernardes Bradaschia — RM 565733
- Gabriel Santos Claudino — RM 564054
- Jonathan Moreira Gomes — RM 565060
- Kaiky de Oliveira Silva — RM 566067
- Lucas Fortes de Lima — RM 559523

## 🎥 Vídeo de demonstração
- YouTube: https://youtu.be/NfyEzVIzDFE

---

## ✅ Funcionalidades

- **Autenticação:** login, cadastro e recuperação de senha; sessão persistida (continua logado ao recarregar).
- **Multi-usuário com isolamento:** cada produtor vê só a própria base (propriedades/talhões/alertas).
- **Múltiplas fazendas:** o produtor pode ter várias propriedades e alternar a fazenda ativa.
- **CRUD de Talhões:** criar, listar, editar e excluir talhões (faixa ideal de umidade sugerida por cultura).
- **CRUD de Fazendas:** criar, editar e excluir propriedades.
- **Registro de leitura de sensor:** salva a leitura, atualiza a umidade do talhão e guarda o histórico.
- **Alertas automáticos:** ao registrar uma leitura fora da faixa ideal, o app gera o alerta sozinho
  (seca / excesso de umidade), com severidade e recomendação; dá pra resolver e excluir alertas.
- **Dashboard:** KPIs da fazenda, "atenção agora" e atalhos.
- **Internacionalização (i18n):** Português, Inglês e Espanhol — troca em tempo real.
- **Unidade de temperatura:** °C / °F (converte os valores exibidos).
- **Tema claro/escuro** dinâmico; preferências persistidas (AsyncStorage).

## 🧭 Telas (com navegação — React Navigation)
Login · Cadastro · Recuperar senha · Dashboard · Talhões · Detalhe do Talhão · Formulário de Talhão ·
Registrar Leitura · Alertas · Perfil · Minhas Fazendas · Formulário de Fazenda · Editar Perfil ·
Notificações · Configurações · Sobre.

Navegação com **`@react-navigation/native-stack`** + TabBar customizada.

## 🔌 Integração com a API (CRUD via Axios)
A camada de dados fica em `src/services/`:
- **`dataService.js`** — única porta de dados das telas. Decide a fonte por um flag:
  - `USE_MOCK = false` → consome a **API REST (Java/.NET) via Axios** (com token JWT).
  - `USE_MOCK = true` → usa um banco local persistente (`store.js`, AsyncStorage) para
    rodar/demonstrar sem o backend no ar.
- **`api.js`** — instância Axios (base URL + interceptor que injeta o JWT).

Para ligar na API real: em `src/services/api.js`, ajuste `API_URL` e mude `USE_MOCK` para `false`.
O contrato dos endpoints está em `../CONTRATO-DOMINIO.md`.

## 🏗️ Arquitetura / organização
```
src/
  components/   Icon, ui (Button/Card/Gauge/Bar...), Field, TabBar, AsyncBox, Screen
  context/      Auth (sessão), AppData (fazenda ativa), Settings (i18n + unidade)
  data/         agro.js (modelo + seed + culturas + regra de alerta automático)
  hooks/        useAsync (loading/erro/reload), usePersistedState
  i18n/         translations.js (PT/EN/ES)
  screens/      as telas
  services/     api (Axios), dataService (fachada), store (banco mock persistente)
  theme/        colors (claro/escuro), ThemeContext
App.js          navegação (React Navigation) + provedores + frame de celular
```

## 🛠️ Tecnologias
Expo SDK 54 · React Native 0.81 · React Navigation (native-stack) · Axios · AsyncStorage ·
react-native-svg · expo-linear-gradient · @react-native-community/slider ·
Google Fonts (Space Grotesk + JetBrains Mono).

## ▶️ Como rodar
```bash
npm install
npx expo start          # abra no Expo Go (leia o QR code) — celular na mesma Wi-Fi
# ou no navegador:
npx expo start --web
```
Contas de demonstração:
- `kaiky@boavista.agr.br` / `soja2026`
- `felipe@cafedoalto.agr.br` / `cafe2026`

---

Global Solution FIAP 2026/1 · Economia Espacial 🛰️🌱
