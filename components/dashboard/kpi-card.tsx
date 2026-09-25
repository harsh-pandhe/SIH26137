import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // percent, positive = improvement direction depends on invertGood
  deltaGoodDirection?: "up" | "down";
  icon?: React.ReactNode;
  sublabel?: string;
}

export function KpiCard({ label, value, delta, deltaGoodDirection = "up", icon, sublabel }: KpiCardProps) {
  const isGood =
    delta === undefined
      ? null
      : deltaGoodDirection === "up"
      ? delta >= 0
      : delta <= 0;

  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
        {icon && <div className="text-slate-600">{icon}</div>}
      </div>
      <div className="text-2xl font-semibold text-slate-100 font-mono">{value}</div>
      <div className="flex items-center gap-2">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              isGood ? "text-emerald-400" : "text-red-400"
            )}
          >
            {delta === 0 ? <Minus className="h-3 w-3" /> : delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        {sublabel && <span className="text-[11px] text-slate-600">{sublabel}</span>}
      </div>
    </Card>
  );
}
