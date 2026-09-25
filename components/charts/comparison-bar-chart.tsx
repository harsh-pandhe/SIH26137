"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export function ComparisonBarChart({
  data,
  dataKey,
  colorKey = "color",
  height = 240,
  unit = "",
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  colorKey?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="algorithm" stroke="#64748b" fontSize={11} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: "#94a3b8" }}
          formatter={(v) => [`${v}${unit}`, dataKey]}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={String(d[colorKey])} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
