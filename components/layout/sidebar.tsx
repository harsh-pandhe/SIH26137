"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Route,
  AlertTriangle,
  BarChart3,
  FlaskConical,
  Rocket,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/fleet", label: "Fleet", icon: Truck },
  { href: "/optimize", label: "Route Optimization", icon: Route },
  { href: "/traffic", label: "Traffic Simulation", icon: AlertTriangle },
  { href: "/benchmarks", label: "Benchmarks", icon: BarChart3 },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/autonomous", label: "Autonomous Logistics", icon: Rocket },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-950/80 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-800">
        <Radio className="h-5 w-5 text-cyan-400" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-100">FleetOps</div>
          <div className="text-[10px] text-slate-500 tracking-wide">SIH26137 · Egreen Quanta</div>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-600 leading-relaxed">
        Quantum-Inspired Intelligent Traffic Route Optimization — prototype simulation.
        No live data / external APIs.
      </div>
    </aside>
  );
}
