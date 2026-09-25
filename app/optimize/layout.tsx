import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Route Optimization",
  description: "QPSO-driven multi-vehicle route optimization command center for the SIH26137 FleetOps prototype.",
};

export default function OptimizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
