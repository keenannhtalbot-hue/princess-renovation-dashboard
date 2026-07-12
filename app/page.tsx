"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardData } from "../lib/useDashboardData";
import Overview from "../components/Overview";
import Costs from "../components/Costs";
import Todos from "../components/Todos";
import TabBar, { TabKey } from "../components/TabBar";
import Header from "../components/Header";
import {
  Download,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "overview", label: "Overview", hint: "Live project pulse" },
  { key: "costs", label: "Costs", hint: "Budget vs actual" },
  { key: "todos", label: "Tasks", hint: "Job list & status" },
];

export default function Page() {
  const dash = useDashboardData();
  const [tab, setTab] = useState<TabKey>("overview");
  const [importErr, setImportErr] = useState<string | null>(null);

  const onImport = async (file: File) => {
    setImportErr(null);
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      if (
        parsed &&
        Array.isArray(parsed.costs) &&
        Array.isArray(parsed.todos) &&
        parsed.meta
      ) {
        // apply via the hook by writing into localStorage and reloading
        window.localStorage.setItem(
          "princess-renovation-dashboard-v1",
          JSON.stringify(parsed)
        );
        window.location.hash = "";
        window.location.reload();
      } else {
        setImportErr("That JSON doesn't match the dashboard shape.");
      }
    } catch {
      setImportErr("Couldn't parse that file as JSON.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Header
        projectName={dash.data.meta.projectName}
        address={dash.data.meta.address}
        lastUpdated={dash.data.meta.lastUpdated}
      />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <TabBar tabs={TABS} value={tab} onChange={setTab} />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap items-center gap-2"
        >
          <button
            onClick={() => dash.exportJSON()}
            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-steel-100 transition hover:border-amber-400/60 hover:bg-white/10"
          >
            <Download className="h-4 w-4 transition group-hover:scale-110" /> Export
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-steel-100 transition hover:border-amber-400/60 hover:bg-white/10">
            <Upload className="h-4 w-4" /> Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
              }}
            />
          </label>
          <button
            onClick={() => dash.copyShareLink()}
            className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 transition hover:bg-amber-500/20"
          >
            <LinkIcon className="h-4 w-4" /> Share link
          </button>
          <button
            onClick={() => dash.resetAll()}
            className="flex items-center gap-2 rounded-lg border border-rust-400/40 bg-rust-500/10 px-3 py-2 text-sm text-rust-400 transition hover:bg-rust-500/20"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.section
            key="overview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <Overview data={dash.data} />
          </motion.section>
        )}
        {tab === "costs" && (
          <motion.section
            key="costs"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <Costs data={dash.data} updateCost={dash.updateCost} addCost={dash.addCost} deleteCost={dash.deleteCost} />
          </motion.section>
        )}
        {tab === "todos" && (
          <motion.section
            key="todos"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <Todos
              data={dash.data}
              updateTodo={dash.updateTodo}
              addTodo={dash.addTodo}
              deleteTodo={dash.deleteTodo}
              cycleStatus={dash.cycleStatus}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-16 flex items-center justify-between border-t border-white/5 pt-6 text-xs text-steel-400">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Built by Forge · data syncs to this browser
        </div>
        <div>{importErr && <span className="text-rust-400">{importErr}</span>}</div>
      </footer>
    </main>
  );
}
