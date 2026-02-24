import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as API from '../services/apiService';

const ACCESS_TOKEN_KEY = 'agromarket_access_token';
const REFRESH_TOKEN_KEY = 'agromarket_refresh_token';

interface AuthContextType {
  user: API.UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: API.RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<API.UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from SecureStore
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (storedToken) {
          const profile = await API.getMe(storedToken);
          setAccessToken(storedToken);
          setUser(profile);
        }
      } catch {
        // Token expired or invalid — try refresh
        try {
          const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
          if (storedRefresh) {
            const tokenRes = await API.refreshTokenWithToken(storedRefresh);
            const profile = await API.getMe(tokenRes.access_token);
            setAccessToken(tokenRes.access_token);
            setUser(profile);
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenRes.access_token);
          }
        } catch {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log('1. Starting login API call...');
    const tokenRes = await API.login(email, password);
    console.log('2. Login token received:', tokenRes);
    console.log('3. Fetching user profile with getMe...');
    const profile = await API.getMe(tokenRes.access_token);
    console.log('4. Profile received:', profile);
    setAccessToken(tokenRes.access_token);
    setUser(profile);
    console.log('5. Setting securely stored token...');
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenRes.access_token);
    console.log('6. Processing refresh token if any...');
    if (tokenRes.refresh_token) {
      console.log('Refresh token is present, storing...');
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenRes.refresh_token);
    }
    console.log('7. Finalizing login step complete.');
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
        // Clear local state regardless
      }
    }
    setAccessToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
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
