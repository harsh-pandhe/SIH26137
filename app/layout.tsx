import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimulationProvider } from "@/contexts/simulation-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FleetOps Command Center — SIH26137",
  description:
    "Autonomous fleet operations command center prototype for SIH26137: Quantum-Inspired Intelligent Traffic Route Optimization using Metaheuristic Optimization.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-200 antialiased">
        <SimulationProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-5">{children}</main>
            </div>
          </div>
        </SimulationProvider>
      </body>
    </html>
  );
}
