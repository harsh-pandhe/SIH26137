import { NetworkEdge, NetworkNode } from "./types";

// Simulated road network: 1 depot, 1 hub, 20 delivery points, a handful of
// checkpoints, laid out on a fixed SVG coordinate grid (0-1000 x 0-600).
// This is a static illustrative topology, not a real city map.

export const NETWORK_NODES: NetworkNode[] = [
  { id: "DEPOT", label: "Central Depot", kind: "depot", x: 500, y: 300 },
  { id: "HUB1", label: "North Hub", kind: "hub", x: 500, y: 120 },
  { id: "C01", label: "C01", kind: "delivery", x: 160, y: 80 },
  { id: "C02", label: "C02", kind: "delivery", x: 300, y: 60 },
  { id: "C03", label: "C03", kind: "delivery", x: 440, y: 40 },
  { id: "C04", label: "C04", kind: "delivery", x: 620, y: 50 },
  { id: "C05", label: "C05", kind: "delivery", x: 760, y: 90 },
  { id: "C06", label: "C06", kind: "delivery", x: 860, y: 170 },
  { id: "C07", label: "C07", kind: "delivery", x: 900, y: 280 },
  { id: "C08", label: "C08", kind: "delivery", x: 880, y: 400 },
  { id: "C09", label: "C09", kind: "delivery", x: 800, y: 480 },
  { id: "C10", label: "C10", kind: "delivery", x: 680, y: 540 },
  { id: "C11", label: "C11", kind: "delivery", x: 540, y: 560 },
  { id: "C12", label: "C12", kind: "delivery", x: 400, y: 550 },
  { id: "C13", label: "C13", kind: "delivery", x: 270, y: 520 },
  { id: "C14", label: "C14", kind: "delivery", x: 160, y: 460 },
  { id: "C15", label: "C15", kind: "delivery", x: 90, y: 360 },
  { id: "C16", label: "C16", kind: "delivery", x: 80, y: 230 },
  { id: "C17", label: "C17", kind: "delivery", x: 130, y: 150 },
  { id: "C18", label: "C18", kind: "delivery", x: 320, y: 200 },
  { id: "C19", label: "C19", kind: "delivery", x: 640, y: 210 },
  { id: "C20", label: "C20", kind: "delivery", x: 700, y: 340 },
  { id: "CK1", label: "CK-A", kind: "checkpoint", x: 350, y: 350 },
  { id: "CK2", label: "CK-B", kind: "checkpoint", x: 620, y: 420 },
];

const rawEdges: [string, string, number, number, number][] = [
  // from, to, km, freeflow speed kmh, lanes
  ["DEPOT", "HUB1", 8, 60, 3],
  ["DEPOT", "CK1", 6, 50, 2],
  ["DEPOT", "CK2", 7, 50, 2],
  ["DEPOT", "C19", 9, 55, 2],
  ["DEPOT", "C20", 8.5, 55, 2],
  ["DEPOT", "C11", 10, 45, 2],
  ["DEPOT", "C18", 7.5, 50, 2],
  ["HUB1", "C02", 6, 50, 2],
  ["HUB1", "C03", 5.5, 55, 2],
  ["HUB1", "C04", 6.5, 55, 2],
  ["HUB1", "C19", 5, 50, 2],
  ["HUB1", "C18", 8, 45, 2],
  ["C01", "C02", 5, 45, 1],
  ["C01", "C17", 4, 40, 1],
  ["C02", "C03", 4.5, 45, 1],
  ["C03", "C04", 5, 45, 1],
  ["C04", "C05", 4.8, 45, 1],
  ["C05", "C06", 5.2, 45, 1],
  ["C06", "C07", 4.6, 45, 1],
  ["C07", "C08", 4.9, 45, 1],
  ["C08", "C09", 4.4, 45, 1],
  ["C09", "C10", 5.1, 40, 1],
  ["C10", "C11", 4.7, 40, 1],
  ["C11", "C12", 4.5, 40, 1],
  ["C12", "C13", 4.3, 40, 1],
  ["C13", "C14", 4.6, 40, 1],
  ["C14", "C15", 4.1, 40, 1],
  ["C15", "C16", 4.8, 40, 1],
  ["C16", "C17", 3.9, 40, 1],
  ["C17", "C18", 5.5, 40, 1],
  ["C18", "CK1", 4, 45, 2],
  ["CK1", "C15", 5, 40, 1],
  ["CK1", "C13", 6, 40, 1],
  ["CK1", "C12", 5.5, 40, 1],
  ["C19", "C20", 4.2, 45, 1],
  ["C20", "CK2", 3.8, 45, 1],
  ["CK2", "C09", 5.6, 40, 1],
  ["CK2", "C10", 4.9, 40, 1],
  ["CK2", "C08", 6.2, 40, 1],
  ["C05", "HUB1", 7, 50, 1],
  ["C06", "C20", 6.5, 45, 1],
  ["C07", "CK2", 5.8, 45, 1],
  ["C16", "DEPOT", 9, 45, 1],
  ["C14", "CK1", 5.4, 40, 1],
];

export const NETWORK_EDGES: NetworkEdge[] = rawEdges.map(
  ([from, to, km, speed, lanes], i) => ({
    id: `E${i + 1}`,
    from,
    to,
    baseWeight: km,
    baseSpeed: speed,
    lanes,
    status: "clear",
    congestionFactor: 1,
  })
);

export const DELIVERY_NODE_IDS = NETWORK_NODES.filter(
  (n) => n.kind === "delivery"
).map((n) => n.id);

export function getNode(id: string): NetworkNode | undefined {
  return NETWORK_NODES.find((n) => n.id === id);
}

export function neighborsOf(nodeId: string, edges: NetworkEdge[]) {
  return edges.filter((e) => e.from === nodeId || e.to === nodeId);
}

// Effective travel time (minutes) for an edge given current congestion/closure state.
export function edgeTravelTimeMin(edge: NetworkEdge): number {
  if (edge.status === "closed") return Infinity;
  const effSpeed = edge.baseSpeed / edge.congestionFactor;
  return (edge.baseWeight / Math.max(effSpeed, 5)) * 60;
}

// Simple Dijkstra shortest path by travel time, used to render "active route"
// polylines on the map for a given vehicle's stop sequence.
export function shortestPath(
  edges: NetworkEdge[],
  from: string,
  to: string
): string[] {
  const adj = new Map<string, { to: string; edge: NetworkEdge }[]>();
  for (const e of edges) {
    if (e.status === "closed") continue;
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from)!.push({ to: e.to, edge: e });
    adj.get(e.to)!.push({ to: e.from, edge: e });
  }
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  dist.set(from, 0);
  const queue = new Set<string>([from]);
  while (queue.size > 0) {
    let u = "";
    let best = Infinity;
    for (const n of queue) {
      const d = dist.get(n) ?? Infinity;
      if (d < best) {
        best = d;
        u = n;
      }
    }
    queue.delete(u);
    if (!u || visited.has(u)) continue;
    visited.add(u);
    if (u === to) break;
    for (const { to: v, edge } of adj.get(u) ?? []) {
      if (visited.has(v)) continue;
      const w = edgeTravelTimeMin(edge);
      const nd = (dist.get(u) ?? Infinity) + w;
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        prev.set(v, u);
        queue.add(v);
      }
    }
  }
  if (!dist.has(to)) return [from, to];
  const path: string[] = [to];
  let cur = to;
  while (cur !== from) {
    const p = prev.get(cur);
    if (!p) break;
    path.unshift(p);
    cur = p;
  }
  return path;
}

export function pathToPoints(path: string[]): [number, number][] {
  return path
    .map((id) => getNode(id))
    .filter((n): n is NetworkNode => !!n)
    .map((n) => [n.x, n.y]);
}
