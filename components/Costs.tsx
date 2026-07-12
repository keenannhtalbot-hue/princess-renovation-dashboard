"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CostLine, DashboardData, computeTotals, fmtUSD, fmtUSDPrecise } from "../lib/seed";
import { Pencil, Trash2, Plus, X, AlertCircle, Sparkles, Search } from "lucide-react";

const CATEGORY_COLOR: Record<string, string> = {
  Context: "bg-steel-500/20 text-steel-200 border-steel-400/30",
  Subfloor: "bg-moss-500/20 text-moss-400 border-moss-400/30",
  Drywall: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  Insulation: "bg-slate2-500/20 text-slate2-400 border-slate2-400/30",
  Roof: "bg-rust-500/20 text-rust-400 border-rust-400/30",
  Exterior: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  Flooring: "bg-moss-500/20 text-moss-400 border-moss-400/30",
  "Interior doors": "bg-slate2-500/20 text-slate2-400 border-slate2-400/30",
  "Trim / baseboard": "bg-slate2-500/20 text-slate2-400 border-slate2-400/30",
  Paint: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  "Bath fixtures": "bg-slate2-500/20 text-slate2-400 border-slate2-400/30",
  Kitchen: "bg-moss-500/20 text-moss-400 border-moss-400/30",
  "Heated floor": "bg-rust-500/20 text-rust-400 border-rust-400/30",
  HVAC: "bg-slate2-500/20 text-slate2-400 border-slate2-400/30",
  Contingency: "bg-steel-500/20 text-steel-200 border-steel-400/30",
  Misc: "bg-steel-500/20 text-steel-200 border-steel-400/30",
};

const ActualPopover = ({
  row,
  onClose,
  onSave,
}: {
  row: CostLine;
  onClose: () => void;
  onSave: (patch: Partial<CostLine>) => void;
}) => {
  const [amount, setAmount] = useState<string>(
    row.actualAmount !== null ? String(row.actualAmount) : ""
  );
  const [date, setDate] = useState<string>(row.actualDate || "");
  const [vendor, setVendor] = useState<string>(row.actualVendor || "");
  const [notes, setNotes] = useState<string>(row.actualNotes || "");

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
        <div className="mb-1 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-steel-400">Actual cost entry</div>
            <h3 className="mt-1 text-lg font-semibold">{row.item}</h3>
            <p className="text-sm text-steel-300">{row.scope}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-steel-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">
              Amount (USD)
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-steel-400">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-white/10 bg-steel-800/60 py-2 pl-7 pr-3 text-sm outline-none focus:border-amber-400/60"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">
              Date purchased
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">
              Vendor
            </span>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Home Depot, IKEA…"
              className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
            />
          </label>

          <label className="col-span-2 block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">
              Receipt / line-item notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="SKU, qty, taxes paid, who picked up…"
              className="w-full resize-none rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onSave({ actualAmount: null, actualDate: "", actualVendor: "", actualNotes: "" });
              onClose();
            }}
            className="text-xs text-rust-400 hover:underline"
          >
            Clear actual
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                const num = amount === "" ? null : Number(amount);
                onSave({
                  actualAmount: Number.isFinite(num as number) ? num : null,
                  actualDate: date,
                  actualVendor: vendor,
                  actualNotes: notes,
                });
                onClose();
              }}
              className="rounded-lg bg-gradient-to-br from-amber-500 to-rust-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:from-amber-400 hover:to-rust-400"
            >
              Save
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AddCostPopover = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (row: Omit<CostLine, "id">) => void;
}) => {
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
          <h3 className="text-lg font-semibold">Add a cost line</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-steel-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <NewCostForm
          onSubmit={(row) => {
            onSave(row);
            onClose();
          }}
        />
      </motion.div>
    </motion.div>
  );
};

const NewCostForm = ({
  onSubmit,
}: {
  onSubmit: (row: Omit<CostLine, "id">) => void;
}) => {
  const [category, setCategory] = useState("Misc");
  const [item, setItem] = useState("");
  const [scope, setScope] = useState("");
  const [qty, setQty] = useState<string>("");
  const [unit, setUnit] = useState("allowance");
  const [low, setLow] = useState<string>("");
  const [high, setHigh] = useState<string>("");
  const [status, setStatus] = useState<CostLine["status"]>("Allowance");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const lo = low === "" ? null : Number(low);
        const hi = high === "" ? null : Number(high);
        const q = qty === "" ? null : Number(qty);
        onSubmit({
          category,
          item: item || "Untitled line",
          scope,
          qty: Number.isFinite(q as number) ? q : null,
          unit: unit || "allowance",
          lowUnit: null,
          highUnit: null,
          lowTotal: Number.isFinite(lo as number) ? lo : null,
          highTotal: Number.isFinite(hi as number) ? hi : null,
          status,
          notes,
          actualAmount: null,
          actualDate: "",
          actualVendor: "",
          actualNotes: "",
        });
      }}
    >
      <label className="col-span-1 block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Category</span>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <label className="col-span-1 block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CostLine["status"])}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        >
          {["Measured", "Allowance", "Estimate", "Open", "Verified", "Leave blank per Ry"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="col-span-2 block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Item</span>
        <input
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
          placeholder="e.g., Subfloor adhesive"
        />
      </label>
      <label className="col-span-2 block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Scope / description</span>
        <input
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Qty</span>
        <input
          value={qty}
          inputMode="decimal"
          onChange={(e) => setQty(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Unit</span>
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Low total</span>
        <input
          value={low}
          inputMode="decimal"
          onChange={(e) => setLow(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">High total</span>
        <input
          value={high}
          inputMode="decimal"
          onChange={(e) => setHigh(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <label className="col-span-2 block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-steel-400">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-white/10 bg-steel-800/60 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
      </label>
      <button
        type="submit"
        className="col-span-2 rounded-lg bg-gradient-to-br from-amber-500 to-rust-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:from-amber-400 hover:to-rust-400"
      >
        Add line
      </button>
    </form>
  );
};

export default function Costs({
  data,
  updateCost,
  addCost,
  deleteCost,
}: {
  data: DashboardData;
  updateCost: (id: string, patch: Partial<CostLine>) => void;
  addCost: (row: Omit<CostLine, "id">) => void;
  deleteCost: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.costs;
    return data.costs.filter(
      (c) =>
        c.item.toLowerCase().includes(q) ||
        c.scope.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.actualVendor || "").toLowerCase().includes(q)
    );
  }, [data.costs, query]);

  const totals = computeTotals(data.costs);

  // group by category
  const byCategory = useMemo(() => {
    const m = new Map<string, CostLine[]>();
    filtered.forEach((c) => {
      const arr = m.get(c.category) || [];
      arr.push(c);
      m.set(c.category, arr);
    });
    return Array.from(m.entries());
  }, [filtered]);

  const editingRow = editingId ? data.costs.find((c) => c.id === editingId) || null : null;

  return (
    <div>
      {/* Header strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-soft mb-4 grid grid-cols-2 gap-4 rounded-2xl p-4 sm:grid-cols-4 sm:p-6"
      >
        <Stat label="Low estimate" value={fmtUSD(totals.filledLow)} tone="moss" />
        <Stat label="High estimate" value={fmtUSD(totals.filledHigh)} tone="amber" />
        <Stat label="Actual spent" value={fmtUSD(totals.actualTotal)} tone="slate2" />
        <Stat
          label="Over/under midpoint"
          value={`${totals.actualTotal - (totals.filledLow + totals.filledHigh) / 2 < 0 ? "" : "+"}${fmtUSD(
            totals.actualTotal - (totals.filledLow + totals.filledHigh) / 2
          )}`}
          tone={
            totals.actualTotal - (totals.filledLow + totals.filledHigh) / 2 > 0 ? "rust" : "moss"
          }
        />
      </motion.div>

      {/* Search + add */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            placeholder="Search by item, vendor, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-steel-100 outline-none placeholder:text-steel-400 focus:border-amber-400/60"
          />
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-amber-500 to-rust-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:from-amber-400 hover:to-rust-400"
        >
          <Plus className="h-4 w-4" /> Add line
        </button>
      </motion.div>

      {/* Grouped tables */}
      <div className="space-y-6">
        {byCategory.map(([cat, rows], gi) => (
          <motion.section
            key={cat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * gi }}
            className="card-soft overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-md border px-2 py-1 text-xs ${CATEGORY_COLOR[cat] || "bg-steel-500/20 text-steel-200 border-steel-400/30"}`}
                >
                  {cat}
                </span>
                <span className="text-xs text-steel-400">{rows.length} line{rows.length !== 1 && "s"}</span>
              </div>
              <CategorySubtotal rows={rows} />
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-steel-400">
                    <th className="px-4 py-2 sm:px-6">Item</th>
                    <th className="px-3 py-2">Qty / Unit</th>
                    <th className="px-3 py-2">Low</th>
                    <th className="px-3 py-2">High</th>
                    <th className="px-3 py-2">Actual</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-4 py-2 sm:px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => {
                    const isTBD = r.status === "Open" || r.status === "Leave blank per Ry";
                    const overshoot = typeof r.actualAmount === "number" && r.highTotal && r.actualAmount > r.highTotal;
                    return (
                      <motion.tr
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: ri * 0.02 }}
                        className="group border-t border-white/[0.04] transition hover:bg-white/[0.025]"
                      >
                        <td className="px-4 py-3 align-top sm:px-6">
                          <div className="font-medium text-steel-50">{r.item}</div>
                          <div className="text-xs text-steel-400">{r.scope}</div>
                          {r.notes && (
                            <div className="mt-1 text-[11px] text-steel-500">{r.notes}</div>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top text-steel-200">
                          {r.qty ?? "—"}{" "}
                          <span className="text-steel-400">{r.unit}</span>
                        </td>
                        <td className="px-3 py-3 align-top text-moss-400">{fmtUSD(r.lowTotal)}</td>
                        <td className="px-3 py-3 align-top text-amber-300">{fmtUSD(r.highTotal)}</td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <motion.span
                              key={r.actualAmount ?? "none"}
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={
                                typeof r.actualAmount === "number"
                                  ? overshoot
                                    ? "font-medium text-rust-400"
                                    : "font-medium text-slate2-400"
                                  : "text-steel-500"
                              }
                            >
                              {typeof r.actualAmount === "number"
                                ? fmtUSDPrecise(r.actualAmount)
                                : "—"}
                            </motion.span>
                            {typeof r.actualAmount === "number" && r.actualDate && (
                              <span className="text-[10px] text-steel-400">
                                {r.actualDate}
                              </span>
                            )}
                          </div>
                          {typeof r.actualAmount === "number" && r.actualVendor && (
                            <div className="mt-1 text-[11px] text-steel-300">
                              🏷 {r.actualVendor}
                            </div>
                          )}
                          {r.actualNotes && (
                            <div className="mt-1 text-[11px] italic text-steel-400">
                              “{r.actualNotes}”
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span
                            className={`inline-block rounded-md border px-2 py-1 text-[11px] ${
                              isTBD
                                ? "border-rust-400/30 bg-rust-500/15 text-rust-400"
                                : "border-white/10 bg-white/5 text-steel-200"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-right sm:px-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingId(r.id)}
                              className="rounded-md p-2 text-steel-300 hover:bg-white/5 hover:text-amber-300"
                              aria-label="Edit actual"
                              title="Log actual cost"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${r.item}"?`)) deleteCost(r.id);
                              }}
                              className="rounded-md p-2 text-steel-300 hover:bg-white/5 hover:text-rust-400"
                              aria-label="Delete line"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        ))}
        {byCategory.length === 0 && (
          <div className="card-soft flex flex-col items-center justify-center rounded-2xl p-10 text-center">
            <AlertCircle className="mb-2 h-6 w-6 text-amber-400" />
            <div className="text-sm text-steel-300">No matching lines.</div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingRow && (
          <ActualPopover
            row={editingRow}
            onClose={() => setEditingId(null)}
            onSave={(patch) => updateCost(editingRow.id, patch)}
          />
        )}
        {adding && (
          <AddCostPopover
            onClose={() => setAdding(false)}
            onSave={(row) => addCost(row)}
          />
        )}
      </AnimatePresence>

      <p className="mt-6 flex items-center gap-2 text-xs text-steel-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        Click the pencil icon on any row to log what it actually cost. Filled rows count toward the
        subtotals; TBD/Open rows are excluded.
      </p>
    </div>
  );
}

const Stat = ({ label, value, tone }: { label: string; value: string; tone: "moss" | "amber" | "slate2" | "rust" }) => {
  const colors: Record<typeof tone, string> = {
    moss: "text-moss-400",
    amber: "text-amber-300",
    slate2: "text-slate2-400",
    rust: "text-rust-400",
  };
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-steel-400">{label}</div>
      <div className={`mt-1 text-lg font-semibold sm:text-2xl ${colors[tone]}`}>{value}</div>
    </div>
  );
};

const CategorySubtotal = ({ rows }: { rows: CostLine[] }) => {
  const lo = rows.reduce((s, r) => (r.lowTotal ? s + r.lowTotal : s), 0);
  const hi = rows.reduce((s, r) => (r.highTotal ? s + r.highTotal : s), 0);
  if (!lo && !hi) return <span className="text-xs text-steel-500">no estimate</span>;
  return (
    <div className="text-xs text-steel-300">
      <span className="text-moss-400">{fmtUSD(lo)}</span>
      <span className="mx-1 text-steel-500">–</span>
      <span className="text-amber-300">{fmtUSD(hi)}</span>
    </div>
  );
};
