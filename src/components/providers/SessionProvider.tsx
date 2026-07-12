"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface ClientSession {
  userId?: string;
  role: string;
  nama: string;
  email?: string;
  kelas?: string;
  noAbsen?: string;
  nis?: string;
  sekolah?: string;
}

interface SessionContextValue {
  session: ClientSession | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue>({ session: null, isLoading: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchSession = useCallback(async () => {
    try {
      const r = await fetch("/api/sesi");
      const data = await r.json();
      if (!mountedRef.current) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    } catch {
      if (!mountedRef.current) return;
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSession();

    const interval = setInterval(fetchSession, 5 * 60 * 1000);

    const onFocus = () => fetchSession();
    window.addEventListener("focus", onFocus);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): ClientSession | null {
  return useContext(SessionContext).session;
}

export function useSessionLoading(): boolean {
  return useContext(SessionContext).isLoading;
}
