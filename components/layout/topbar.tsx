"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Activity, Menu, Radio } from "lucide-react";
import { useNavDrawer } from "@/components/layout/app-shell";

export function Topbar() {
  const { demo, startDemo, pauseDemo, restartDemo, congestionIndex, activeIncident } =
    useSimulation();
  const { toggle } = useNavDrawer();

  const networkTone = activeIncident ? "danger" : congestionIndex > 45 ? "warning" : "success";
  const networkLabel = activeIncident
    ? `Incident: ${activeIncident.type.toUpperCase()}`
    : congestionIndex > 45
    ? "Elevated congestion"
    : "Network nominal";

  return (
    <header className="h-14 shrink-0 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between px-3 sm:px-4 gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <Radio className="h-4.5 w-4.5 text-cyan-400" />
        </div>
        <Badge tone={networkTone as "danger" | "warning" | "success"} className="hidden sm:inline-flex">
          <Activity className="h-3 w-3" /> {networkLabel}
        </Badge>
        <Badge tone={networkTone as "danger" | "warning" | "success"} className="sm:hidden">
          <Activity className="h-3 w-3" />
        </Badge>
        <span className="hidden md:inline text-xs text-slate-500">
          Congestion Index: <span className="font-mono text-slate-300">{congestionIndex}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="hidden md:inline text-[11px] uppercase tracking-wide text-slate-500 mr-1">
          Demo Mode
        </span>
        {!demo.active ? (
          <Button size="sm" variant="primary" onClick={startDemo}>
            <Play className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Start Demo</span>
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pauseDemo}>
            <Pause className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{demo.paused ? "Resume" : "Pause"}</span>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={restartDemo} aria-label="Restart demo">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        {demo.active && (
          <span className="hidden sm:inline text-[11px] text-cyan-300 font-mono ml-1">
            Step {demo.stepIndex + 1}/{demo.steps.length}
          </span>
        )}
      </div>
    </header>
  );
}
