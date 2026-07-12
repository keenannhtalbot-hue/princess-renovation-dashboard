"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DashboardData,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ORDER,
  TodoLine,
  TodoStatus,
  fmtUSDPrecise,
} from "../lib/seed";
import { Plus, X, Trash2, Filter, Calendar, Link as LinkIcon, ChevronDown, Sparkles } from "lucide-react";

const FILTERS: { key: "all" | TodoStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

const StatusDot = ({ s }: { s: TodoStatus }) => (
  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${STATUS_COLORS[s].dot}`}>
    <motion.span
      className={`absolute inset-0 rounded-full ${STATUS_COLORS[s].dot} opacity-60`}
      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 2.2, repeat: Infinity }}
    />
  </span>
);

const TodoRow = ({
  t,
  costLookup,
  onCycle,
  onUpdate,
  onDelete,
}: {
  t: TodoLine;
  costLookup: Map<string, { lowTotal: number | null; highTotal: number | null; actualAmount: number | null }>;
  onCycle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<TodoLine>) => void;
  onDelete: (id: string) => void;
}) => {
  const [expand, setExpand] = useState(false);
  const cost = t.costLineId ? costLookup.get(t.costLineId) : undefined;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`group rounded-xl border border-white/5 bg-white/[0.03] p-3 ring-1 ring-transparent transition hover:bg-white/[0.05] hover:${STATUS_COLORS[t.status].ring}`}
    >
      <div className="flex items-start gap-3">
        <motion.button
          onClick={() => onCycle(t.id)}
          whileTap={{ scale: 0.85 }}
          className={`mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full border ${STATUS_COLORS[t.status].chip}`}
          aria-label={`Cycle status: ${STATUS_LABELS[t.status]}`}
          title={`Status: ${STATUS_LABELS[t.status]} (click to change)`}
        >
          {t.status === "done" ? (
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
            </motion.svg>
          ) : (
            <StatusDot s={t.status} />
          )}
        </motion.button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <motion.span
              layout
              className={`text-sm font-medium ${
                t.status === "done" ? "text-steel-500 line-through" : "text-steel-50"
              }`}
            >
              {t.task}
            </motion.span>
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[10px] ${STATUS_COLORS[t.status].chip}`}
            >
              {STATUS_LABELS[t.status]}
            </span>
            {t.targetDate && (
              <span className="flex items-center gap-1 text-[11px] text-steel-400">
                <Calendar className="h-3 w-3" /> {t.targetDate}
              </span>
            )}
          </div>
          {t.notes && <div className="mt-1 text-xs text-steel-400">{t.notes}</div>}
          {t.materialsRef && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-steel-500">
              <LinkIcon className="h-3 w-3" />
              {t.materialsRef}
            </div>
          )}
          {cost && (
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              {cost.lowTotal !== null && (
                <span className="rounded-md bg-moss-500/15 px-2 py-0.5 text-moss-400">
                  Low {fmtUSDPrecise(cost.lowTotal)}
                </span>
              )}
              {cost.highTotal !== null && (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-amber-300">
                  High {fmtUSDPrecise(cost.highTotal)}
                </span>
              )}
              {cost.actualAmount !== null && (
                <span className="rounded-md bg-slate2-500/20 px-2 py-0.5 text-slate2-400">
                  Actual {fmtUSDPrecise(cost.actualAmount)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-none items-center gap-1">
          <button
            onClick={() => setExpand((v) => !v)}
            className="rounded-md p-2 text-steel-300 hover:bg-white/5 hover:text-white"
            aria-label="Edit task"
          >
            <motion.span animate={{ rotate: expand ? 180 : 0 }} className="inline-block">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete task: ${t.task}?`)) onDelete(t.id);
            }}
            className="rounded-md p-2 text-steel-300 hover:bg-white/5 hover:text-rust-400"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
              <label className="col-span-2 block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Stage</span>
                <input
                  value={t.stage}
                  onChange={(e) => onUpdate(t.id, { stage: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Owner</span>
                <input
                  value={t.owner}
                  onChange={(e) => onUpdate(t.id, { owner: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Target date</span>
                <input
                  type="date"
                  value={t.targetDate}
                  onChange={(e) => onUpdate(t.id, { targetDate: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Task</span>
                <input
                  value={t.task}
                  onChange={(e) => onUpdate(t.id, { task: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Notes</span>
                <textarea
                  value={t.notes}
                  onChange={(e) => onUpdate(t.id, { notes: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Materials reference</span>
                <input
                  value={t.materialsRef}
                  onChange={(e) => onUpdate(t.id, { materialsRef: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AddTodoPopover = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (row: Omit<TodoLine, "id">) => void;
}) => {
  const [stage, setStage] = useState("Misc");
  const [task, setTask] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<TodoStatus>("not_started");
  const [targetDate, setTargetDate] = useState("");
  const [materialsRef, setMaterialsRef] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 32, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 32, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="card-soft w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add a task</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-steel-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              stage,
              task: task || "Untitled task",
              owner,
              status,
              targetDate,
              materialsRef,
              notes,
            });
            onClose();
          }}
        >
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Task</span>
            <input
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
              placeholder="e.g., Hang exterior lights"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Stage</span>
            <input
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Owner</span>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
              placeholder="Ry, Kenan, Otto…"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TodoStatus)}
              className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Target date</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
            />
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Materials reference</span>
            <input
              value={materialsRef}
              onChange={(e) => setMaterialsRef(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
            />
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-steel-400">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border border-white/10 bg-steel-800/60 px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
            />
          </label>
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-gradient-to-br from-amber-500 to-rust-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:from-amber-400 hover:to-rust-400"
          >
            Add task
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function Todos({
  data,
  updateTodo,
  addTodo,
  deleteTodo,
  cycleStatus,
}: {
  data: DashboardData;
  updateTodo: (id: string, patch: Partial<TodoLine>) => void;
  addTodo: (row: Omit<TodoLine, "id">) => void;
  deleteTodo: (id: string) => void;
  cycleStatus: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | TodoStatus>("all");
  const [adding, setAdding] = useState(false);

  const costLookup = useMemo(() => {
    const m = new Map<string, { lowTotal: number | null; highTotal: number | null; actualAmount: number | null }>();
    data.costs.forEach((c) =>
      m.set(c.id, {
        lowTotal: c.lowTotal,
        highTotal: c.highTotal,
        actualAmount: c.actualAmount,
      })
    );
    return m;
  }, [data.costs]);

  const filtered = useMemo(() => {
    if (filter === "all") return data.todos;
    return data.todos.filter((t) => t.status === filter);
  }, [data.todos, filter]);

  const byStage = useMemo(() => {
    const m = new Map<string, TodoLine[]>();
    filtered.forEach((t) => {
      const arr = m.get(t.stage) || [];
      arr.push(t);
      m.set(t.stage, arr);
    });
    return Array.from(m.entries());
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<"all" | TodoStatus, number> = {
      all: data.todos.length,
      not_started: 0,
      in_progress: 0,
      blocked: 0,
      done: 0,
    };
    data.todos.forEach((t) => (c[t.status] += 1));
    return c;
  }, [data.todos]);

  return (
    <div>
      {/* Header strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-soft mb-4 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-steel-400">Task list</div>
            <div className="mt-1 text-sm text-steel-300">
              Click the status dot to cycle through{" "}
              <span className="text-steel-200">Not started → In progress → Blocked → Done</span>.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-steel-400" />
            <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`relative rounded-md px-2.5 py-1.5 text-xs transition ${
                      active ? "text-white" : "text-steel-300 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="filter-pill"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="absolute inset-0 -z-0 rounded-md bg-amber-500/25"
                      />
                    )}
                    <span className="relative z-10">
                      {f.label}{" "}
                      <span className="ml-1 text-[10px] text-steel-400">{counts[f.key]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-amber-500 to-rust-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:from-amber-400 hover:to-rust-400"
            >
              <Plus className="h-4 w-4" /> Add task
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Grouped stage sections */}
      <div className="space-y-5">
        <AnimatePresence mode="popLayout">
          {byStage.map(([stage, items], gi) => (
            <motion.section
              key={stage}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: 0.04 * gi }}
              className="card-soft rounded-2xl p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-steel-100">{stage}</span>
                  <span className="text-xs text-steel-400">{items.length}</span>
                </div>
                <div className="text-xs text-steel-400">
                  {items.filter((t) => t.status === "done").length}/{items.length} done
                </div>
              </div>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {items.map((t) => (
                    <TodoRow
                      key={t.id}
                      t={t}
                      costLookup={costLookup}
                      onCycle={cycleStatus}
                      onUpdate={updateTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>

        {byStage.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-soft rounded-2xl p-10 text-center text-sm text-steel-300"
          >
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-amber-400" />
            Nothing under that filter — try another status.
          </motion.div>
        )}
      </div>

      <AnimatePresence>{adding && <AddTodoPopover onClose={() => setAdding(false)} onSave={(r) => addTodo(r)} />}</AnimatePresence>
    </div>
  );
}
