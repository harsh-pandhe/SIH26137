import { mulberry32, seededRange } from "./rng";
import { DELIVERY_NODE_IDS } from "./routes";
import { Delivery, Vehicle } from "./types";

// Judge-demo scenario: 42 deliveries, 8 vehicles (trucks + UAVs + UGVs).
export const FLEET_SEED = 2026;

export function generateFleet(seed = FLEET_SEED): Vehicle[] {
  const rand = mulberry32(seed);
  const trucks: Vehicle[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `TRK-${String(i + 1).padStart(2, "0")}`,
    type: "truck",
    label: `Truck ${i + 1}`,
    capacity: Math.round(seededRange(rand, 900, 1500)),
    status: "active",
    currentNode: "DEPOT",
    route: [],
    eta: Math.round(seededRange(rand, 25, 90)),
    speedKmh: Math.round(seededRange(rand, 38, 52)),
    driver: ["A. Sharma", "R. Verma", "K. Iyer", "S. Nair", "P. Das"][i],
  }));

  const uavs: Vehicle[] = Array.from({ length: 2 }).map((_, i) => ({
    id: `UAV-${String(i + 1).padStart(2, "0")}`,
    type: "uav",
    label: `UAV ${i + 1}`,
    capacity: Math.round(seededRange(rand, 5, 15)),
    battery: Math.round(seededRange(rand, 55, 95)),
    range: Math.round(seededRange(rand, 12, 25)),
    status: "active",
    currentNode: "HUB1",
    route: [],
    eta: Math.round(seededRange(rand, 8, 25)),
    speedKmh: Math.round(seededRange(rand, 45, 65)),
  }));

  const ugvs: Vehicle[] = Array.from({ length: 1 }).map((_, i) => ({
    id: `UGV-${String(i + 1).padStart(2, "0")}`,
    type: "ugv",
    label: `UGV ${i + 1}`,
    capacity: Math.round(seededRange(rand, 30, 80)),
    battery: Math.round(seededRange(rand, 60, 98)),
    range: Math.round(seededRange(rand, 15, 30)),
    status: "active",
    currentNode: "CK1",
    route: [],
    eta: Math.round(seededRange(rand, 10, 30)),
    speedKmh: Math.round(seededRange(rand, 15, 25)),
  }));

  return [...trucks, ...uavs, ...ugvs];
}

export function generateDeliveries(seed = FLEET_SEED, count = 42): Delivery[] {
  const rand = mulberry32(seed + 1);
  const priorities: Delivery["priority"][] = ["low", "medium", "high"];
  const deliveries: Delivery[] = [];
  for (let i = 0; i < count; i++) {
    const nodeId = DELIVERY_NODE_IDS[i % DELIVERY_NODE_IDS.length];
    deliveries.push({
      id: `DLV-${String(i + 1).padStart(3, "0")}`,
      nodeId,
      location: [0, 0],
      demand: Math.round(seededRange(rand, 8, 120)),
      priority: priorities[Math.floor(rand() * priorities.length)],
      assignedVehicle: undefined,
      delivered: false,
    });
  }
  return deliveries;
}
