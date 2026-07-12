"use client";

import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { DashboardData, computeTotals, fmtUSD, STATUS_ORDER, STATUS_LABELS } from "../lib/seed";

const AnimatedNumber = ({ value, format }: { value: number; format: (n: number) => string }) => {
  const reduceMotion = useReducedMotion();
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (latest) => format(latest));
  useEffect(() => {
    if (reduceMotion) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1.1, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value, reduceMotion]);
  return <motion.span>{rounded}</motion.span>;
};

// Returns a stable "skeleton" while the client hasn't hydrated yet, so we never
// animate from seed data -> real data -> a different real value. SSR and first
// hydration render the skeleton; after useDashboardData sets hydrated=true, the
// real values mount and animate in exactly once.
const SKELETON = "—";

const StageBar = ({
  label,
  done,
  total,
  color,
  delay = 0,
}: {
  label: string;
  done: number;
  total: number;
  color: string;
  delay?: number;
}) => {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-steel-400">{label}</span>
        <span className="text-xs font-medium text-steel-200">
          {done}/{total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-steel-700/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: "easeOut", delay: delay + 0.15 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </motion.div>
  );
};

export default function Overview({ data, hydrated }: { data: DashboardData; hydrated: boolean }) {
  const totals = useMemo(() => computeTotals(data.costs), [data.costs]);

  // progress by stage for todos
  const byStage = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    data.todos.forEach((t) => {
      const e = map.get(t.stage) || { done: 0, total: 0 };
      e.total += 1;
      if (t.status === "done") e.done += 1;
      map.set(t.stage, e);
    });
    return Array.from(map.entries());
  }, [data.todos]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      not_started: 0,
      in_progress: 0,
      blocked: 0,
      done: 0,
    };
    data.todos.forEach((t) => {
      counts[t.status] += 1;
    });
    return counts;
  }, [data.todos]);

  const overallDone = statusBreakdown.done;
  const overallTotal = data.todos.length;
  const overallPct = overallTotal > 0 ? (overallDone / overallTotal) * 100 : 0;

  // Determine budget status — actual vs midpoint of (low + high)/2
  const mid = (totals.filledLow + totals.filledHigh) / 2;
  const variance = totals.actualTotal - mid;
  const variancePct = mid > 0 ? (variance / mid) * 100 : 0;

  const tbdCount = data.costs.filter(
    (c) => c.status === "Open" || c.status === "Leave blank per Ry"
  ).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Budget snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-soft rounded-2xl p-6 lg:col-span-2"
      >
        <div className="mb-1 text-xs uppercase tracking-wide text-steel-400">
          Materials budget snapshot
        </div>
        <div className="mb-4 text-[11px] text-steel-500">{data.meta.subtotalNote}</div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-steel-400">Low estimate</div>
            <div className="mt-1 text-2xl font-semibold text-moss-400">
              {hydrated ? <AnimatedNumber value={totals.filledLow} format={(n) => fmtUSD(n)} /> : SKELETON}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-steel-400">High estimate</div>
            <div className="mt-1 text-2xl font-semibold text-amber-300">
              {hydrated ? <AnimatedNumber value={totals.filledHigh} format={(n) => fmtUSD(n)} /> : SKELETON}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-steel-400">Actual spent</div>
            <div className="mt-1 text-2xl font-semibold text-slate2-400">
              {hydrated ? <AnimatedNumber value={totals.actualTotal} format={(n) => fmtUSD(n)} /> : SKELETON}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-steel-400">TBD rows</div>
            <div className="mt-1 text-2xl font-semibold text-steel-200">
              {hydrated ? <AnimatedNumber value={tbdCount} format={(n) => `${Math.round(n)}`} /> : SKELETON}
            </div>
          </div>
        </div>

        {/* Variance bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="text-steel-400">Spend position</span>
            <span className={variance > 0 ? "text-rust-400" : "text-moss-400"}>
              {hydrated ? (
                <>
                  {fmtUSD(variance)} {variance > 0 ? "over" : variance < 0 ? "under" : ""} midpoint
                  {variance !== 0 && (
                    <span className="ml-2 text-steel-400">
                      ({variancePct > 0 ? "+" : ""}
                      {variancePct.toFixed(1)}%)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-steel-400">calculating…</span>
              )}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-steel-700/60">
            {/* low → high markers */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-moss-500/40 via-steel-500/30 to-amber-500/40"
            />
            {/* Actual pivot marker */}
            {hydrated && mid > 0 && totals.actualTotal > 0 && (
              <motion.div
                initial={{ left: "50%", scale: 0 }}
                animate={{
                  left: `${Math.min(100, Math.max(0, (totals.actualTotal / totals.filledHigh) * 100))}%`,
                  scale: 1,
                }}
                transition={{ delay: 0.6, type: "spring", stiffness: 220 }}
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate2-500 shadow-soft"
                aria-label="Actual spend position"
                title={`Actual: ${fmtUSD(totals.actualTotal)}`}
              />
            )}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-steel-500">
            <span>{hydrated ? fmtUSD(totals.filledLow) : SKELETON}</span>
            <span>{hydrated ? fmtUSD(totals.filledHigh) : SKELETON}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card-soft rounded-2xl p-6"
      >
        <div className="mb-1 text-xs uppercase tracking-wide text-steel-400">Overall progress</div>
        <div className="mb-3 flex items-baseline gap-2">
          <div className="text-3xl font-semibold">
            {hydrated ? <AnimatedNumber value={overallDone} format={(n) => `${Math.round(n)}/${overallTotal}`} /> : SKELETON}
          </div>
          <div className="text-sm text-steel-400">tasks done</div>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-steel-700/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-moss-500 via-amber-400 to-rust-400"
          />
        </div>

        <div className="mt-4 space-y-2 text-xs">
          {STATUS_ORDER.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="flex items-center justify-between text-steel-200"
            >
              <span>{STATUS_LABELS[s]}</span>
              <span className="font-mono">{statusBreakdown[s]}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stage breakdown */}
      <div className="lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-wide text-steel-300">Stage progress</h2>
          <div className="text-xs text-steel-400">{data.todos.length} jobs total</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byStage.map(([stage, stats], i) => {
            const colors = [
              "bg-moss-500",
              "bg-amber-400",
              "bg-slate2-400",
              "bg-rust-400",
              "bg-amber-500",
              "bg-moss-400",
              "bg-slate2-500",
              "bg-rust-500",
            ];
            return (
              <StageBar
                key={stage}
                label={stage}
                done={stats.done}
                total={stats.total}
                color={colors[i % colors.length]}
                delay={0.1 * i}
              />
            );
          })}
        </div>
      </div>

      {/* Drawing notes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card-soft mt-2 rounded-2xl p-6 lg:col-span-3"
      >
        <div className="mb-2 text-xs uppercase tracking-wide text-steel-400">Source drawings</div>
        <ul className="space-y-1 text-sm text-steel-200">
          {data.meta.drawingNotes.map((n) => (
            <li key={n} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {n}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
