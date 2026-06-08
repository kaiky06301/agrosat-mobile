// ============================================================
// AgroSat — estado persistente (AsyncStorage)
// Igual ao useState, mas guarda o valor entre sessões/recarregos.
// Usado nas preferências (notificações, configurações).
// ============================================================
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function usePersistedState(key, initial) {
  const [value, setValue] = useState(initial);
  const loaded = useRef(false);

  useEffect(() => {
    let on = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (on && raw != null) {
          try {
            setValue(JSON.parse(raw));
          } catch (e) {
            /* valor inválido — ignora */
          }
        }
        loaded.current = true;
      })
      .catch(() => {
        loaded.current = true;
      });
    return () => {
      on = false;
    };
  }, [key]);

  useEffect(() => {
    if (loaded.current) {
      AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
    }
  }, [key, value]);

  return [value, setValue];
}
