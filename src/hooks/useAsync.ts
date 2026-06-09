// ============================================================
// AgroSat — hook utilitário para chamadas assíncronas (API/serviço)
// Padroniza os 3 estados que a apostila pede como feedback visual:
//   loading (carregando) · error (falha) · data (sucesso)
// e expõe reload() para o botão "Tentar novamente".
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';

export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fn();
      if (mounted.current) setData(r);
    } catch (e) {
      if (mounted.current) setError(e?.message || 'Não foi possível carregar os dados.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
