import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autonomous Logistics",
  description: "Forward-looking multimodal autonomous logistics extension for ground and aerial fleets.",
};

export default function AutonomousLayout({ children }: { children: React.ReactNode }) {
  return children;
}
