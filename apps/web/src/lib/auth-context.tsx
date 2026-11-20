'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { fetchUsersWithCourses } from './store';
import { getSupabaseBrowserClient } from './supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

const AUTH_STORAGE_KEY = 'dss_active_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage session
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading stored session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Try Supabase Auth or DB if available
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .single();

          if (dbUser) {
            const loggedUser: User = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role as any,
              organizationId: dbUser.organization_id || 'darkspace',
              createdAt: dbUser.created_at,
            };
            setUser(loggedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
            document.cookie = `dss_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;
            return { success: true, user: loggedUser };
          }
        } catch (supabaseErr) {
          console.warn('Supabase auth attempt skipped', supabaseErr);
        }
      }

      // 2. Fallback to Local Store Users
      const users = await fetchUsersWithCourses();
      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (matched) {
        const loggedUser: User = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          organizationId: matched.organizationId,
          createdAt: matched.createdAt,
        };
        setUser(loggedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        document.cookie = `dss_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: loggedUser };
      }

      // 3. Fallback for admin default
      if (cleanEmail === 'admin@darkspacesecurity.io') {
        const adminUser: User = {
          id: 'u1',
          name: 'Security Commander (Admin)',
          email: 'admin@darkspacesecurity.io',
          role: 'admin',
          organizationId: 'darkspace',
          createdAt: new Date().toISOString(),
        };
        setUser(adminUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
        document.cookie = `dss_role=admin; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: adminUser };
      }

      // 4. Fallback for learner default
      if (cleanEmail === 'learner@darkspacesecurity.io') {
        const learnerUser: User = {
          id: 'u2',
          name: 'Alex Mercer',
          email: 'learner@darkspacesecurity.io',
          role: 'learner',
          organizationId: 'darkspace',
          createdAt: new Date().toISOString(),
        };
        setUser(learnerUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(learnerUser));
        document.cookie = `dss_role=learner; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: learnerUser };
      }

      return { success: false, error: 'Access Denied: Email not registered in DarkSpaceSecurity identity directory.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = 'dss_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
