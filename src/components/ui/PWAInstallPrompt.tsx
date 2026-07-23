"use client";

import { X } from "lucide-react";
import { usePWA } from "./PWAProvider";

export function PWAInstallPrompt() {
  const {
    showAutoPrompt,
    dismissAutoPrompt,
    showIosPrompt,
    dismissIosPrompt,
    handleInstall,
    isIos,
  } = usePWA();

  return (
    <>
      {/* Android/Chrome auto-prompt - only shows on home page once */}
      {showAutoPrompt && (
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
                onClick={dismissAutoPrompt}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari prompt - only shows on home page once */}
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
                onClick={dismissIosPrompt}
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