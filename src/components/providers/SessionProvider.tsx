"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ClientSession {
  role: string;
  nama: string;
  kelas?: string;
  noAbsen?: string;
  nis?: string;
  sekolah?: string;
}

const SessionContext = createContext<ClientSession | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    fetch("/api/sesi")
      .then((r) => r.json())
      .then((data) => {
        setSession(data.session ?? null);
      })
      .catch(() => {
        setSession(null);
      });
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
