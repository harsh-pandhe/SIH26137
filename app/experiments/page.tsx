"use client";

import { useMemo, useState } from "react";
import { generateExperimentHistory } from "@/lib/simulation/experiments";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ConvergenceChart } from "@/components/charts/convergence-chart";
import { Badge } from "@/components/ui/badge";
import { ExperimentRecord } from "@/lib/simulation/types";
import { X } from "lucide-react";

export default function ExperimentsPage() {
  const experiments = useMemo(() => generateExperimentHistory(10), []);
  const [selected, setSelected] = useState<ExperimentRecord | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Experiment History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Logged QPSO optimization runs. Click a row to inspect its configuration and convergence.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <tr>
                <TH>Run ID</TH>
                <TH>Algorithm</TH>
                <TH>Population</TH>
                <TH>Iterations</TH>
                <TH>Fitness</TH>
                <TH>Timestamp</TH>
              </tr>
            </THead>
            <tbody>
              {experiments.map((e) => (
                <TR key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>
                  <TD className="font-mono text-cyan-400">{e.id}</TD>
                  <TD>{e.algorithm}</TD>
                  <TD className="font-mono">{e.population}</TD>
                  <TD className="font-mono">{e.iterations}</TD>
                  <TD className="font-mono">{e.fitness}</TD>
                  <TD className="text-slate-500">{e.timestamp}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-100">{selected.id}</h2>
                <p className="text-xs text-slate-500">{selected.timestamp} · seed {selected.seed}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-300 h-9 w-9 -m-2 flex items-center justify-center rounded-md hover:bg-slate-800/60"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase text-slate-500 mb-1">Configuration</div>
                <div className="space-y-1 text-slate-300">
                  <div>Population: <span className="font-mono">{selected.population}</span></div>
                  <div>Iterations: <span className="font-mono">{selected.iterations}</span></div>
                  <div>Runtime: <span className="font-mono">{selected.result.runtime} ms</span></div>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 mb-1">Objective Weights</div>
                <div className="space-y-1 text-slate-300">
                  {Object.entries(selected.weights).map(([k, v]) => (
                    <div key={k}>
                      {k}: <span className="font-mono">{v}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-500 mb-1.5">Constraints</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(selected.constraints).map(([k, v]) => (
                  <Badge key={k} tone={v ? "success" : "neutral"}>
                    {k}: {v ? "on" : "off"}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-500 mb-1.5">Result</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <ResultStat label="Travel Time" value={`${selected.result.travelTime} min`} />
                <ResultStat label="Distance" value={`${selected.result.distance} km`} />
                <ResultStat label="Cost" value={`₹${selected.result.cost}`} />
                <ResultStat label="Fitness" value={String(selected.result.fitness)} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-500 mb-1.5">Convergence Curve</div>
              <ConvergenceChart data={selected.convergence} height={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-800/60 p-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="font-mono text-slate-200">{value}</div>
    </div>
  );
}
