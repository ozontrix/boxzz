"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { AppProvider } from "@/store";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <Header />
      <main className="flex-1 pt-[60px] lg:pt-[134px] pb-[76px] lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomTabBar />
    </AppProvider>
  );
}