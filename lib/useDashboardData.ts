"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DashboardData,
  SEED_DATA,
  CostLine,
  TodoLine,
  TodoStatus,
  STATUS_ORDER,
  STATUS_LABELS,
  computeTotals,
  fmtUSD,
} from "./seed";

const STORAGE_KEY = "princess-renovation-dashboard-v1";

// Tight upper bound on share-link size; anything bigger should use Export/Import.
// 16 KB keeps well below most chat/SMS caps and browser URL limits.
const SHARE_LINK_MAX_BYTES = 16_000;

const isBrowser = () => typeof window !== "undefined";

const VALID_STATUSES: TodoStatus[] = STATUS_ORDER;
const isStatus = (v: unknown): v is TodoStatus =>
  typeof v === "string" && (VALID_STATUSES as string[]).includes(v);

// ----- validators -----

const numOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const safeStr = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const sanitizeCost = (raw: unknown): CostLine | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = safeStr(r.id);
  if (!id) return null;
  const category = safeStr(r.category, "Misc");
  const item = safeStr(r.item, "Untitled line");
  const statusRaw = safeStr(r.status, "Allowance");
  const validStatuses = ["Measured", "Allowance", "Estimate", "Open", "Verified", "Leave blank per Ry"];
  const status = (validStatuses as string[]).includes(statusRaw)
    ? (statusRaw as CostLine["status"])
    : "Allowance";
  return {
    id,
    category,
    item,
    scope: safeStr(r.scope),
    qty: numOrNull(r.qty),
    unit: safeStr(r.unit, "allowance"),
    lowUnit: numOrNull(r.lowUnit),
    highUnit: numOrNull(r.highUnit),
    lowTotal: numOrNull(r.lowTotal),
    highTotal: numOrNull(r.highTotal),
    status,
    notes: safeStr(r.notes),
    actualAmount: numOrNull(r.actualAmount),
    actualDate: safeStr(r.actualDate),
    actualVendor: safeStr(r.actualVendor),
    actualNotes: safeStr(r.actualNotes),
  };
};

const sanitizeTodo = (raw: unknown): TodoLine | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = safeStr(r.id);
  if (!id) return null;
  return {
    id,
    stage: safeStr(r.stage, "Misc"),
    task: safeStr(r.task, "Untitled task"),
    owner: safeStr(r.owner),
    status: isStatus(r.status) ? r.status : "not_started",
    targetDate: safeStr(r.targetDate),
    materialsRef: safeStr(r.materialsRef),
    notes: safeStr(r.notes),
    costLineId: typeof r.costLineId === "string" ? r.costLineId : undefined,
  };
};

const sanitizeDashboard = (raw: unknown): DashboardData | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const costsIn = Array.isArray(r.costs) ? r.costs : [];
  const todosIn = Array.isArray(r.todos) ? r.todos : [];
  const costs = costsIn.map(sanitizeCost).filter((x): x is CostLine => x !== null);
  const todos = todosIn.map(sanitizeTodo).filter((x): x is TodoLine => x !== null);
  if (costs.length === 0 && todos.length === 0) return null;
  const metaIn = (r.meta && typeof r.meta === "object" ? r.meta : {}) as Record<string, unknown>;
  return {
    meta: {
      projectName: safeStr(metaIn.projectName, "32 Princess Renovation"),
      address: safeStr(metaIn.address, "32 Princess St, Orangeville, ON"),
      lastUpdated: safeStr(metaIn.lastUpdated, new Date().toISOString().slice(0, 10)),
      subtotalNote: safeStr(
        metaIn.subtotalNote,
        "Filled material estimate subtotal range. Open / TBD rows not included."
      ),
      drawingNotes: Array.isArray(metaIn.drawingNotes)
        ? (metaIn.drawingNotes as unknown[]).filter((x) => typeof x === "string")
        : [],
    },
    costs,
    todos,
  };
};

// Returns the incoming dashboard from URL hash, or null on any failure / size issue.
const readHashData = (): { ok: true; data: DashboardData } | { ok: false; reason: string } => {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("data=")) return { ok: false, reason: "no-hash" };
    const raw = hash.slice(5);
    if (raw.length > SHARE_LINK_MAX_BYTES) {
      return { ok: false, reason: "hash-too-large" };
    }
    const json = decodeURIComponent(escape(atob(raw)));
    const parsed = JSON.parse(json);
    const clean = sanitizeDashboard(parsed);
    if (!clean) return { ok: false, reason: "shape-invalid" };
    return { ok: true, data: clean };
  } catch {
    return { ok: false, reason: "parse-failed" };
  }
};

const readStoredData = (): DashboardData | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return sanitizeDashboard(parsed);
  } catch {
    return null;
  }
};

// Determine whether two dashboards are "materially different" (i.e. worth warning
// before clobbering with an inbound shared link).
const differ = (a: DashboardData, b: DashboardData): boolean => {
  return JSON.stringify(a.costs) !== JSON.stringify(b.costs) ||
    JSON.stringify(a.todos) !== JSON.stringify(b.todos);
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(SEED_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [shareParseError, setShareParseError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredData();
    const incoming = readHashData();

    if (incoming.ok) {
      // If we have local edits that differ from the inbound shared state, confirm
      // before clobbering. Otherwise apply directly.
      if (stored && differ(stored, incoming.data)) {
        const localTotals = computeTotals(stored.costs);
        const incomingTotals = computeTotals(incoming.data.costs);
        const msg =
          `Someone shared a dashboard with you.\n\n` +
          `Their total actual spend: ${fmtUSD(incomingTotals.actualTotal)}\n` +
          `Your current actual spend: ${fmtUSD(localTotals.actualTotal)}\n\n` +
          `Loading the shared link will REPLACE your local edits.\n\n` +
          `OK = replace your data with the shared snapshot.\n` +
          `Cancel = keep your local data (the link will be ignored).`;
        if (confirm(msg)) {
          setData(incoming.data);
        } else {
          setData(stored);
          // Strip the hash so the link doesn't keep prompting on refresh.
          try {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          } catch {}
        }
      } else {
        setData(incoming.data);
      }
    } else if (incoming.ok === false) {
      // Hash present but unparseable or too big — warn so the user doesn't lose data silently.
      if (incoming.reason === "hash-too-large") {
        setShareParseError(
          "That share link is too long for a URL — use Export → Import JSON instead."
        );
      } else if (incoming.reason === "parse-failed" || incoming.reason === "shape-invalid") {
        setShareParseError(
          "That share link is corrupted. We loaded your local data instead."
        );
      }
      setData(stored ?? SEED_DATA);
    } else {
      setData(stored ?? SEED_DATA);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota errors */
    }
  }, [data, hydrated]);

  // ----- mutators -----
  const updateCost = useCallback((id: string, patch: Partial<CostLine>) => {
    setData((d) => ({
      ...d,
      costs: d.costs.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const addCost = useCallback((row: Omit<CostLine, "id">) => {
    setData((d) => {
      const id = `cost-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        ...d,
        costs: [...d.costs, { ...row, id }],
        meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
      };
    });
  }, []);

  const deleteCost = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      costs: d.costs.filter((r) => r.id !== id),
      meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const updateTodo = useCallback((id: string, patch: Partial<TodoLine>) => {
    setData((d) => ({
      ...d,
      todos: d.todos.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const addTodo = useCallback((row: Omit<TodoLine, "id">) => {
    setData((d) => {
      const id = `todo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        ...d,
        todos: [...d.todos, { ...row, id }],
        meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
      };
    });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      todos: d.todos.filter((r) => r.id !== id),
      meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const cycleStatus = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      todos: d.todos.map((row) => {
        if (row.id !== id) return row;
        // Defensive: if status is somehow invalid, treat as not_started.
        const current: TodoStatus = isStatus(row.status) ? row.status : "not_started";
        const i = (VALID_STATUSES as readonly TodoStatus[]).indexOf(current);
        const next = VALID_STATUSES[(i + 1) % VALID_STATUSES.length];
        return { ...row, status: next };
      }),
      meta: { ...d.meta, lastUpdated: new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const resetAll = useCallback(() => {
    if (!isBrowser()) return;
    if (!confirm("Reset to the seed data from the PDFs? This wipes your edits.")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.hash = "";
    setData(SEED_DATA);
  }, []);

  const exportJSON = useCallback(() => {
    if (!isBrowser()) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `princess-renovation-${data.meta.lastUpdated}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJSON = useCallback((rawData: DashboardData) => {
    const clean = sanitizeDashboard(rawData);
    if (clean) setData(clean);
  }, []);

  const importJSONFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const clean = sanitizeDashboard(parsed);
        if (clean) setData(clean);
        else alert("That JSON doesn't look like a dashboard file.");
      } catch {
        alert("Couldn't parse that file as JSON.");
      }
    };
    reader.readAsText(file);
  }, []);

  const shareLink = useMemo(() => {
    if (!isBrowser()) return { url: "", tooLarge: false };
    try {
      const json = JSON.stringify(data);
      // Pre-encode and check size BEFORE producing the URL so the UI can warn.
      const b64 = btoa(unescape(encodeURIComponent(json)));
      const base = `${window.location.origin}${window.location.pathname}`;
      return { url: `${base}#data=${b64}`, tooLarge: b64.length > SHARE_LINK_MAX_BYTES };
    } catch {
      return { url: "", tooLarge: false };
    }
  }, [data]);

  const copyShareLink = useCallback(async () => {
    if (!shareLink.url) return;
    if (shareLink.tooLarge) {
      alert(
        "This dashboard is too big for a share link. Use Export → Import JSON instead."
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink.url);
      alert(
        "Share link copied. Send it to Ry / Kenan / Otto — they'll see your latest state and get a confirmation before their own edits are replaced."
      );
    } catch {
      prompt("Copy this link:", shareLink.url);
    }
  }, [shareLink]);

  const dismissShareError = useCallback(() => setShareParseError(null), []);

  return {
    data,
    hydrated,
    shareParseError,
    dismissShareError,
    updateCost,
    addCost,
    deleteCost,
    updateTodo,
    addTodo,
    deleteTodo,
    cycleStatus,
    resetAll,
    exportJSON,
    importJSON,
    importJSONFromFile,
    shareLink,
    copyShareLink,
  };
};

export { STATUS_LABELS };
