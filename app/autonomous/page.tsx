"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Plane, Route, Network, ArrowRight, Battery, Weight, Radar, MapPinOff, Anchor } from "lucide-react";

export default function AutonomousPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Autonomous Logistics Extension</h1>
        <Badge tone="info" className="mt-2">
          Future multimodal autonomous logistics extension
        </Badge>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          A modest, forward-looking extension of the core QPSO route optimizer to coordinate
          ground and aerial autonomous fleets under a single planning layer. Not the focus of this
          prototype — the primary deliverable is road-based fleet route optimization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unified Fleet Planning — Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-stretch gap-3 text-sm">
            <DiagramBox icon={Network} title="Optimization Engine" subtitle="QPSO Core" />
            <Connector />
            <div className="flex flex-col gap-3">
              <DiagramBox icon={Truck} title="Ground Fleet" subtitle="Trucks / UGVs" />
              <DiagramBox icon={Plane} title="UAV Fleet" subtitle="Aerial drones" />
            </div>
            <Connector />
            <div className="flex flex-col gap-3">
              <DiagramBox icon={Route} title="Road Routes" subtitle="Graph shortest-path" />
              <DiagramBox icon={Radar} title="Air Routes" subtitle="Corridor-constrained" />
            </div>
            <Connector />
            <DiagramBox icon={Anchor} title="Unified Fleet Planning" subtitle="Merged dispatch schedule" highlight />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Example Route Strings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm font-mono">
            <div className="rounded-md bg-slate-800/60 p-3">
              <div className="text-[10px] uppercase text-slate-500 mb-1 font-sans">Truck route (TRK-01)</div>
              <div className="text-cyan-300">DEPOT → C19 → C20 → CK2 → C09 → C10 → DEPOT</div>
            </div>
            <div className="rounded-md bg-slate-800/60 p-3">
              <div className="text-[10px] uppercase text-slate-500 mb-1 font-sans">UAV route (UAV-01)</div>
              <div className="text-violet-300">HUB1 ⇢ C03 ⇢ C04 ⇢ HUB1 (direct air corridor, 11.2 km)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>UAV Operating Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <ConstraintRow icon={Battery} label="Battery reserve" desc="Minimum 20% reserve enforced on return leg" />
            <ConstraintRow icon={Weight} label="Payload limit" desc="Max 15 kg per sortie" />
            <ConstraintRow icon={Radar} label="Max range" desc="25 km round-trip from launch point" />
            <ConstraintRow icon={MapPinOff} label="No-fly zones" desc="Restricted airspace excluded from corridor graph" />
            <ConstraintRow icon={Anchor} label="Launch / recovery point" desc="Fixed to North Hub (HUB1)" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DiagramBox({
  icon: Icon,
  title,
  subtitle,
  highlight,
}: {
  icon: typeof Truck;
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-[140px] rounded-lg border p-3 flex flex-col items-center justify-center text-center gap-1.5 ${
        highlight ? "border-cyan-500/50 bg-cyan-500/10" : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <Icon className={`h-5 w-5 ${highlight ? "text-cyan-300" : "text-slate-400"}`} />
      <div className="text-xs font-medium text-slate-200">{title}</div>
      <div className="text-[10px] text-slate-500">{subtitle}</div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-slate-700 shrink-0">
      <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
    </div>
  );
}

function ConstraintRow({ icon: Icon, label, desc }: { icon: typeof Battery; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
      <div>
        <div className="text-slate-200 text-xs font-medium">{label}</div>
        <div className="text-slate-500 text-xs">{desc}</div>
      </div>
    </div>
  );
}
