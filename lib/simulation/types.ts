// Core domain types for the Autonomous Fleet Operations Command Center prototype.
// All data in this app is simulated client-side — see README for details.

export type VehicleType = "truck" | "uav" | "ugv";
export type VehicleStatus = "active" | "idle" | "charging" | "returning" | "affected";

export interface Vehicle {
  id: string;
  type: VehicleType;
  label: string;
  capacity?: number; // kg
  battery?: number; // percent, UAV/UGV only
  range?: number; // km, UAV/UGV only
  status: VehicleStatus;
  currentNode: string;
  route: string[]; // ordered node ids
  eta: number; // minutes
  speedKmh: number;
  driver?: string;
}

export interface Delivery {
  id: string;
  nodeId: string;
  location: [number, number]; // svg coordinate space
  demand: number; // kg
  priority: "low" | "medium" | "high";
  assignedVehicle?: string;
  delivered?: boolean;
}

export type TrafficSeverity = "minor" | "moderate" | "major" | "critical";
export type TrafficEventType = "congestion" | "accident" | "closure";

export interface TrafficEvent {
  id: string;
  type: TrafficEventType;
  severity: TrafficSeverity;
  affectedEdges: string[]; // edge ids
  location: string; // node id near incident
  createdAt: number;
  travelTimeBefore: number;
  travelTimeAfter: number;
  description: string;
}

export type AlgorithmName = "Dijkstra" | "A*" | "GA" | "PSO" | "QPSO";

export interface OptimizationResult {
  algorithm: AlgorithmName;
  travelTime: number; // minutes
  distance: number; // km
  cost: number; // INR
  congestion: number; // 0-100 index
  runtime: number; // ms (simulated compute time)
  iterations: number;
  fitness: number; // lower is better
}

export interface ConvergencePoint {
  iteration: number;
  fitness: number;
  bestFitness: number;
}

export interface NetworkNode {
  id: string;
  label: string;
  kind: "depot" | "hub" | "delivery" | "checkpoint";
  x: number;
  y: number;
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  baseWeight: number; // km
  baseSpeed: number; // km/h free-flow
  lanes: number;
  status: "clear" | "congested" | "closed" | "incident";
  congestionFactor: number; // 1 = free flow, >1 slower
}

export interface ObjectiveWeights {
  travelTime: number;
  distance: number;
  cost: number;
  congestion: number;
}

export interface ConstraintFlags {
  vehicleCapacity: boolean;
  timeWindows: boolean;
  noFlyZones: boolean;
  batteryRange: boolean;
  roadClosures: boolean;
}

export interface ExperimentRecord {
  id: string;
  algorithm: AlgorithmName;
  population: number;
  iterations: number;
  fitness: number;
  timestamp: string;
  seed: number;
  weights: ObjectiveWeights;
  constraints: ConstraintFlags;
  result: OptimizationResult;
  convergence: ConvergencePoint[];
}
