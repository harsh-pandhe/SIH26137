"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { NETWORK_EDGES } from "@/lib/simulation/routes";
import { generateDeliveries, generateFleet } from "@/lib/simulation/fleet";
import {
  cloneEdges,
  injectTrafficEvent,
  networkCongestionIndex,
  restoreNetwork,
} from "@/lib/simulation/traffic";
import {
  DEFAULT_CONSTRAINTS,
  DEFAULT_WEIGHTS,
  OPTIMIZATION_LOG_STEPS,
  runQPSO,
} from "@/lib/simulation/qpso";
import {
  ConstraintFlags,
  ConvergencePoint,
  Delivery,
  NetworkEdge,
  ObjectiveWeights,
  OptimizationResult,
  TrafficEvent,
  Vehicle,
} from "@/lib/simulation/types";

export type OptimizationPhase = "idle" | "running" | "complete";

interface OptimizationState {
  phase: OptimizationPhase;
  progress: number; // 0-100
  logs: string[];
  result: OptimizationResult | null;
  baseline: OptimizationResult | null;
  convergence: ConvergencePoint[];
  scenario: "clean" | "degraded-reoptimize" | "custom";
}

export type DemoStepId =
  | "load-network"
  | "show-fleet"
  | "run-baseline"
  | "run-qpso"
  | "show-improvement"
  | "inject-incident"
  | "detect-degradation"
  | "reoptimize"
  | "show-new-routes"
  | "show-benchmarks";

interface DemoState {
  active: boolean;
  paused: boolean;
  stepIndex: number;
  steps: { id: DemoStepId; label: string; done: boolean }[];
}

interface SimulationContextValue {
  vehicles: Vehicle[];
  deliveries: Delivery[];
  edges: NetworkEdge[];
  trafficEvents: TrafficEvent[];
  activeIncident: TrafficEvent | null;
  congestionIndex: number;
  degradationAlert: { affectedVehicles: number; message: string } | null;

  weights: ObjectiveWeights;
  setWeights: (w: ObjectiveWeights) => void;
  constraints: ConstraintFlags;
  setConstraints: (c: ConstraintFlags) => void;
  population: number;
  setPopulation: (n: number) => void;
  iterations: number;
  setIterations: (n: number) => void;

  optimization: OptimizationState;
  runOptimization: (scenario?: "clean" | "degraded-reoptimize" | "custom") => void;

  injectIncident: (type: "congestion" | "accident" | "closure") => void;
  restoreTraffic: () => void;
  reoptimizeFleet: () => void;

  activeRouteVehicleId: string | null;
  setActiveRouteVehicleId: (id: string | null) => void;

  demo: DemoState;
  startDemo: () => void;
  pauseDemo: () => void;
  restartDemo: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

const DEMO_STEP_DEFS: { id: DemoStepId; label: string }[] = [
  { id: "load-network", label: "Load road network" },
  { id: "show-fleet", label: "Show active fleet" },
  { id: "run-baseline", label: "Run baseline (Dijkstra) route" },
  { id: "run-qpso", label: "Run QPSO optimization" },
  { id: "show-improvement", label: "Show improvement summary" },
  { id: "inject-incident", label: "Inject major congestion" },
  { id: "detect-degradation", label: "Detect route degradation" },
  { id: "reoptimize", label: "Re-optimize fleet" },
  { id: "show-new-routes", label: "Show recovered routes" },
  { id: "show-benchmarks", label: "Show benchmark comparison" },
];

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => generateFleet());
  const [deliveries] = useState<Delivery[]>(() => generateDeliveries());
  const [edges, setEdges] = useState<NetworkEdge[]>(() => cloneEdges(NETWORK_EDGES));
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [activeIncident, setActiveIncident] = useState<TrafficEvent | null>(null);
  const [degradationAlert, setDegradationAlert] = useState<{
    affectedVehicles: number;
    message: string;
  } | null>(null);

  const [weights, setWeights] = useState<ObjectiveWeights>(DEFAULT_WEIGHTS);
  const [constraints, setConstraints] = useState<ConstraintFlags>(DEFAULT_CONSTRAINTS);
  const [population, setPopulation] = useState(100);
  const [iterations, setIterations] = useState(200);

  const [optimization, setOptimization] = useState<OptimizationState>({
    phase: "idle",
    progress: 0,
    logs: [],
    result: null,
    baseline: null,
    convergence: [],
    scenario: "clean",
  });

  const [activeRouteVehicleId, setActiveRouteVehicleId] = useState<string | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const runOptimization = useCallback(
    (scenario: "clean" | "degraded-reoptimize" | "custom" = "clean") => {
      clearTimers();
      const steps = OPTIMIZATION_LOG_STEPS(population, iterations);
      setOptimization({
        phase: "running",
        progress: 0,
        logs: [],
        result: null,
        baseline: null,
        convergence: [],
        scenario,
      });

      const totalDuration = 2600 + Math.random() * 1000; // 2.6-3.6s
      const perStep = totalDuration / steps.length;

      steps.forEach((log, i) => {
        const t = setTimeout(() => {
          setOptimization((prev) => ({
            ...prev,
            logs: [...prev.logs, log],
            progress: Math.round(((i + 1) / steps.length) * 100),
          }));
          if (i === steps.length - 1) {
            const { result, baseline, convergence } = runQPSO({
              population,
              iterations,
              weights,
              constraints,
              seed: scenario === "degraded-reoptimize" ? 77 : 42,
              scenario,
            });
            setOptimization((prev) => ({
              ...prev,
              phase: "complete",
              result,
              baseline,
              convergence,
            }));
            // animate a vehicle route highlight
            setActiveRouteVehicleId(vehicles[0]?.id ?? null);
          }
        }, perStep * (i + 1));
        timers.current.push(t);
      });
    },
    [population, iterations, weights, constraints, vehicles]
  );

  const injectIncident = useCallback(
    (type: "congestion" | "accident" | "closure") => {
      const { edges: nextEdges, event } = injectTrafficEvent(edges, type, Date.now());
      setEdges(nextEdges);
      setActiveIncident(event);
      setTrafficEvents((prev) => [event, ...prev].slice(0, 20));

      const affectedCount = type === "closure" ? 3 : Math.max(1, Math.floor(Math.random() * 3) + 1);
      setVehicles((prev) =>
        prev.map((v, i) => (i < affectedCount ? { ...v, status: "affected" } : v))
      );
      setDegradationAlert({
        affectedVehicles: 3,
        message:
          "Route degradation detected: current QPSO solution is stale for the affected corridor. Vehicles are experiencing elevated travel times.",
      });
    },
    [edges]
  );

  const restoreTraffic = useCallback(() => {
    setEdges((prev) => restoreNetwork(prev));
    setActiveIncident(null);
    setDegradationAlert(null);
    setVehicles((prev) => prev.map((v) => ({ ...v, status: "active" })));
  }, []);

  const reoptimizeFleet = useCallback(() => {
    setDegradationAlert(null);
    setVehicles((prev) => prev.map((v) => ({ ...v, status: "active" })));
    runOptimization("degraded-reoptimize");
  }, [runOptimization]);

  const congestionIndex = useMemo(() => networkCongestionIndex(edges), [edges]);

  // ---- Demo mode state machine -------------------------------------------
  const [demo, setDemo] = useState<DemoState>({
    active: false,
    paused: false,
    stepIndex: -1,
    steps: DEMO_STEP_DEFS.map((s) => ({ ...s, done: false })),
  });
  const demoTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearDemoTimers = () => {
    demoTimers.current.forEach((t) => clearTimeout(t));
    demoTimers.current = [];
  };
  const demoActiveRef = useRef(false);
  const demoPausedRef = useRef(false);
  const runDemoStepRef = useRef<(index: number) => void>(() => {});

  const runDemoStep = useCallback(
    (index: number) => {
      if (!demoActiveRef.current || demoPausedRef.current) return;
      if (index >= DEMO_STEP_DEFS.length) {
        demoActiveRef.current = false;
        setDemo((prev) => ({ ...prev, active: false }));
        return;
      }
      const step = DEMO_STEP_DEFS[index];
      setDemo((prev) => ({
        ...prev,
        stepIndex: index,
        steps: prev.steps.map((s, i) => (i === index ? { ...s, done: true } : s)),
      }));

      switch (step.id) {
        case "load-network":
          router.push("/");
          break;
        case "show-fleet":
          router.push("/fleet");
          break;
        case "run-baseline":
          router.push("/optimize");
          break;
        case "run-qpso":
          runOptimization("clean");
          break;
        case "show-improvement":
          break;
        case "inject-incident":
          router.push("/traffic");
          injectIncident("congestion");
          break;
        case "detect-degradation":
          break;
        case "reoptimize":
          reoptimizeFleet();
          break;
        case "show-new-routes":
          router.push("/optimize");
          break;
        case "show-benchmarks":
          router.push("/benchmarks");
          break;
      }

      const t = setTimeout(() => {
        runDemoStepRef.current(index + 1);
      }, 4800);
      demoTimers.current.push(t);
    },
    [router, runOptimization, injectIncident, reoptimizeFleet]
  );

  React.useEffect(() => {
    runDemoStepRef.current = runDemoStep;
  }, [runDemoStep]);

  const startDemo = useCallback(() => {
    clearDemoTimers();
    demoActiveRef.current = true;
    demoPausedRef.current = false;
    setDemo({
      active: true,
      paused: false,
      stepIndex: -1,
      steps: DEMO_STEP_DEFS.map((s) => ({ ...s, done: false })),
    });
    setTimeout(() => runDemoStep(0), 300);
  }, [runDemoStep]);

  const pauseDemo = useCallback(() => {
    demoPausedRef.current = !demoPausedRef.current;
    if (demoPausedRef.current) {
      clearDemoTimers();
    } else {
      setDemo((prev) => {
        const t = setTimeout(() => runDemoStep(prev.stepIndex + 1), 800);
        demoTimers.current.push(t);
        return prev;
      });
    }
    setDemo((prev) => ({ ...prev, paused: demoPausedRef.current }));
  }, [runDemoStep]);

  const restartDemo = useCallback(() => {
    clearDemoTimers();
    restoreTraffic();
    startDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: SimulationContextValue = {
    vehicles,
    deliveries,
    edges,
    trafficEvents,
    activeIncident,
    congestionIndex,
    degradationAlert,
    weights,
    setWeights,
    constraints,
    setConstraints,
    population,
    setPopulation,
    iterations,
    setIterations,
    optimization,
    runOptimization,
    injectIncident,
    restoreTraffic,
    reoptimizeFleet,
    activeRouteVehicleId,
    setActiveRouteVehicleId,
    demo,
    startDemo,
    pauseDemo,
    restartDemo,
  };

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
