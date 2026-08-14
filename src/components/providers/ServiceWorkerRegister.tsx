"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let hasPrompted = false;

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const showUpdateToast = (worker: ServiceWorker) => {
      if (hasPrompted) return;
      hasPrompted = true;
      toast("Versi baru tersedia", {
        description: "Muat ulang untuk memperbarui aplikasi.",
        action: {
          label: "Muat ulang",
          onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
        },
        duration: Infinity,
      });
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                showUpdateToast(newWorker);
              }
            });
          });
          if (registration.waiting && navigator.serviceWorker.controller) {
            showUpdateToast(registration.waiting);
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
