import { mulberry32 } from "./rng";
import { NETWORK_EDGES } from "./routes";
import { NetworkEdge, TrafficEvent, TrafficEventType, TrafficSeverity } from "./types";

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

const SEVERITY_FACTOR: Record<TrafficSeverity, number> = {
  minor: 1.4,
  moderate: 2.0,
  major: 3.2,
  critical: 5.0,
};

export function cloneEdges(edges: NetworkEdge[] = NETWORK_EDGES): NetworkEdge[] {
  return edges.map((e) => ({ ...e }));
}

export function injectTrafficEvent(
  edges: NetworkEdge[],
  type: TrafficEventType,
  seed = Date.now()
): { edges: NetworkEdge[]; event: TrafficEvent } {
  const rand = mulberry32(seed);
  const next = cloneEdges(edges);

  const severity: TrafficSeverity =
    type === "closure"
      ? "critical"
      : type === "accident"
      ? (["moderate", "major", "critical"][Math.floor(rand() * 3)] as TrafficSeverity)
      : (["minor", "moderate", "major"][Math.floor(rand() * 3)] as TrafficSeverity);

  const clearEdges = next.filter((e) => e.status === "clear");
  const pool = clearEdges.length > 0 ? clearEdges : next;
  const centerIdx = Math.floor(rand() * pool.length);
  const center = pool[centerIdx];

  // Affect the chosen edge plus 1-2 edges sharing a node, to simulate a
  // localized incident spreading to nearby links.
  const affected = [center, ...next.filter(
    (e) => e.id !== center.id && (e.from === center.from || e.to === center.from || e.from === center.to || e.to === center.to)
  ).slice(0, type === "closure" ? 1 : 2)];

  const factor = SEVERITY_FACTOR[severity];
  for (const e of affected) {
    const target = next.find((n) => n.id === e.id)!;
    if (type === "closure") {
      target.status = "closed";
      target.congestionFactor = 999;
    } else {
      target.status = type === "accident" ? "incident" : "congested";
      target.congestionFactor = factor;
    }
  }

  const travelTimeBefore = Math.round(28 + rand() * 12);
  const travelTimeAfter = Math.round(travelTimeBefore * (factor * 0.55 + 1));

  const descriptions: Record<TrafficEventType, string> = {
    congestion: "Traffic buildup reported due to peak-hour demand surge.",
    accident: "Multi-vehicle collision blocking two lanes.",
    closure: "Road closed for emergency maintenance / civic works.",
  };

  const event: TrafficEvent = {
    id: nextId("EVT"),
    type,
    severity,
    affectedEdges: affected.map((e) => e.id),
    location: center.from,
    createdAt: Date.now(),
    travelTimeBefore,
    travelTimeAfter,
    description: descriptions[type],
  };

  return { edges: next, event };
}

export function restoreNetwork(edges: NetworkEdge[]): NetworkEdge[] {
  return cloneEdges(edges).map((e) => ({
    ...e,
    status: "clear",
    congestionFactor: 1,
  }));
}

export function networkCongestionIndex(edges: NetworkEdge[]): number {
  if (edges.length === 0) return 0;
  const total = edges.reduce((sum, e) => {
    if (e.status === "closed") return sum + 5;
    return sum + Math.min(e.congestionFactor, 5);
  }, 0);
  return Math.round((total / (edges.length * 5)) * 100);
}
