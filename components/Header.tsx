"use client";

import { motion } from "framer-motion";

export default function Header({
  projectName,
  address,
  lastUpdated,
}: {
  projectName: string;
  address: string;
  lastUpdated: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10"
            aria-hidden
          >
            <span className="text-xl">🏠</span>
          </motion.div>
          <div className="flex flex-col">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              <span className="text-gradient">{projectName}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm text-steel-400"
            >
              {address}
            </motion.p>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="max-w-3xl text-sm text-steel-300"
        >
          A live project dashboard — track remaining material costs against actuals,
          fly through the to-do list, and keep everyone (Ry, Kenan, Otto) on the
          same page. Last refreshed {lastUpdated}.
        </motion.p>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-4 right-0 h-1 w-40 rounded-full shimmer-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{ transformOrigin: "right" }}
      />
    </motion.header>
  );
}