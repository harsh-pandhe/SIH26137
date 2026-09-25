"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSimulation } from "@/contexts/simulation-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { NetworkMap } from "@/components/map/network-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Package,
  Clock,
  Route as RouteIcon,
  Wallet,
  Gauge,
  Network,
  Waypoints,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Boxes,
} from "lucide-react";

const FEATURES = [
  { icon: Network, label: "Graph-Based Modeling" },
  { icon: Waypoints, label: "Dynamic Traffic" },
  { icon: Sparkles, label: "QPSO Optimization" },
  { icon: ShieldCheck, label: "Constraint Handling" },
  { icon: BarChart3, label: "Benchmarking" },
  { icon: Boxes, label: "Scalability" },
];

export default function OverviewPage() {
  const { vehicles, deliveries, optimization, congestionIndex, runOptimization } =
    useSimulation();

  const activeVehicles = vehicles.filter((v) => v.status !== "charging").length;
  const deliveredCount = deliveries.filter((d) => d.delivered).length;

  const kpis = useMemo(() => {
    const result = optimization.result;
    const baseline = optimization.baseline;
    if (result && baseline) {
      const timeDelta = Number((((result.travelTime - baseline.travelTime) / baseline.travelTime) * 100).toFixed(1));
      const distDelta = Number((((result.distance - baseline.distance) / baseline.distance) * 100).toFixed(1));
      const costDelta = Number((((result.cost - baseline.cost) / baseline.cost) * 100).toFixed(1));
      return {
        travelTime: `${result.travelTime} min`,
        travelDelta: timeDelta,
        distance: `${result.distance} km`,
        distDelta,
        cost: `₹${result.cost.toLocaleString("en-IN")}`,
        costDelta,
        status: "Optimized",
      };
    }
    return {
      travelTime: "142 min",
      travelDelta: undefined,
      distance: "84.2 km",
      distDelta: undefined,
      cost: "₹2,840",
      costDelta: undefined,
      status: "Baseline",
    };
  }, [optimization]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Fleet Operations Overview</h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">
            SIH26137 — Quantum-Inspired Intelligent Traffic Route Optimization in Transportation
            Systems Using Metaheuristic Optimization. A simulated autonomous fleet command center
            demonstrating graph-based network modeling, dynamic traffic response and QPSO-driven
            route optimization.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/optimize">
            <Button variant="secondary">Evaluate Scenario</Button>
          </Link>
          <Button variant="primary" onClick={() => runOptimization("clean")}>
            Run QPSO
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-400"
          >
            <f.icon className="h-3.5 w-3.5 text-cyan-400" />
            {f.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Active Vehicles" value={`${activeVehicles}/${vehicles.length}`} icon={<Truck className="h-4 w-4" />} sublabel="8-vehicle mixed fleet" />
        <KpiCard label="Deliveries" value={`${deliveredCount}/${deliveries.length}`} icon={<Package className="h-4 w-4" />} sublabel="42 scheduled stops" />
        <KpiCard
          label="Travel Time"
          value={kpis.travelTime}
          delta={kpis.travelDelta}
          deltaGoodDirection="down"
          icon={<Clock className="h-4 w-4" />}
        />
        <KpiCard
          label="Total Distance"
          value={kpis.distance}
          delta={kpis.distDelta}
          deltaGoodDirection="down"
          icon={<RouteIcon className="h-4 w-4" />}
        />
        <KpiCard
          label="Fleet Cost"
          value={kpis.cost}
          delta={kpis.costDelta}
          deltaGoodDirection="down"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="Optimization"
          value={kpis.status}
          icon={<Gauge className="h-4 w-4" />}
          sublabel={`Congestion idx ${congestionIndex}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Road Network — Live Preview</CardTitle>
            <Link href="/optimize" className="text-xs text-cyan-400 hover:underline">
              Open Command Center →
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <NetworkMap height={380} compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-slate-400">
              This prototype demonstrates a QPSO-based (Quantum-behaved Particle Swarm
              Optimization) route optimization engine operating on a simulated road network with
              dynamic traffic events, evaluated against classical and metaheuristic baselines.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">Problem Statement 26137</Badge>
              <Badge tone="neutral">Egreen Quanta</Badge>
              <Badge tone="success">Prototype</Badge>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-500 space-y-1.5">
              <div>Judge demo scenario: 42 deliveries · 8 vehicles</div>
              <div>Baseline → 142 min / 84.2 km / ₹2,840</div>
              <div>QPSO → 108 min / 71.4 km / ₹2,210</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
