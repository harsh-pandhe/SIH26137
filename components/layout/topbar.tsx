"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Activity } from "lucide-react";

export function Topbar() {
  const { demo, startDemo, pauseDemo, restartDemo, congestionIndex, activeIncident } =
    useSimulation();

  const networkTone = activeIncident ? "danger" : congestionIndex > 45 ? "warning" : "success";
  const networkLabel = activeIncident
    ? `Incident: ${activeIncident.type.toUpperCase()}`
    : congestionIndex > 45
    ? "Elevated congestion"
    : "Network nominal";

  return (
    <header className="h-14 shrink-0 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <Badge tone={networkTone as "danger" | "warning" | "success"}>
          <Activity className="h-3 w-3" /> {networkLabel}
        </Badge>
        <span className="text-xs text-slate-500">
          Congestion Index: <span className="font-mono text-slate-300">{congestionIndex}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-slate-500 mr-1">Demo Mode</span>
        {!demo.active ? (
          <Button size="sm" variant="primary" onClick={startDemo}>
            <Play className="h-3.5 w-3.5" /> Start Demo
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pauseDemo}>
            <Pause className="h-3.5 w-3.5" /> {demo.paused ? "Resume" : "Pause"}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={restartDemo}>
          <RotateCcw className="h-3.5 w-3.5" /> Restart
        </Button>
        {demo.active && (
          <span className="text-[11px] text-cyan-300 font-mono ml-1">
            Step {demo.stepIndex + 1}/{demo.steps.length}
          </span>
        )}
      </div>
    </header>
  );
}
