'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AdminProfile = {
  id: string;
  email: string;
};

export type ManagedCourse = {
  _id: string;
  course_id?: string;
  title?: string;
  category?: string;
  university?: string;
  instructor?: string;
  level?: string;
  duration_weeks?: number;
  updatedAt?: string;
};

type AdminSession = {
  token: string;
  admin: AdminProfile;
};

type AppStateContextValue = {
  isHydrated: boolean;
  isAuthenticated: boolean;
  admin: AdminProfile | null;
  token: string | null;
  courses: ManagedCourse[];
  totalCourses: number;
  isCoursesLoading: boolean;
  coursesError: string | null;
  courseQuery: string;
  setCourseQuery: (value: string) => void;
  setAuth: (session: AdminSession) => void;
  logout: () => void;
  fetchCourses: (options?: { force?: boolean }) => Promise<void>;
};

const SESSION_STORAGE_KEY = 'eduaihub:adminSession';
const COURSES_CACHE_PREFIX = 'eduaihub:courses:';
const COURSES_CACHE_TTL_MS = 1000 * 60 * 5;

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const getApiEndpoint = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL.endsWith('/api')
    ? `${API_BASE_URL}${cleanPath}`
    : `${API_BASE_URL}/api${cleanPath}`;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const getCacheKey = (query: string) => `${COURSES_CACHE_PREFIX}${(query || 'all').trim().toLowerCase()}`;

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [courseQuery, setCourseQuery] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.admin) {
          setToken(parsed.token);
          setAdmin(parsed.admin);
        }
      }
    } catch (err) {
      console.warn('Failed to restore session:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setAuth = useCallback((session: AdminSession) => {
    setToken(session.token);
    setAdmin(session.admin);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const fetchCourses = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force === true;
    const cacheKey = getCacheKey(courseQuery);

    setIsCoursesLoading(true);
    setCoursesError(null);

    try {
      if (!force) {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const isFresh = Number(cached?.timestamp) + COURSES_CACHE_TTL_MS > Date.now();
          if (isFresh && Array.isArray(cached?.data)) {
            setCourses(cached.data);
            setTotalCourses(Number(cached.total || cached.data.length));
            setIsCoursesLoading(false);
            return;
          }
        }
      }

      const params = new URLSearchParams({
        limit: '50',
      });
      if (courseQuery.trim()) {
        params.set('query', courseQuery.trim());
      }

      const response = await fetch(`${getApiEndpoint('/courses')}?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to fetch courses');
      }

      const nextCourses = Array.isArray(payload.data) ? payload.data : [];
      const nextTotal = Number(payload.total ?? nextCourses.length);

      setCourses(nextCourses);
      setTotalCourses(nextTotal);
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: nextCourses,
          total: nextTotal,
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load courses';
      setCoursesError(message);
    } finally {
      setIsCoursesLoading(false);
    }
  }, [courseQuery, token]);

  const value = useMemo(
    () => ({
      isHydrated,
      isAuthenticated: Boolean(token),
      admin,
      token,
      courses,
      totalCourses,
      isCoursesLoading,
      coursesError,
      courseQuery,
      setCourseQuery,
      setAuth,
      logout,
      fetchCourses,
    }),
    [
      isHydrated,
      token,
      admin,
      courses,
      totalCourses,
      isCoursesLoading,
      coursesError,
      courseQuery,
      setAuth,
      logout,
      fetchCourses,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
};
