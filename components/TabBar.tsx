"use client";

import { motion } from "framer-motion";

export type TabKey = "overview" | "costs" | "todos";

export default function TabBar({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: TabKey; label: string; hint: string }[];
  value: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div role="tablist" className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`relative rounded-xl px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
              active ? "text-white" : "text-steel-300 hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="absolute inset-0 -z-0 rounded-xl bg-gradient-to-br from-amber-500/30 via-rust-500/15 to-slate2-500/30 shadow-soft"
              />
            )}
            <span className="relative z-10 flex flex-col items-start leading-tight">
              <span>{t.label}</span>
              <span className="text-[10px] font-normal text-steel-400">{t.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
