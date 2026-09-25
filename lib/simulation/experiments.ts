import { mulberry32, seededRange } from "./rng";
import { runQPSO } from "./qpso";
import { ConstraintFlags, ExperimentRecord, ObjectiveWeights } from "./types";

const BASE_WEIGHTS: ObjectiveWeights = { travelTime: 40, distance: 25, cost: 20, congestion: 15 };
const BASE_CONSTRAINTS: ConstraintFlags = {
  vehicleCapacity: true,
  timeWindows: true,
  noFlyZones: true,
  batteryRange: true,
  roadClosures: true,
};

const TIMESTAMPS = [
  "2026-09-10 09:14",
  "2026-09-11 14:02",
  "2026-09-12 08:47",
  "2026-09-14 16:35",
  "2026-09-16 11:20",
  "2026-09-18 19:05",
  "2026-09-20 07:58",
  "2026-09-21 13:44",
  "2026-09-23 10:12",
  "2026-09-24 21:30",
];

export function generateExperimentHistory(count = 10): ExperimentRecord[] {
  const rand = mulberry32(555);
  const records: ExperimentRecord[] = [];
  for (let i = 0; i < count; i++) {
    const population = [60, 80, 100, 120, 150][Math.floor(rand() * 5)];
    const iterations = [100, 150, 200, 250][Math.floor(rand() * 4)];
    const seed = Math.floor(seededRange(rand, 100, 9999));
    const weights: ObjectiveWeights = {
      travelTime: Math.round(seededRange(rand, 30, 50)),
      distance: Math.round(seededRange(rand, 15, 30)),
      cost: Math.round(seededRange(rand, 10, 25)),
      congestion: Math.round(seededRange(rand, 10, 20)),
    };
    const constraints: ConstraintFlags = {
      ...BASE_CONSTRAINTS,
      noFlyZones: rand() > 0.3,
      batteryRange: rand() > 0.2,
    };
    const { result, convergence } = runQPSO({
      population,
      iterations,
      weights,
      constraints,
      seed,
      scenario: "custom",
    });
    records.push({
      id: `EXP-${String(i + 1).padStart(3, "0")}`,
      algorithm: "QPSO",
      population,
      iterations,
      fitness: result.fitness,
      timestamp: TIMESTAMPS[i % TIMESTAMPS.length],
      seed,
      weights,
      constraints,
      result,
      convergence,
    });
  }
  return records;
}

export { BASE_WEIGHTS, BASE_CONSTRAINTS };
