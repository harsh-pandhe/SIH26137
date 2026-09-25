"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { ConstraintFlags } from "@/lib/simulation/types";

const CONSTRAINT_LABELS: { key: keyof ConstraintFlags; label: string }[] = [
  { key: "vehicleCapacity", label: "Vehicle capacity limits" },
  { key: "timeWindows", label: "Delivery time windows" },
  { key: "noFlyZones", label: "UAV no-fly zones" },
  { key: "batteryRange", label: "UAV/UGV battery range" },
  { key: "roadClosures", label: "Respect road closures" },
];

const WEIGHT_COLORS: Record<string, string> = {
  travelTime: "#22d3ee",
  distance: "#a78bfa",
  cost: "#f59e0b",
  congestion: "#f87171",
};

export function OptimizationPanel() {
  const {
    population,
    setPopulation,
    iterations,
    setIterations,
    weights,
    setWeights,
    constraints,
    setConstraints,
    optimization,
    runOptimization,
  } = useSimulation();

  const weightSum = weights.travelTime + weights.distance + weights.cost + weights.congestion;
  const isRunning = optimization.phase === "running";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Engine — QPSO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">Algorithm</span>
          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300 font-medium">
            Quantum-behaved Particle Swarm Optimization
          </div>
        </div>

        <Slider label="Population Size" value={population} min={20} max={200} step={10} onChange={setPopulation} />
        <Slider label="Max Iterations" value={iterations} min={50} max={300} step={10} onChange={setIterations} />

        <div className="space-y-2.5">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Objective Weights ({weightSum}%)
          </span>
          {(Object.keys(weights) as (keyof typeof weights)[]).map((k) => (
            <Slider
              key={k}
              label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
              value={weights[k]}
              min={0}
              max={100}
              onChange={(v) => setWeights({ ...weights, [k]: v })}
              color={WEIGHT_COLORS[k]}
            />
          ))}
          <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800">
            {(Object.keys(weights) as (keyof typeof weights)[]).map((k) => (
              <div
                key={k}
                style={{
                  width: `${(weights[k] / (weightSum || 1)) * 100}%`,
                  backgroundColor: WEIGHT_COLORS[k],
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">Constraints</span>
          {CONSTRAINT_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={constraints[key]}
                onChange={() => setConstraints({ ...constraints, [key]: !constraints[key] })}
                className="accent-cyan-400"
              />
              {label}
            </label>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isRunning}
          onClick={() => runOptimization("clean")}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Running Optimization...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Run Optimization
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
