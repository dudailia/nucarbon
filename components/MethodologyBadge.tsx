"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FlaskConical } from "lucide-react";

export default function MethodologyBadge() {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Floating badge */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="fixed bottom-6 right-5 z-40 flex items-center gap-2 rounded-full border border-green-700/60 bg-[#0d2218]/90 px-4 py-2.5 text-xs font-semibold text-green-400 shadow-lg shadow-black/40 backdrop-blur-md transition-all hover:border-green-500/80 hover:bg-[#0d2218] hover:text-green-300 hover:shadow-green-900/20 active:scale-[0.97]"
        aria-label="Open data methodology information"
      >
        <FlaskConical className="h-3.5 w-3.5 shrink-0" />
        Data Methodology
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-xl p-4 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-0"
              role="dialog"
              aria-modal="true"
              aria-labelledby="methodology-title"
            >
              <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-[#0a1f10] shadow-2xl">
                {/* top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

                <div className="p-6 sm:p-8">
                  {/* header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-green-800/50 bg-green-950/50 p-2">
                        <FlaskConical className="h-5 w-5 text-green-400" />
                      </div>
                      <h2 id="methodology-title" className="text-lg font-black text-white">
                        Data Methodology
                      </h2>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="shrink-0 rounded-lg border border-green-900/40 bg-green-950/30 p-1.5 text-gray-500 transition-colors hover:border-green-700/50 hover:text-gray-300"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* disclaimer */}
                  <div className="mb-5 rounded-xl border border-yellow-800/30 bg-yellow-950/20 px-4 py-3">
                    <p className="text-xs font-semibold text-yellow-400 mb-1">Research prototype</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      All figures are estimates based on published research. This is not an
                      official Northeastern University publication.
                    </p>
                  </div>

                  {/* sources */}
                  <div className="space-y-3 mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
                      Primary Sources
                    </p>
                    {[
                      {
                        ref: "IEA World Energy Outlook 2024",
                        detail: "Global AI energy consumption projections and data center efficiency benchmarks.",
                      },
                      {
                        ref: "Strubell, Ganesh & McCallum (2019)",
                        detail: "\"Energy and Policy Considerations for Deep Learning in NLP\" — ACL 2019. Per-training and per-inference energy figures for large language models.",
                      },
                      {
                        ref: "EPA eGRID2021 — US average",
                        detail: "US average grid emission factor: 0.386 kg CO₂/kWh (852.3 lb CO₂e/MWh). Used to convert AI energy consumption to carbon equivalents.",
                      },
                      {
                        ref: "EDUCAUSE AI Horizon Report (2024)",
                        detail: "Student and faculty AI tool adoption rates at R1 universities. Basis for per-tool usage percentage estimates.",
                      },
                      {
                        ref: "Samsi et al. (2023) — MLCommons",
                        detail: "Inference energy benchmarks for GPT-4 class models on A100 hardware: 0.002–0.005 kWh/query range.",
                      },
                    ].map(({ ref, detail }) => (
                      <div key={ref} className="rounded-lg border border-green-900/20 bg-green-950/10 px-4 py-3">
                        <p className="text-sm font-semibold text-green-300 mb-1">{ref}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>

                  {/* formula */}
                  <div className="rounded-xl border border-green-900/30 bg-black/30 px-4 py-3 font-mono text-xs text-gray-500 leading-6">
                    <span className="text-green-600">daily_kg</span>
                    {" = users × queries/day × kWh/query × kg_CO₂/kWh"}<br />
                    <span className="text-gray-700">{"           "}</span>
                    <span className="text-green-700">{"= 24,000 × 8 × 0.003 × 0.386 = 222.3 kg/day"}</span>
                  </div>

                  <p className="mt-4 text-[11px] text-gray-700 leading-relaxed">
                    Uncertainty range: ±40% due to self-report bias in survey data and
                    hardware variability in published energy benchmarks.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
