"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  handleInstall: () => Promise<void>;
  showAutoPrompt: boolean;
  dismissAutoPrompt: () => void;
  showIosPrompt: boolean;
  dismissIosPrompt: () => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  handleInstall: async () => {},
  showAutoPrompt: false,
  dismissAutoPrompt: () => {},
  showIosPrompt: false,
  dismissIosPrompt: () => {},
});

export function usePWA() {
  return useContext(PWAContext);
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showAutoPrompt, setShowAutoPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  // Check standalone mode
  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }
  }, []);

  // Detect iOS
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    setIsIos(isIosDevice && isSafari);
  }, []);

  // Capture beforeinstallprompt event
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Auto-show prompt only on home page, only once
  useEffect(() => {
    if (isInstalled) return;
    if (pathname !== "/") return;

    const alreadyShown = localStorage.getItem("boxzz-pwa-auto-prompt-shown");
    if (alreadyShown) return;

    // Delay to let page load
    const timer = setTimeout(() => {
      if (deferredPrompt.current) {
        setShowAutoPrompt(true);
        localStorage.setItem("boxzz-pwa-auto-prompt-shown", "true");
      } else if (isIos) {
        // For iOS, show instructions
        const dismissed = localStorage.getItem("boxzz-ios-pwa-dismissed");
        if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
          setShowIosPrompt(true);
          localStorage.setItem("boxzz-pwa-auto-prompt-shown", "true");
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, isInstalled, isIos]);

  // Listen for successful installation
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setShowAutoPrompt(false);
      setShowIosPrompt(false);
      deferredPrompt.current = null;
      setIsInstallable(false);
    };

    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;

    deferredPrompt.current.prompt();

    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowAutoPrompt(false);
    }
    deferredPrompt.current = null;
    setIsInstallable(false);
  }, []);

  const dismissAutoPrompt = useCallback(() => {
    setShowAutoPrompt(false);
  }, []);

  const dismissIosPrompt = useCallback(() => {
    setShowIosPrompt(false);
    localStorage.setItem("boxzz-ios-pwa-dismissed", Date.now().toString());
  }, []);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        handleInstall,
        showAutoPrompt,
        dismissAutoPrompt,
        showIosPrompt,
        dismissIosPrompt,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}