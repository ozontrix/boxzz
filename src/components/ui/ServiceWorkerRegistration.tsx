"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Wait for the page to load before registering
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      };

      // Register after a short delay to not block initial page load
      const timer = setTimeout(registerSW, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}