"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

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

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  // Check if already installed (standalone mode)
  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }
  }, []);

  // Detect iOS Safari
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    setIsIos(isIosDevice && isSafari);

    // Show iOS prompt if on iOS Safari and not installed
    if (isIosDevice && isSafari && !isInstalled) {
      const dismissed = localStorage.getItem("boxzz-ios-pwa-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowIosPrompt(true);
      }
    }
  }, [isInstalled]);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for successful installation
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handler);

    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  }, []);

  const handleDismissIos = useCallback(() => {
    setShowIosPrompt(false);
    localStorage.setItem("boxzz-ios-pwa-dismissed", Date.now().toString());
  }, []);

  // Don't show anything if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Android/Chrome install prompt */}
      {showPrompt && deferredPrompt && (
        <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
            <img
              src="/icons/icon-192x192.png"
              alt="Boxzz"
              className="w-12 h-12 rounded-xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Install Boxzz</p>
              <p className="text-xs text-gray-500 truncate">
                Add to your home screen for the best experience
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari prompt */}
      {showIosPrompt && isIos && (
        <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <img
                  src="/icons/icon-192x192.png"
                  alt="Boxzz"
                  className="w-10 h-10 rounded-lg"
                />
                <p className="font-semibold text-gray-900 text-sm">Install Boxzz</p>
              </div>
              <button
                onClick={handleDismissIos}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              To install this app on your iOS device, tap the share button{" "}
              <span className="inline-block align-middle px-1">
                <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>{" "}
              and then select "Add to Home Screen".
            </p>
          </div>
        </div>
      )}
    </>
  );
}