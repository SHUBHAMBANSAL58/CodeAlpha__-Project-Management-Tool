import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader whenever `deps` change and tracks loading/error state.
 * `reload({ silent: true })` refreshes without flashing loading skeletons.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  const requestRef = useRef(0);
  loaderRef.current = loader;

  const reload = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestRef.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      if (requestId === requestRef.current) setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      if (requestId === requestRef.current) setState((s) => ({ ...s, loading: false, error }));
      return undefined;
    }
  }, []);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload, setData };
}
