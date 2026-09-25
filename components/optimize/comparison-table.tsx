"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { TrendingDown } from "lucide-react";

export function ComparisonTable() {
  const { optimization } = useSimulation();
  const { result, baseline } = optimization;
  if (!result || !baseline) return null;

  const rows = [
    { label: "Travel Time", unit: " min", a: baseline.travelTime, b: result.travelTime, decimals: 0 },
    { label: "Distance", unit: " km", a: baseline.distance, b: result.distance, decimals: 1 },
    { label: "Cost", unit: "", prefix: "₹", a: baseline.cost, b: result.cost, decimals: 0 },
    { label: "Congestion Index", unit: "", a: baseline.congestion, b: result.congestion, decimals: 0 },
    { label: "Fitness Score", unit: "", a: baseline.fitness, b: result.fitness, decimals: 1 },
  ];

  const overallImprovement = Number(
    (((baseline.travelTime - result.travelTime) / baseline.travelTime) * 100).toFixed(1)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Before / After Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <THead>
            <tr>
              <TH>Metric</TH>
              <TH>Baseline (Dijkstra)</TH>
              <TH>QPSO Optimized</TH>
              <TH>Improvement</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((r) => {
              const improvement = Number((((r.a - r.b) / r.a) * 100).toFixed(1));
              return (
                <TR key={r.label}>
                  <TD className="text-slate-300 font-medium">{r.label}</TD>
                  <TD className="font-mono text-slate-500">
                    {r.prefix ?? ""}
                    {r.a.toLocaleString("en-IN")}
                    {r.unit}
                  </TD>
                  <TD className="font-mono text-slate-100">
                    {r.prefix ?? ""}
                    <AnimatedNumber value={r.b} decimals={r.decimals} />
                    {r.unit}
                  </TD>
                  <TD>
                    <span className={improvement >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {improvement >= 0 ? "-" : "+"}
                      {Math.abs(improvement)}%
                    </span>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>

        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">
            QPSO reduced travel time by <strong>{overallImprovement}%</strong>, cutting fleet
            distance and operating cost while lowering network congestion — computed in{" "}
            {result.runtime.toLocaleString()} ms across {result.iterations} iterations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
