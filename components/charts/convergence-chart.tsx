"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ConvergencePoint } from "@/lib/simulation/types";

export function ConvergenceChart({
  data,
  color = "#22c55e",
  height = 260,
  label = "Best Fitness",
}: {
  data: ConvergencePoint[];
  color?: string;
  height?: number;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis
          dataKey="iteration"
          stroke="#64748b"
          fontSize={11}
          tickLine={false}
          label={{ value: "Iteration", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="fitness"
          name="Particle Fitness"
          stroke="#334155"
          strokeWidth={1}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="bestFitness"
          name={label}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
