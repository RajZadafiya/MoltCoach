import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coach, LoginRequest } from '../interface';
import { authApi, setOnUnauthorized } from '../api';
import { TOKEN_STORAGE_KEY } from 'globals';

interface AuthContextType {
  token: string | null;
  coach: Coach | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  coach: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
    setToken(null);
    setCoach(null);
  };

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });

    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
          setToken(storedToken);
          try {
            const me = await authApi.getMe();
            setCoach(me);
          } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
              await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
              setToken(null);
            }
          }
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const res = await authApi.login(credentials);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setToken(res.token);
    setCoach(res.coach);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        coach,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
