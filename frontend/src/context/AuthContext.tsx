import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  mfaRequired: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  const login = async (_username: string, _password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: _username, password: _password }),
      });
      const data = await res.json();
      if (data.mfa_required) {
        setMfaRequired(true);
        return true;
      }
      return false;
    } catch {
      // Fallback mock
      setMfaRequired(true);
      return true;
    }
  };

  const verifyMfa = async (_code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: _code }),
      });
      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
      setMfaRequired(false);
      return true;
    } catch {
      // Fallback mock
      setToken('mock-token-abc123');
      setUser({
        id: '1',
        name: 'Lucas Menegazzo',
        email: 'lucas.menegazzo@bix-tech.com',
        badge: 'MYJTVLH4',
      });
      setIsAuthenticated(true);
      setMfaRequired(false);
      return true;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setMfaRequired(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, mfaRequired, login, verifyMfa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
