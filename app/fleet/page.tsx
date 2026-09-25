"use client";

import { useState } from "react";
import { useSimulation } from "@/contexts/simulation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { Vehicle } from "@/lib/simulation/types";
import { Truck, Plane, Bot, Battery, Gauge, MapPin, X } from "lucide-react";

const TYPE_ICON: Record<Vehicle["type"], typeof Truck> = {
  truck: Truck,
  uav: Plane,
  ugv: Bot,
};

const STATUS_TONE: Record<Vehicle["status"], "success" | "warning" | "danger" | "neutral" | "info"> = {
  active: "success",
  idle: "neutral",
  charging: "info",
  returning: "warning",
  affected: "danger",
};

export default function FleetPage() {
  const { vehicles, deliveries } = useSimulation();
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const trucks = vehicles.filter((v) => v.type === "truck");
  const others = vehicles.filter((v) => v.type !== "truck");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Fleet Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          {vehicles.length} vehicles · {deliveries.length} scheduled deliveries across the network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...trucks, ...others].map((v) => {
          const Icon = TYPE_ICON[v.type];
          return (
            <Card
              key={v.id}
              className="p-4 cursor-pointer hover:border-cyan-600/50 transition-colors"
              onClick={() => setSelected(v)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-md bg-slate-800 flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-100">{v.label}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{v.id}</div>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> {v.currentNode}
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3 w-3" /> {v.speedKmh} km/h
                </div>
                {v.capacity !== undefined && (
                  <div className="col-span-2 text-slate-500">
                    Capacity: <span className="text-slate-300">{v.capacity} kg</span>
                  </div>
                )}
                {v.battery !== undefined && (
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Battery className="h-3 w-3" />
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${v.battery}%` }}
                      />
                    </div>
                    <span className="text-slate-300">{v.battery}%</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-[11px] text-slate-600">ETA {v.eta} min</div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Manifest</CardTitle>
        </CardHeader>
        <CardContent className="sm:p-4 p-0">
          {/* Mobile: stacked card list */}
          <div className="sm:hidden divide-y divide-slate-800/60">
            {deliveries.slice(0, 15).map((d) => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-mono text-slate-200">{d.id}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {d.nodeId} · {d.demand} kg · {d.delivered ? "Delivered" : "Pending"}
                  </div>
                </div>
                <Badge tone={d.priority === "high" ? "danger" : d.priority === "medium" ? "warning" : "neutral"}>
                  {d.priority}
                </Badge>
              </div>
            ))}
          </div>
          {/* Tablet/desktop: table */}
          <div className="hidden sm:block">
            <Table>
              <THead>
                <tr>
                  <TH>ID</TH>
                  <TH>Node</TH>
                  <TH>Demand (kg)</TH>
                  <TH>Priority</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <tbody>
                {deliveries.slice(0, 15).map((d) => (
                  <TR key={d.id}>
                    <TD className="font-mono">{d.id}</TD>
                    <TD>{d.nodeId}</TD>
                    <TD>{d.demand}</TD>
                    <TD>
                      <Badge
                        tone={d.priority === "high" ? "danger" : d.priority === "medium" ? "warning" : "neutral"}
                      >
                        {d.priority}
                      </Badge>
                    </TD>
                    <TD>{d.delivered ? "Delivered" : "Pending"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="text-[11px] text-slate-600 px-4 sm:px-3 py-2">
            Showing 15 of {deliveries.length} deliveries.
          </div>
        </CardContent>
      </Card>

      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-t-lg sm:rounded-lg w-full sm:max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-100">{selected.label}</h2>
                <p className="text-xs text-slate-500 font-mono">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-300 h-9 w-9 -m-2 flex items-center justify-center rounded-md hover:bg-slate-800/60"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Type" value={selected.type.toUpperCase()} />
              <Detail label="Status" value={selected.status} />
              <Detail label="Current Node" value={selected.currentNode} />
              <Detail label="Speed" value={`${selected.speedKmh} km/h`} />
              <Detail label="ETA" value={`${selected.eta} min`} />
              {selected.capacity !== undefined && <Detail label="Capacity" value={`${selected.capacity} kg`} />}
              {selected.battery !== undefined && <Detail label="Battery" value={`${selected.battery}%`} />}
              {selected.range !== undefined && <Detail label="Range" value={`${selected.range} km`} />}
              {selected.driver && <Detail label="Driver" value={selected.driver} />}
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-500">
              {selected.type === "uav"
                ? "UAV constraints: battery reserve, payload limit, no-fly zones enforced by the optimizer."
                : selected.type === "ugv"
                ? "UGV constraints: sidewalk-accessible routing, payload and battery range."
                : "Truck constraints: road-legal routing only, capacity and time windows."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-200 capitalize">{value}</div>
    </div>
  );
}
