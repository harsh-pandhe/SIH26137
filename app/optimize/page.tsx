"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { NetworkMap } from "@/components/map/network-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizationPanel } from "@/components/optimize/optimization-panel";
import { OptimizationLog } from "@/components/optimize/optimization-log";
import { ComparisonTable } from "@/components/optimize/comparison-table";
import { ConvergenceChart } from "@/components/charts/convergence-chart";
import { Badge } from "@/components/ui/badge";
import { Clock, Repeat, Timer, Target } from "lucide-react";

export default function OptimizePage() {
  const { optimization } = useSimulation();
  const { result, phase, convergence } = optimization;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Route Optimization Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulated road network with QPSO-driven multi-vehicle route optimization.
          </p>
        </div>
        <Badge tone={phase === "complete" ? "success" : phase === "running" ? "info" : "neutral"}>
          Status: {phase === "idle" ? "Ready" : phase === "running" ? "Optimizing" : "Optimized"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulated Road Network</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <NetworkMap height={520} />
            </CardContent>
          </Card>

          <OptimizationLog />

          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Target} label="Status" value="Converged" />
              <StatCard icon={Repeat} label="Iterations" value={String(result.iterations)} />
              <StatCard icon={Timer} label="Runtime" value={`${result.runtime.toLocaleString()} ms`} />
              <StatCard icon={Clock} label="Best Fitness" value={result.fitness.toFixed(1)} />
            </div>
          )}

          {convergence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>QPSO Convergence</CardTitle>
              </CardHeader>
              <CardContent>
                <ConvergenceChart data={convergence} />
              </CardContent>
            </Card>
          )}

          {result && <ComparisonTable />}
        </div>

        <div className="space-y-4">
          <OptimizationPanel />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <Card className="p-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-md bg-slate-800 flex items-center justify-center">
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-sm font-mono text-slate-100">{value}</div>
      </div>
    </Card>
  );
}
