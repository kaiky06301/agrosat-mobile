// ============================================================
// AgroSat — preferências do app: idioma (i18n) e unidade de temperatura
// Persiste a escolha (AsyncStorage) e expõe:
//   t(key, vars)  -> texto traduzido (PT/EN/ES)
//   temp(celsius) -> temperatura convertida e formatada (°C/°F)
// ============================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const Ctx = createContext(null);
const LOCALE_KEY = '@agrosat:locale';
const UNIT_KEY = '@agrosat:tempUnit';

function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Resolve uma chave no idioma pedido, com fallback para PT e para a própria chave.
function translate(locale, key, vars) {
  const dict = translations[locale] || translations.pt;
  let s = getByPath(dict, key);
  if (s == null) s = getByPath(translations.pt, key);
  if (s == null) return key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
    });
  }
  return s;
}

function fmtTemp(celsius, unit, withUnit) {
  if (celsius == null || celsius === '' || Number.isNaN(Number(celsius))) return '—';
  const c = Number(celsius);
  if (unit === 'F') {
    const v = Math.round((c * 9) / 5 + 32);
    return withUnit ? `${v}°F` : String(v);
  }
  const v = Math.round(c * 10) / 10;
  return withUnit ? `${v}°C` : String(v);
}

export function SettingsProvider({ children }) {
  const [locale, setLocaleState] = useState('pt');
  const [tempUnit, setTempUnitState] = useState('C');

  useEffect(() => {
    (async () => {
      try {
        const l = await AsyncStorage.getItem(LOCALE_KEY);
        if (l) setLocaleState(l);
        const u = await AsyncStorage.getItem(UNIT_KEY);
        if (u) setTempUnitState(u);
      } catch (e) {}
    })();
  }, []);

  const setLocale = useCallback((l) => {
    setLocaleState(l);
    AsyncStorage.setItem(LOCALE_KEY, l).catch(() => {});
  }, []);

  const setTempUnit = useCallback((u) => {
    setTempUnitState(u);
    AsyncStorage.setItem(UNIT_KEY, u).catch(() => {});
  }, []);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);
  const temp = useCallback((celsius, withUnit = true) => fmtTemp(celsius, tempUnit, withUnit), [tempUnit]);
  const unitSymbol = tempUnit === 'F' ? '°F' : '°C';

  return (
    <Ctx.Provider value={{ locale, setLocale, tempUnit, setTempUnit, t, temp, unitSymbol }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  return (
    useContext(Ctx) || {
      locale: 'pt',
      setLocale: () => {},
      tempUnit: 'C',
      setTempUnit: () => {},
      t: (key, vars) => translate('pt', key, vars),
      temp: (c, withUnit = true) => fmtTemp(c, 'C', withUnit),
      unitSymbol: '°C',
    }
  );
}
