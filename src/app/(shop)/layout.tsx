"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { PWAProvider } from "@/components/ui/PWAProvider";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import { AppProvider } from "@/store";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <PWAProvider>
        <ServiceWorkerRegistration />
        <Header />
        <main className="flex-1 pt-[60px] lg:pt-[134px] pb-[76px] lg:pb-0">
          {children}
        </main>
        <Footer />
        <BottomTabBar />
        <PWAInstallPrompt />
      </PWAProvider>
    </AppProvider>
  );
}
