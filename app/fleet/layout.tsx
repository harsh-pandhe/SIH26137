import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet Management",
  description: "Live fleet roster, delivery manifest and vehicle detail for the SIH26137 FleetOps prototype.",
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
