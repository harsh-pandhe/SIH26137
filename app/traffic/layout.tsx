import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traffic Simulation",
  description: "Inject synthetic traffic events and observe live route degradation and fleet re-optimization.",
};

export default function TrafficLayout({ children }: { children: React.ReactNode }) {
  return children;
}
