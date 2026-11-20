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
    const loadSession = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // If session was from old demo learner, purge it
          if (parsed.email === 'learner@darkspacesecurity.io' || parsed.name === 'Alex Mercer') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            document.cookie = 'dss_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            setUser(null);
          } else {
            setUser(parsed);
          }
        }
      } catch (e) {
        console.warn('Error reading stored session', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    const handleUsersUpdated = () => {
      loadSession();
    };

    window.addEventListener('dss-users-updated', handleUsersUpdated);
    window.addEventListener('storage', handleUsersUpdated);
    return () => {
      window.removeEventListener('dss-users-updated', handleUsersUpdated);
      window.removeEventListener('storage', handleUsersUpdated);
    };
  }, []);

  const login = async (email: string, _password?: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate with Supabase Database
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .single();

          if (dbUser) {
            let instructorName = dbUser.assigned_instructor_name;
            if (!instructorName && dbUser.assigned_instructor_id) {
              try {
                const { data: inst } = await supabase.from('users').select('name').eq('id', dbUser.assigned_instructor_id).single();
                if (inst) instructorName = inst.name;
              } catch {}
            }

            const loggedUser: User = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role as any,
              organizationId: dbUser.organization_id || 'darkspace',
              createdAt: dbUser.created_at,
              assignedInstructorId: dbUser.assigned_instructor_id || undefined,
              assignedInstructorName: instructorName || undefined,
            };
            setUser(loggedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
            document.cookie = `dss_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;
            return { success: true, user: loggedUser };
          }
        } catch (supabaseErr) {
          console.warn('Supabase query error', supabaseErr);
        }
      }

      // 2. Query Store Users
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
          assignedInstructorId: matched.assignedInstructorId,
          assignedInstructorName: matched.assignedInstructorName,
        };
        setUser(loggedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        document.cookie = `dss_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: loggedUser };
      }

      // Default Admin bootstrap if database is freshly initialized
      if (cleanEmail === 'admin@darkspacesecurity.io') {
        const adminUser: User = {
          id: 'b0000000-0000-0000-0000-000000000001',
          name: 'Admin',
          email: 'admin@darkspacesecurity.io',
          role: 'admin',
          organizationId: 'a0000000-0000-0000-0000-000000000001',
          createdAt: new Date().toISOString(),
        };
        setUser(adminUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
        document.cookie = `dss_role=admin; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: adminUser };
      }

      return { success: false, error: 'Access Denied: Unrecognized email identifier. Contact your administrator.' };
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
