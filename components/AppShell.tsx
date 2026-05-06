"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import MethodologyBadge from "@/components/MethodologyBadge";
import LoadingScreen from "@/components/LoadingScreen";
import EasterEgg from "@/components/EasterEgg";

const CLOSED_W = 64;
const OPEN_W   = 232;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("sidebar-open") === "true") setSidebarOpen(true);
    } catch { /* no-op */ }
  }, []);

  function toggleSidebar() {
    setSidebarOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebar-open", String(next)); } catch { /* no-op */ }
      return next;
    });
  }

  return (
    <>
      <LoadingScreen />
      <EasterEgg />
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content — shifts right to make room for sidebar on desktop */}
      <div
        className="transition-[margin] duration-300"
        style={{ marginLeft: 0 }}
        // Override with desktop-specific margin via a style tag to avoid
        // Tailwind purging the dynamic class
      >
        <style>{`
          @media (min-width: 1024px) {
            .nucarbon-content { margin-left: ${sidebarOpen ? OPEN_W : CLOSED_W}px !important; }
          }
        `}</style>
        <div className="nucarbon-content transition-[margin] duration-300">
          <Nav />
          <main className="min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <MethodologyBadge />
        </div>
      </div>
    </>
  );
}
