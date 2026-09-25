"use client";

import { useSimulation } from "@/contexts/simulation-context";
import { NetworkMap } from "@/components/map/network-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Construction, CarFront, RotateCcw, Zap } from "lucide-react";

export default function TrafficPage() {
  const {
    edges,
    activeIncident,
    congestionIndex,
    degradationAlert,
    injectIncident,
    restoreTraffic,
    reoptimizeFleet,
    optimization,
  } = useSimulation();

  const closedCount = edges.filter((e) => e.status === "closed").length;
  const congestedCount = edges.filter((e) => e.status === "congested" || e.status === "incident").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Traffic Simulation Control</h1>
        <p className="text-sm text-slate-500 mt-1">
          Inject synthetic traffic events and observe live route degradation and fleet re-optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Network State</CardTitle>
            <Badge tone={activeIncident ? "danger" : congestionIndex > 45 ? "warning" : "success"}>
              {activeIncident ? "Incident Active" : congestionIndex > 45 ? "Elevated" : "Nominal"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-3">
            <NetworkMap height={500} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inject Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => injectIncident("congestion")}>
                <CarFront className="h-4 w-4 text-amber-400" /> Inject Congestion
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => injectIncident("accident")}>
                <AlertTriangle className="h-4 w-4 text-red-400" /> Inject Accident
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => injectIncident("closure")}>
                <Construction className="h-4 w-4 text-red-400" /> Inject Road Closure
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={restoreTraffic}>
                <RotateCcw className="h-4 w-4" /> Restore Network
              </Button>
            </CardContent>
          </Card>

          <Card className="p-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xl font-mono text-slate-100">{congestedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase">Congested Links</div>
              </div>
              <div>
                <div className="text-xl font-mono text-slate-100">{closedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase">Closed Links</div>
              </div>
            </div>
          </Card>

          {activeIncident && (
            <Card>
              <CardHeader>
                <CardTitle>Incident Detail</CardTitle>
                <Badge
                  tone={
                    activeIncident.severity === "critical" || activeIncident.severity === "major"
                      ? "danger"
                      : "warning"
                  }
                >
                  {activeIncident.severity}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-slate-300">{activeIncident.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-slate-500 uppercase text-[10px]">Location</div>
                    <div className="text-slate-200">{activeIncident.location}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase text-[10px]">Type</div>
                    <div className="text-slate-200 capitalize">{activeIncident.type}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase text-[10px]">Travel time before</div>
                    <div className="text-slate-200">{activeIncident.travelTimeBefore} min</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase text-[10px]">Travel time after</div>
                    <div className="text-red-400 font-medium">{activeIncident.travelTimeAfter} min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {degradationAlert && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                  <Zap className="h-4 w-4" /> Route degradation detected
                </div>
                <p className="text-xs text-amber-200/80">{degradationAlert.message}</p>
                <div className="text-xs text-slate-400">
                  Affected vehicles: <span className="text-amber-300 font-mono">{degradationAlert.affectedVehicles}</span>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={optimization.phase === "running"}
                  onClick={reoptimizeFleet}
                >
                  RE-OPTIMIZE FLEET
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
