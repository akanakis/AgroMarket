'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as API from '../services/apiService';

interface AuthContextType {
  user: API.UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: API.RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => { Authorization: string } | Record<string, never>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<API.UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session via refresh cookie (httpOnly)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const tokenRes = await API.refreshToken();
        const profile = await API.getMe(tokenRes.access_token);
        setAccessToken(tokenRes.access_token);
        setUser(profile);
      } catch {
        // No valid session — user needs to log in
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokenRes = await API.login(email, password);
    const profile = await API.getMe(tokenRes.access_token);
    setAccessToken(tokenRes.access_token);
    setUser(profile);
  }, []);

  const register = useCallback(async (payload: API.RegisterPayload) => {
    await API.register(payload);
    await login(payload.email, payload.password);
  }, [login]);

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await API.logout(accessToken);
      } catch {
        // Clear local state regardless of server response
      }
    }
    setAccessToken(null);
    setUser(null);
  }, [accessToken]);

  const getAuthHeaders = useCallback((): { Authorization: string } | Record<string, never> => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
