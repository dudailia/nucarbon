"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("nucarbon-loaded")) return;
      sessionStorage.setItem("nucarbon-loaded", "1");
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1700);
      return () => clearTimeout(t);
    } catch {
      // sessionStorage blocked (private mode etc.)
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030807]"
        >
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute h-[500px] w-[500px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-5 mb-14"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-700/50 bg-green-950/60">
                <Leaf className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <span className="text-3xl font-black tracking-tight text-white">
                  NU<span className="text-green-400">Carbon</span>
                </span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="font-mono text-sm text-green-700 tracking-wider"
            >
              Calculating Northeastern&apos;s AI carbon footprint…
            </motion.p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="relative z-10 w-64"
          >
            <div className="h-px w-full bg-green-900/40 overflow-hidden rounded-full">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #166534, #22c55e, #4ade80)",
                }}
                initial={{ width: "0%", x: "-100%" }}
                animate={{ width: "100%", x: "0%" }}
                transition={{ duration: 1.3, ease: "easeInOut", delay: 0.1 }}
              />
            </div>

            {/* scanning dot */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-green-400"
              style={{ boxShadow: "0 0 8px #22c55e" }}
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.3, ease: "easeInOut", delay: 0.1 }}
            />
          </motion.div>

          {/* Version tag */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 mt-8 font-mono text-[11px] text-green-900 tracking-widest"
          >
            v1.0 · Spring 2026 · Northeastern University
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
