"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Confetti particle ────────────────────────────────────────────────────────
const COLORS = ["#22c55e", "#4ade80", "#86efac", "#16a34a", "#bbf7d0", "#ffffff"];
const SHAPES = ["square", "rect", "circle"] as const;

function makeParticles(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 1.6 + Math.random() * 1.4,
    size: 5 + Math.random() * 9,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    rotate: Math.random() > 0.5 ? 540 : -540,
    drift: (Math.random() - 0.5) * 80,
  }));
}

function Confetti() {
  const particles = useRef(makeParticles(90)).current;
  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={p.shape === "circle" ? "rounded-full" : p.shape === "rect" ? "rounded-sm" : ""}
          style={{
            position: "absolute",
            left: `${p.x}vw`,
            top: -12,
            width: p.shape === "rect" ? p.size * 0.5 : p.size,
            height: p.size,
            background: p.color,
          }}
          initial={{ y: -12, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            x: p.drift,
            rotate: p.rotate,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            ease: "linear",
            opacity: { times: [0, 0.6, 0.85, 1] },
          }}
        />
      ))}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function EasterToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-10 left-1/2 z-[9999] -translate-x-1/2 max-w-sm w-[90vw]"
    >
      <div
        className="rounded-2xl border border-green-600/50 px-6 py-4 text-center shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #0d2218 0%, #0a1a0f 100%)",
          boxShadow: "0 0 40px rgba(34,197,94,0.25), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <p className="text-2xl mb-2">🌱</p>
        <p className="text-sm font-bold text-white mb-1">You found it.</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          This was built by{" "}
          <span className="text-green-400 font-semibold">Ilia Duda</span> over one week.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EasterEgg() {
  const [triggered, setTriggered] = useState(false);
  const bufferRef = useRef("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (triggered) return;
      // Only track printable characters
      if (e.key.length !== 1) return;
      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-8);
      if (bufferRef.current.includes("nucarbon")) {
        setTriggered(true);
        setTimeout(() => setTriggered(false), 4500);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [triggered]);

  return (
    <AnimatePresence>
      {triggered && (
        <>
          <Confetti key="confetti" />
          <EasterToast key="toast" />
        </>
      )}
    </AnimatePresence>
  );
}
