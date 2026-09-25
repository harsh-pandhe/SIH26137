"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface NavDrawerContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);

export function useNavDrawer() {
  const ctx = useContext(NavDrawerContext);
  if (!ctx) throw new Error("useNavDrawer must be used within AppShell");
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <NavDrawerContext.Provider value={{ open, toggle, close }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-3 sm:p-5">{children}</main>
        </div>
      </div>
    </NavDrawerContext.Provider>
  );
}
