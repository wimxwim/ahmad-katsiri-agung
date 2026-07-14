"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSafeFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

export function useSafeFetch<T = unknown>(
  url: string | null,
  options?: RequestInit & { skip?: boolean }
): UseSafeFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const retryCount = useRef(0);

  const fetchData = useCallback(async () => {
    if (!url || options?.skip) {
      setLoading(false);
      return;
    }

    // Abort previous request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Gagal memuat data (${res.status})`);
      }

      const json = await res.json();

      if (mountedRef.current && !controller.signal.aborted) {
        setData(json.data ?? json);
        retryCount.current = 0;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (mountedRef.current && !controller.signal.aborted) {
        const message = err instanceof Error ? err.message : "Gagal memuat data";

        // Auto-retry once on network error
        if (retryCount.current < 1 && message.includes("fetch")) {
          retryCount.current++;
          setTimeout(() => fetchData(), 1000);
          return;
        }

        setError(message);
        retryCount.current = 0;
      }
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    retryCount.current = 0;
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
