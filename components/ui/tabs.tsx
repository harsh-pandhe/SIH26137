"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  return (
    <div>
      <div className="flex gap-1 border-b border-slate-800 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(t.id);
              onChange?.(t.id);
            }}
            className={cn(
              "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
              active === t.id
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
