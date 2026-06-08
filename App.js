// ============================================================
// AgroSat — App root: fontes, safe-area e NAVEGAÇÃO (React Navigation)
// ------------------------------------------------------------
// Navegação com @react-navigation/native-stack. As telas mantêm a
// API nav(tela, param) por meio de um adaptador, e a TabBar custom
// + o frame de celular + o tema são preservados.
// ============================================================
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  NavigationContainer,
  createNavigationContainerRef,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { SettingsProvider } from './src/context/Settings';
import { AuthProvider, useAuth } from './src/context/Auth';
import { AppDataProvider } from './src/context/AppData';
import TabBar from './src/components/TabBar';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TalhoesScreen from './src/screens/TalhoesScreen';
import TalhaoDetalheScreen from './src/screens/TalhaoDetalheScreen';
import TalhaoFormScreen from './src/screens/TalhaoFormScreen';
import NovaLeituraScreen from './src/screens/NovaLeituraScreen';
import AlertasScreen from './src/screens/AlertasScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import RecuperarSenhaScreen from './src/screens/RecuperarSenhaScreen';
import FazendasScreen from './src/screens/FazendasScreen';
import FazendaFormScreen from './src/screens/FazendaFormScreen';
import { EditarPerfilScreen, NotificacoesScreen, ConfiguracoesScreen, SobreScreen } from './src/screens/PerfilSubScreens';

SplashScreen.preventAutoHideAsync();

// Impede o Google Tradutor do Chrome de traduzir a página (a tradução
// mexe nos textos e quebra o React ao navegar — "removeChild" error).
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  try {
    const html = document.documentElement;
    html.lang = 'pt-BR';
    html.setAttribute('translate', 'no');
    html.classList.add('notranslate');
    if (!document.querySelector('meta[name="google"]')) {
      const m = document.createElement('meta');
      m.name = 'google';
      m.content = 'notranslate';
      document.head.appendChild(m);
    }
  } catch (e) {}
}

const Stack = createNativeStackNavigator();
const navRef = createNavigationContainerRef();

// Telas do app (logado) e telas de autenticação
const MAIN_SCREENS = {
  dashboard: DashboardScreen,
  talhoes: TalhoesScreen,
  detalhe: TalhaoDetalheScreen,
  'talhao-form': TalhaoFormScreen,
  registrar: NovaLeituraScreen,
  alertas: AlertasScreen,
  perfil: PerfilScreen,
  fazendas: FazendasScreen,
  'fazenda-form': FazendaFormScreen,
  'editar-perfil': EditarPerfilScreen,
  notificacoes: NotificacoesScreen,
  configuracoes: ConfiguracoesScreen,
  sobre: SobreScreen,
};
const AUTH_SCREENS = {
  login: LoginScreen,
  cadastro: CadastroScreen,
  recuperar: RecuperarSenhaScreen,
};

// Adaptador: cada tela continua recebendo nav(tela, param) e os
// handlers de auth — sem precisar reescrever as telas.
function makeWrapped(Comp) {
  return function Wrapped({ navigation, route }) {
    const { user, entrar, sair, atualizarUser } = useAuth();
    const nav = useCallback(
      (screen, param) => navigation.navigate(screen, { param }),
      [navigation]
    );
    return (
      <Comp
        nav={nav}
        param={route.params?.param ?? null}
        user={user}
        onAuth={entrar}
        onLogout={sair}
        onUpdate={atualizarUser}
      />
    );
  };
}

const MAIN_ENTRIES = Object.entries(MAIN_SCREENS).map(([name, C]) => [name, makeWrapped(C)]);
const AUTH_ENTRIES = Object.entries(AUTH_SCREENS).map(([name, C]) => [name, makeWrapped(C)]);

function Root() {
  const { colors, mode, isDark } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const frameW = Math.min(width, 402);
  const [routeName, setRouteName] = useState('dashboard');

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, background: colors.bg, card: colors.bg, primary: colors.primary, text: colors.ink, border: colors.bg },
    };
  }, [isDark, colors]);

  const onRoute = useCallback(() => {
    if (navRef.isReady()) {
      const r = navRef.getCurrentRoute();
      if (r?.name) setRouteName(r.name);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.page, alignItems: 'center' }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, width: frameW, backgroundColor: colors.bg, overflow: 'hidden' }}>
        {user ? (
          <AppDataProvider user={user}>
            <View style={{ flex: 1 }}>
              <NavigationContainer ref={navRef} theme={navTheme} onReady={onRoute} onStateChange={onRoute}>
                <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
                  {MAIN_ENTRIES.map(([name, C]) => (
                    <Stack.Screen key={name} name={name} component={C} />
                  ))}
                </Stack.Navigator>
              </NavigationContainer>
              <TabBar active={routeName} onNav={(k) => navRef.isReady() && navRef.navigate(k)} />
            </View>
          </AppDataProvider>
        ) : (
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
              {AUTH_ENTRIES.map(([name, C]) => (
                <Stack.Screen key={name} name={name} component={C} />
              ))}
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </View>
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Web: fundo escuro e altura cheia (evita a "faixa branca" ao rolar)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.margin = '0';
      const root = document.getElementById('root');
      if (root) {
        root.style.height = '100%';
        root.style.display = 'flex';
      }
    }
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <SettingsProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </SafeAreaProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
