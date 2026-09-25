"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  color?: string;
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange, color = "#22d3ee" }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-800")}
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, rgb(30 41 59) ${pct}%)`,
        }}
      />
    </div>
  );
}
