"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export function OptimizationLog() {
  const { optimization } = useSimulation();
  if (optimization.phase === "idle") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5" /> Optimization Log
        </CardTitle>
        <span className="text-xs font-mono text-slate-400">{optimization.progress}%</span>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-300"
            style={{ width: `${optimization.progress}%` }}
          />
        </div>
        <div className="font-mono text-xs text-slate-400 space-y-1 max-h-36 overflow-y-auto">
          {optimization.logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-600">[{String(i + 1).padStart(2, "0")}]</span>
              <span className={log.includes("complete") ? "text-emerald-400" : ""}>{log}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
