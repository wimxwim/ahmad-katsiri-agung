"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ClientSession {
  role: string;
  nama: string;
}

const SessionContext = createContext<ClientSession | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    const raw = (window as unknown as Record<string, unknown>).__SESSION;
    if (raw && typeof raw === "object" && "role" in raw && "nama" in raw) {
      setSession(raw as ClientSession);
    }
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
