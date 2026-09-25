"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Route,
  AlertTriangle,
  BarChart3,
  FlaskConical,
  Rocket,
  Play,
  Zap,
  Search,
} from "lucide-react";
import { useSimulation } from "@/contexts/simulation-context";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  group: "Navigate" | "Actions";
  icon: typeof LayoutDashboard;
  keywords?: string;
  run: () => void;
}

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} setOpen={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { runOptimization, startDemo } = useSimulation();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, [setOpen]);

  const commands = useMemo<Command[]>(
    () => [
      { id: "nav-overview", label: "Go to Overview", group: "Navigate", icon: LayoutDashboard, run: () => router.push("/") },
      { id: "nav-fleet", label: "Go to Fleet", group: "Navigate", icon: Truck, run: () => router.push("/fleet") },
      { id: "nav-optimize", label: "Go to Route Optimization", group: "Navigate", icon: Route, run: () => router.push("/optimize") },
      { id: "nav-traffic", label: "Go to Traffic Simulation", group: "Navigate", icon: AlertTriangle, run: () => router.push("/traffic") },
      { id: "nav-benchmarks", label: "Go to Benchmarks", group: "Navigate", icon: BarChart3, run: () => router.push("/benchmarks") },
      { id: "nav-experiments", label: "Go to Experiments", group: "Navigate", icon: FlaskConical, run: () => router.push("/experiments") },
      { id: "nav-autonomous", label: "Go to Autonomous Logistics", group: "Navigate", icon: Rocket, run: () => router.push("/autonomous") },
      {
        id: "action-optimize",
        label: "Run QPSO Optimization",
        group: "Actions",
        icon: Zap,
        keywords: "qpso optimize route",
        run: () => {
          router.push("/optimize");
          runOptimization("clean");
        },
      },
      {
        id: "action-demo",
        label: "Start Demo Mode",
        group: "Actions",
        icon: Play,
        keywords: "demo simulate",
        run: () => {
          router.push("/");
          startDemo();
        },
      },
    ],
    [router, runOptimization, startDemo]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  // Global Cmd/Ctrl+K + Escape listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    // reset and focus after mount
    const t = setTimeout(() => {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }, 10);
    return () => clearTimeout(t);
  }, [open]);

  const runAt = useCallback(
    (index: number) => {
      const cmd = filtered[index];
      if (!cmd) return;
      close();
      cmd.run();
    },
    [filtered, close]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // simple focus trap: keep focus in the input
      e.preventDefault();
    }
  }

  if (!open) return null;

  let lastGroup: string | null = null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
      onClick={close}
      role="presentation"
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-slate-800">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to a page or run an action..."
            className="w-full bg-transparent py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            aria-label="Command search"
          />
          <kbd className="hidden sm:inline text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">No matching commands.</div>
          )}
          {filtered.map((cmd, index) => {
            const showGroupHeader = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            const Icon = cmd.icon;
            return (
              <React.Fragment key={cmd.id}>
                {showGroupHeader && (
                  <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wide text-slate-600">
                    {cmd.group}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => runAt(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors",
                    index === activeIndex
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-800/60"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {cmd.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
