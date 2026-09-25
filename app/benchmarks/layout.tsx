import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algorithm Benchmarks",
  description: "Comparative performance of Dijkstra, A*, GA, PSO and QPSO on the fleet routing scenario.",
};

export default function BenchmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
