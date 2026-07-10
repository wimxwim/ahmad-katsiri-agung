"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    let mounted = true;
    fetch("/api/sesi")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setSession(data.session ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

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
