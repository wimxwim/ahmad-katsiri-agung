"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                if (hasPromptedRef.current) return;
                hasPromptedRef.current = true;
                toast("Versi baru tersedia", {
                  description: "Muat ulang untuk memperbarui aplikasi.",
                  action: {
                    label: "Muat ulang",
                    onClick: () => {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                    },
                  },
                  duration: Infinity,
                });
              }
            });
          });

          // If already waiting (e.g. user navigated after update), prompt immediately
          if (registration.waiting && navigator.serviceWorker.controller) {
            if (!hasPromptedRef.current) {
              hasPromptedRef.current = true;
              toast("Versi baru tersedia", {
                description: "Muat ulang untuk memperbarui aplikasi.",
                action: {
                  label: "Muat ulang",
                  onClick: () => {
                    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
                  },
                },
                duration: Infinity,
              });
            }
          }
        })
        .catch(() => {});
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => {
        window.removeEventListener("load", register);
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      };
    }

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
