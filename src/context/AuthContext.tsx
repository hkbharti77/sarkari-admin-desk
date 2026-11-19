import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AdminUserProfile, LoginCredentials } from '../types/auth';
import { api } from '../services/api';

interface AuthContextValue {
  user: AdminUserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  seedAdmin: () => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserProfile | null>(() => api.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate active session on mount
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const activeToken = api.getToken();
      if (!activeToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await api.getMe();
        if (mounted) {
          setUser(profile);
          setToken(activeToken);
        }
      } catch (err: any) {
        if (activeToken.startsWith('offline_mock_')) {
          if (mounted) {
            setUser(api.getCurrentUser());
            setToken(activeToken);
          }
        } else {
          console.warn('[AuthContext] Session verification:', err);
          api.clearSession();
          if (mounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    // Listen for 401 Unauthorized from API calls
    const unsubscribe = api.onAuthError(() => {
      if (mounted) {
        setUser(null);
        setToken(null);
        setError('Your session has expired. Please sign in again.');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      setToken(res.token);
      return true;
    } catch (err: any) {
      const message = err.message || 'Authentication failed. Please verify email and password.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const seedAdmin = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.seedSuperAdmin();
      return {
        success: true,
        message: res.message || 'Default admin seeded in database (admin@govjob.in / Admin@1234)',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to seed admin user in database',
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        logout,
        seedAdmin,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
