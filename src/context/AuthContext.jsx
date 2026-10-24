import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, UNAUTHORIZED_EVENT } from '../services';
import { tokenStorage } from '../services/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  // Restore the session from a stored token on first load.
  useEffect(() => {
    if (!tokenStorage.get()) {
      setStatus('ready');
      return;
    }
    authService
      .me()
      .then(({ user: me }) => setUser(me))
      .catch(() => tokenStorage.clear())
      .finally(() => setStatus('ready'));
  }, []);

  // Any 401 from the API signs the user out.
  useEffect(() => {
    const onUnauthorized = () => {
      tokenStorage.clear();
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const startSession = useCallback(({ token, user: nextUser }) => {
    tokenStorage.set(token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(async (credentials) => startSession(await authService.login(credentials)), [startSession]);
  const register = useCallback(async (input) => startSession(await authService.register(input)), [startSession]);
  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: Boolean(user), login, register, logout, setUser }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
