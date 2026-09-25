import { mulberry32, seededRange } from "./rng";
import { AlgorithmName, ConvergencePoint, OptimizationResult } from "./types";

// Illustrative / simulated algorithm-comparison data for the SIH26137
// prototype. These numbers are NOT measured experimental results — they are
// generated to show plausible, internally-consistent relative performance
// across classical, metaheuristic and quantum-inspired approaches, seeded so
// the values stay stable across renders instead of re-randomizing.

export const BENCHMARK_SEED = 1337;

export interface AlgorithmProfile {
  algorithm: AlgorithmName;
  color: string;
  travelTimeFactor: number; // relative to Dijkstra baseline (1.0)
  distanceFactor: number;
  costFactor: number;
  runtimeMs: number;
  fitnessFactor: number;
  convergenceSpeed: number; // higher = converges faster (iterations to ~95%)
}

export const ALGORITHM_PROFILES: AlgorithmProfile[] = [
  { algorithm: "Dijkstra", color: "#64748b", travelTimeFactor: 1.0, distanceFactor: 1.0, costFactor: 1.0, runtimeMs: 45, fitnessFactor: 1.0, convergenceSpeed: 1 },
  { algorithm: "A*", color: "#94a3b8", travelTimeFactor: 0.97, distanceFactor: 0.98, costFactor: 0.97, runtimeMs: 60, fitnessFactor: 0.96, convergenceSpeed: 1 },
  { algorithm: "GA", color: "#eab308", travelTimeFactor: 0.86, distanceFactor: 0.9, costFactor: 0.88, runtimeMs: 2600, fitnessFactor: 0.79, convergenceSpeed: 0.55 },
  { algorithm: "PSO", color: "#38bdf8", travelTimeFactor: 0.81, distanceFactor: 0.86, costFactor: 0.83, runtimeMs: 2100, fitnessFactor: 0.71, convergenceSpeed: 0.7 },
  { algorithm: "QPSO", color: "#22c55e", travelTimeFactor: 0.76, distanceFactor: 0.848, costFactor: 0.778, runtimeMs: 1840, fitnessFactor: 0.612, convergenceSpeed: 1.0 },
];

const CLEAN_BASELINE = { travelTime: 142, distance: 84.2, cost: 2840, congestion: 61, fitness: 100 };

export function computeAlgorithmResults(seed = BENCHMARK_SEED): OptimizationResult[] {
  const rand = mulberry32(seed);
  return ALGORITHM_PROFILES.map((p) => {
    const jitter = () => 1 + seededRange(rand, -0.015, 0.015);
    return {
      algorithm: p.algorithm,
      travelTime: Number((CLEAN_BASELINE.travelTime * p.travelTimeFactor * jitter()).toFixed(0)),
      distance: Number((CLEAN_BASELINE.distance * p.distanceFactor * jitter()).toFixed(1)),
      cost: Number((CLEAN_BASELINE.cost * p.costFactor * jitter()).toFixed(0)),
      congestion: Number((CLEAN_BASELINE.congestion * p.travelTimeFactor * jitter()).toFixed(0)),
      runtime: Math.round(p.runtimeMs * (1 + seededRange(rand, -0.05, 0.05))),
      iterations: p.algorithm === "Dijkstra" || p.algorithm === "A*" ? 1 : 200,
      fitness: Number((CLEAN_BASELINE.fitness * p.fitnessFactor * jitter()).toFixed(1)),
    };
  });
}

export function computeConvergenceSeries(seed = BENCHMARK_SEED): Record<AlgorithmName, ConvergencePoint[]> {
  const results = computeAlgorithmResults(seed);
  const out = {} as Record<AlgorithmName, ConvergencePoint[]>;
  for (const p of ALGORITHM_PROFILES) {
    const rand = mulberry32(seed + p.algorithm.length * 97);
    const res = results.find((r) => r.algorithm === p.algorithm)!;
    const startFitness = 100;
    const endFitness = res.fitness;
    const iterations = res.iterations;
    const points: ConvergencePoint[] = [];
    const step = Math.max(1, Math.round(iterations / 25));
    let best = startFitness;
    for (let i = 0; i <= iterations; i += step) {
      const progress = i / iterations;
      const target =
        startFitness -
        (startFitness - endFitness) * (1 - Math.exp(-4 * p.convergenceSpeed * progress));
      const noise = (rand() - 0.5) * (startFitness - endFitness) * 0.02;
      const val = Math.max(endFitness, target + noise);
      best = Math.min(best, val);
      points.push({ iteration: i, fitness: Number(val.toFixed(2)), bestFitness: Number(best.toFixed(2)) });
    }
    points.push({ iteration: iterations, fitness: endFitness, bestFitness: endFitness });
    out[p.algorithm] = points;
  }
  return out;
}

export interface ScalabilityPoint {
  problemSize: number; // nodes * vehicles roughly
  nodes: number;
  vehicles: number;
  deliveries: number;
  runtime: Record<AlgorithmName, number>;
}

export function generateScalabilityData(
  nodes: number,
  vehicles: number,
  deliveries: number,
  seed = BENCHMARK_SEED
): ScalabilityPoint[] {
  const rand = mulberry32(seed + nodes + vehicles * 13 + deliveries * 7);
  const steps = 5;
  const points: ScalabilityPoint[] = [];
  for (let s = 1; s <= steps; s++) {
    const factor = s / steps;
    const n = Math.max(5, Math.round(nodes * factor));
    const v = Math.max(1, Math.round(vehicles * factor));
    const d = Math.max(1, Math.round(deliveries * factor));
    const problemSize = n * v;
    const runtime: Record<string, number> = {};
    for (const p of ALGORITHM_PROFILES) {
      const complexity =
        p.algorithm === "Dijkstra" || p.algorithm === "A*"
          ? problemSize * 0.8
          : problemSize * problemSize * 0.012 * (1 / p.convergenceSpeed);
      runtime[p.algorithm] = Math.round(
        complexity * (0.8 + rand() * 0.4) + p.runtimeMs * 0.15
      );
    }
    points.push({ problemSize, nodes: n, vehicles: v, deliveries: d, runtime: runtime as Record<AlgorithmName, number> });
  }
  return points;
}
