import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../lib/api';
import type { SafeUser, LoginInput, RegisterInput } from '../types';

interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Define how we check credentials / current session
  const checkAuth = async () => {
    try {
      // 1. Try to refresh token (will use the httpOnly cookie)
      const refreshResult = await api.refreshSession();
      api.setAccessToken(refreshResult.tokens.accessToken);

      // 2. Fetch user profile
      const userProfile = await api.getMe();
      setUser(userProfile);
    } catch (error) {
      // No active session or expired
      api.setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication status on startup
    checkAuth();

    // Hook into api's unauthorized handler to sign out if session expires
    api.setOnUnauthorized(() => {
      setUser(null);
    });
  }, []);

  const login = async (input: LoginInput) => {
    setLoading(true);
    try {
      const response = await api.login(input);
      api.setAccessToken(response.tokens.accessToken);
      setUser(response.user);
    } catch (error) {
      api.setAccessToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setLoading(true);
    try {
      const response = await api.register(input);
      api.setAccessToken(response.tokens.accessToken);
      setUser(response.user);
    } catch (error) {
      api.setAccessToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      api.setAccessToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
