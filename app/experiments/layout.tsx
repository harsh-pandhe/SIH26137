import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiment History",
  description: "Logged QPSO optimization runs with configuration and convergence detail.",
};

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
