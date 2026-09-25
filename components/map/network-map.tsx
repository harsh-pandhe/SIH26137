"use client";

import React, { useMemo, useState } from "react";
import { NETWORK_NODES } from "@/lib/simulation/routes";
import { useSimulation } from "@/contexts/simulation-context";
import { getNode, pathToPoints, shortestPath } from "@/lib/simulation/routes";
import { ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkMapProps {
  height?: number;
  showControls?: boolean;
  compact?: boolean;
}

const KIND_COLOR: Record<string, string> = {
  depot: "#22d3ee",
  hub: "#a78bfa",
  delivery: "#64748b",
  checkpoint: "#475569",
};

export function NetworkMap({ height = 560, showControls = true, compact = false }: NetworkMapProps) {
  const { edges, activeIncident, optimization, vehicles } = useSimulation();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ x: number; y: number } | null>(null);
  const [layers, setLayers] = useState({ traffic: true, routes: true, congestion: true });
  const [hovered, setHovered] = useState<string | null>(null);

  const activeRoutePath = useMemo(() => {
    if (optimization.phase !== "complete") return [];
    // Demonstrate an optimized multi-stop tour depot -> a few delivery nodes -> depot
    const stops = ["DEPOT", "C19", "C20", "CK2", "C09", "C10", "DEPOT"];
    const full: string[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const seg = shortestPath(edges, stops[i], stops[i + 1]);
      full.push(...(i === 0 ? seg : seg.slice(1)));
    }
    return full;
  }, [optimization.phase, edges]);

  const routePoints = pathToPoints(activeRoutePath);
  const routeD = routePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  function edgeColor(status: string) {
    switch (status) {
      case "closed":
        return "#ef4444";
      case "incident":
        return "#ef4444";
      case "congested":
        return "#f59e0b";
      default:
        return "#334155";
    }
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.6, z - e.deltaY * 0.001)));
  }

  return (
    <div className="relative w-full rounded-md border border-slate-800 bg-slate-950 overflow-hidden">
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <div className="flex gap-1 bg-slate-900/80 border border-slate-800 rounded-md p-1">
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          {!compact && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-md p-2 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Layers className="h-3 w-3" /> Layers
              </div>
              {(["traffic", "routes", "congestion"] as const).map((l) => (
                <label key={l} className="flex items-center gap-1.5 text-slate-300 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={layers[l]}
                    onChange={() => setLayers((prev) => ({ ...prev, [l]: !prev[l] }))}
                    className="accent-cyan-400"
                  />
                  {l}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {activeIncident && (
        <div className="absolute top-2 left-2 z-10 bg-red-500/10 border border-red-500/40 rounded-md px-2.5 py-1.5 text-[11px] text-red-300">
          {activeIncident.type.toUpperCase()} · {activeIncident.severity}
        </div>
      )}

      <svg
        viewBox="0 0 1000 600"
        width="100%"
        height={height}
        onWheel={onWheel}
        onMouseDown={(e) => setDragging({ x: e.clientX - pan.x, y: e.clientY - pan.y })}
        onMouseMove={(e) => {
          if (dragging) setPan({ x: e.clientX - dragging.x, y: e.clientY - dragging.y });
        }}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        className="cursor-grab active:cursor-grabbing"
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`} style={{ transformOrigin: "500px 300px" }}>
          {/* background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="-200" y="-200" width="1400" height="1000" fill="url(#grid)" />

          {/* edges */}
          {edges.map((edge) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            if (!from || !to) return null;
            const color = layers.traffic ? edgeColor(edge.status) : "#334155";
            const width = edge.status === "closed" ? 3 : edge.lanes >= 2 ? 3 : 2;
            const dashed = edge.status === "closed";
            return (
              <g key={edge.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={dashed ? "6 4" : undefined}
                  opacity={hovered && hovered !== edge.id ? 0.35 : 0.9}
                  onMouseEnter={() => setHovered(edge.id)}
                  onMouseLeave={() => setHovered(null)}
                />
                {layers.congestion && edge.status === "congested" && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 4}
                    fill="#f59e0b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    ▲
                  </text>
                )}
              </g>
            );
          })}

          {/* optimized route overlay */}
          {layers.routes && optimization.phase === "complete" && routeD && (
            <path
              d={routeD}
              fill="none"
              stroke="#22c55e"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-animate"
              opacity={0.9}
            />
          )}

          {/* nodes */}
          {NETWORK_NODES.map((node) => {
            const isDepotHub = node.kind === "depot" || node.kind === "hub";
            const r = isDepotHub ? 12 : node.kind === "checkpoint" ? 6 : 8;
            return (
              <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
                <circle r={r} fill="#0f172a" stroke={KIND_COLOR[node.kind]} strokeWidth={2} />
                {isDepotHub && <circle r={3} fill={KIND_COLOR[node.kind]} />}
                {!compact && (
                  <text
                    y={r + 12}
                    textAnchor="middle"
                    fontSize={node.kind === "checkpoint" ? 8 : 10}
                    fill="#94a3b8"
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* vehicle markers at depot/hub as a simple presence indicator */}
          {!compact &&
            vehicles.slice(0, 8).map((v, i) => {
              const base = getNode(v.currentNode) ?? getNode("DEPOT")!;
              const angle = (i / vehicles.length) * Math.PI * 2;
              const ox = Math.cos(angle) * 22;
              const oy = Math.sin(angle) * 22;
              const color = v.status === "affected" ? "#ef4444" : v.type === "uav" ? "#a78bfa" : "#22d3ee";
              return (
                <circle
                  key={v.id}
                  cx={base.x + ox}
                  cy={base.y + oy}
                  r={3}
                  fill={color}
                  opacity={0.85}
                />
              );
            })}
        </g>
      </svg>

      <style>{`
        .route-animate {
          stroke-dasharray: 10 6;
          animation: dashmove 1s linear infinite;
        }
        @keyframes dashmove {
          to { stroke-dashoffset: -32; }
        }
      `}</style>
    </div>
  );
}
