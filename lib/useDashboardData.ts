"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DashboardData, SEED_DATA, CostLine, TodoLine, TodoStatus } from "./seed";

const STORAGE_KEY = "princess-renovation-dashboard-v1";

const isBrowser = () => typeof window !== "undefined";

const readInitial = (): DashboardData => {
  if (!isBrowser()) return SEED_DATA;
  // Pull from URL hash first, then localStorage, then seed
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash.startsWith("data=")) {
      const json = decodeURIComponent(escape(atob(hash.slice(5))));
      const parsed = JSON.parse(json) as DashboardData;
      if (parsed && Array.isArray(parsed.costs) && Array.isArray(parsed.todos)) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardData;
      if (parsed && Array.isArray(parsed.costs) && Array.isArray(parsed.todos)) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return SEED_DATA;
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(SEED_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readInitial();
    setData(initial);
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
        const order: TodoStatus[] = ["not_started", "in_progress", "blocked", "done"];
        const next = order[(order.indexOf(row.status) + 1) % order.length];
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

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as DashboardData;
        if (parsed && Array.isArray(parsed.costs) && Array.isArray(parsed.todos)) {
          setData(parsed);
        } else {
          alert("That JSON doesn't look like a dashboard file.");
        }
      } catch {
        alert("Couldn't parse that file as JSON.");
      }
    };
    reader.readAsText(file);
  }, []);

  const shareLink = useMemo(() => {
    if (!isBrowser()) return "";
    try {
      const json = JSON.stringify(data);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      const base = `${window.location.origin}${window.location.pathname}`;
      return `${base}#data=${b64}`;
    } catch {
      return "";
    }
  }, [data]);

  const copyShareLink = useCallback(async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("Share link copied. Send it to Ry / Kenan / Otto and they’ll see your latest state.");
    } catch {
      prompt("Copy this link:", shareLink);
    }
  }, [shareLink]);

  return {
    data,
    hydrated,
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
    shareLink,
    copyShareLink,
  };
};
