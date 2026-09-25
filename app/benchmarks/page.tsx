"use client";

import { useMemo, useState } from "react";
import {
  computeAlgorithmResults,
  computeConvergenceSeries,
  generateScalabilityData,
  ALGORITHM_PROFILES,
} from "@/lib/simulation/benchmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BenchmarksPage() {
  const results = useMemo(() => computeAlgorithmResults(), []);
  const convergence = useMemo(() => computeConvergenceSeries(), []);

  const chartData = results.map((r) => ({
    ...r,
    color: ALGORITHM_PROFILES.find((p) => p.algorithm === r.algorithm)?.color,
  }));

  // merge convergence series by iteration for a single multi-line chart
  const mergedConvergence = useMemo(() => {
    const points: Record<number, Record<string, number>> = {};
    for (const [algo, series] of Object.entries(convergence)) {
      for (const p of series) {
        points[p.iteration] = points[p.iteration] || { iteration: p.iteration };
        points[p.iteration][algo] = p.bestFitness;
      }
    }
    return Object.values(points).sort((a, b) => (a.iteration as number) - (b.iteration as number));
  }, [convergence]);

  const [nodes, setNodes] = useState(24);
  const [vehiclesN, setVehiclesN] = useState(8);
  const [deliveriesN, setDeliveriesN] = useState(42);
  const [scalabilityData, setScalabilityData] = useState(() =>
    generateScalabilityData(nodes, vehiclesN, deliveriesN)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Algorithm Benchmarks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Comparative performance of Dijkstra, A*, GA, PSO and QPSO on the fleet routing scenario.
        </p>
        <Badge tone="warning" className="mt-2">
          Simulated / illustrative prototype data — not measured experimental results
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Table</CardTitle>
        </CardHeader>
        <CardContent className="sm:p-4 p-0">
          {/* Mobile: stacked card list */}
          <div className="sm:hidden divide-y divide-slate-800/60">
            {results.map((r) => (
              <div key={r.algorithm} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">{r.algorithm}</span>
                  {r.algorithm === "QPSO" && <Badge tone="success">Best Fitness</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <Stat label="Distance" value={`${r.distance} km`} />
                  <Stat label="Travel Time" value={`${r.travelTime} min`} />
                  <Stat label="Cost" value={`₹${r.cost.toLocaleString("en-IN")}`} />
                  <Stat label="Runtime" value={`${r.runtime.toLocaleString()} ms`} />
                  <Stat
                    label="Fitness"
                    value={String(r.fitness)}
                    emphasize={r.algorithm === "QPSO"}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Tablet/desktop: table */}
          <div className="hidden sm:block">
            <Table>
              <THead>
                <tr>
                  <TH>Algorithm</TH>
                  <TH>Distance (km)</TH>
                  <TH>Travel Time (min)</TH>
                  <TH>Cost (₹)</TH>
                  <TH>Runtime (ms)</TH>
                  <TH>Fitness</TH>
                </tr>
              </THead>
              <tbody>
                {results.map((r) => (
                  <TR key={r.algorithm}>
                    <TD className="font-medium text-slate-200">{r.algorithm}</TD>
                    <TD className="font-mono">{r.distance}</TD>
                    <TD className="font-mono">{r.travelTime}</TD>
                    <TD className="font-mono">{r.cost.toLocaleString("en-IN")}</TD>
                    <TD className="font-mono">{r.runtime.toLocaleString()}</TD>
                    <TD className="font-mono">
                      {r.algorithm === "QPSO" ? (
                        <span className="text-emerald-400 font-semibold">{r.fitness}</span>
                      ) : (
                        r.fitness
                      )}
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Travel Time Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonBarChart data={chartData} dataKey="travelTime" unit=" min" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runtime Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonBarChart data={chartData} dataKey="runtime" unit=" ms" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convergence Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mergedConvergence} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="iteration" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} width={40} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {ALGORITHM_PROFILES.map((p) => (
                <Line
                  key={p.algorithm}
                  type="monotone"
                  dataKey={p.algorithm}
                  stroke={p.color}
                  strokeWidth={p.algorithm === "QPSO" ? 3 : 1.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scalability Experiment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <NumberField label="Nodes" value={nodes} onChange={setNodes} min={8} max={60} />
            <NumberField label="Vehicles" value={vehiclesN} onChange={setVehiclesN} min={2} max={30} />
            <NumberField label="Deliveries" value={deliveriesN} onChange={setDeliveriesN} min={5} max={100} />
            <Button
              variant="primary"
              onClick={() => setScalabilityData(generateScalabilityData(nodes, vehiclesN, deliveriesN))}
            >
              Run Experiment
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scalabilityData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="problemSize" stroke="#64748b" fontSize={11} label={{ value: "Problem Size (nodes × vehicles)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }} />
              <YAxis stroke="#64748b" fontSize={11} width={40} label={{ value: "Runtime (ms)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {ALGORITHM_PROFILES.map((p) => (
                <Line
                  key={p.algorithm}
                  type="monotone"
                  dataKey={(d: { runtime: Record<string, number> }) => d.runtime[p.algorithm]}
                  name={p.algorithm}
                  stroke={p.color}
                  strokeWidth={p.algorithm === "QPSO" ? 3 : 1.5}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn("font-mono", emphasize ? "text-emerald-400 font-semibold" : "text-slate-300")}>
        {value}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-sm text-slate-200 font-mono"
      />
    </div>
  );
}
