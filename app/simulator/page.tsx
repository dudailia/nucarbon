"use client";


import { useCallback, useEffect, useRef, useState } from "react";
import { motion, animate, AnimatePresence } from "framer-motion";
import { nuData } from "@/lib/data";

// ─── Constants ────────────────────────────────────────────────────────────────
const GRID_INTENSITY = nuData.co2PerKwhKg; // 0.386 kg/kWh
const SEMESTER_DAYS = 113;
const YEAR_DAYS = 273;

// Per-query energy by tier (kWh)
const E_HIGH = 0.02;   // image/video AI
const E_STD  = 0.003;  // standard LLM
const E_EFF  = 0.001;  // lightweight/efficient models

const PEER_DATA: Record<string, { name: string; annualKg: number }> = {
  peer:     { name: "Peer University Avg", annualKg: 52_000 },
  mit:      { name: "MIT",                 annualKg: 71_000 },
  harvard:  { name: "Harvard University",  annualKg: 63_000 },
  bu:       { name: "Boston University",   annualKg: 45_000 },
  stanford: { name: "Stanford University", annualKg: 89_000 },
};

// ─── Presets ──────────────────────────────────────────────────────────────────
type Preset = {
  label: string;
  sublabel: string;
  users: number;
  queriesPerDay: number;
  highEnergyPct: number;
  efficientPct: number;
  includeDataCenter: boolean;
  offsetActive: boolean;
};

const PRESETS: Preset[] = [
  {
    label: "Conservative",
    sublabel: "Minimal AI use",
    users: 4_000,
    queriesPerDay: 3,
    highEnergyPct: 5,
    efficientPct: 40,
    includeDataCenter: false,
    offsetActive: false,
  },
  {
    label: "Current Estimate",
    sublabel: "Default values",
    users: 12_000,
    queriesPerDay: 8,
    highEnergyPct: 15,
    efficientPct: 30,
    includeDataCenter: false,
    offsetActive: false,
  },
  {
    label: "2027 Projection",
    sublabel: "AI adoption doubles",
    users: 22_000,
    queriesPerDay: 20,
    highEnergyPct: 30,
    efficientPct: 20,
    includeDataCenter: true,
    offsetActive: false,
  },
  {
    label: "Best Case",
    sublabel: "Efficiency measures adopted",
    users: 22_000,
    queriesPerDay: 15,
    highEnergyPct: 8,
    efficientPct: 65,
    includeDataCenter: false,
    offsetActive: true,
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Smoothly animates a value from its current position to a new target. */
function useAnimatableSlider(initial: number) {
  const [value, setValue] = useState(initial);
  const currentRef = useRef(initial);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  const animateTo = useCallback((target: number) => {
    controlsRef.current?.stop();
    const from = currentRef.current;
    controlsRef.current = animate(from, target, {
      duration: 0.65,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        currentRef.current = v;
        setValue(v);
      },
    });
  }, []);

  const setDirect = useCallback((v: number) => {
    controlsRef.current?.stop();
    currentRef.current = v;
    setValue(v);
  }, []);

  return [value, animateTo, setDirect] as const;
}

/** Smoothly animates a display number to a new value. */
function useAnimatedDisplay(target: number) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (prevRef.current === target) return;
    controlsRef.current?.stop();
    const from = prevRef.current;
    controlsRef.current = animate(from, target, {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => { prevRef.current = target; },
    });
    return () => controlsRef.current?.stop();
  }, [target]);

  return display;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderControl({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </label>
        <span className="font-mono text-sm font-bold text-green-400 tabular-nums">
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-track w-full"
          style={{ "--fill": `${pct}%` } as React.CSSProperties}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-700">
        <span>{format(min)}</span>
        {hint && <span className="text-gray-600">{hint}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function ToggleControl({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
        value
          ? "border-green-600/50 bg-green-950/50"
          : "border-green-900/30 bg-white/[0.02] hover:border-green-800/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">{label}</p>
          <p className="text-[11px] text-gray-600 mt-0.5">{hint}</p>
        </div>
        <div
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            value ? "bg-green-500" : "bg-white/10"
          }`}
        >
          <motion.span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
            animate={{ left: value ? "calc(100% - 18px)" : "2px" }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </div>
      </div>
    </button>
  );
}

function MetricRow({
  label,
  value,
  unit,
  size = "normal",
  color = "white",
}: {
  label: string;
  value: number;
  unit: string;
  size?: "normal" | "large";
  color?: string;
}) {
  const display = useAnimatedDisplay(value);
  return (
    <div className="flex items-baseline justify-between gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="text-right">
        <span
          className={`font-black tabular-nums font-mono ${
            size === "large" ? "text-2xl" : "text-base"
          }`}
          style={{ color }}
        >
          {display >= 1_000_000
            ? `${(display / 1_000_000).toFixed(2)}M`
            : display >= 1_000
            ? display.toLocaleString("en-US", { maximumFractionDigits: 0 })
            : display.toFixed(1)}
        </span>
        <span className="ml-1.5 text-xs text-gray-600">{unit}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  // ── Slider state ────────────────────────────────────────────────────────────
  const [users,           animateUsers,           setUsers          ] = useAnimatableSlider(12_000);
  const [queriesPerDay,   animateQPD,             setQPD            ] = useAnimatableSlider(8);
  const [highEnergyPct,   animateHighEnergy,      setHighEnergy     ] = useAnimatableSlider(15);
  const [efficientPct,    animateEfficient,       setEfficient      ] = useAnimatableSlider(30);
  const [includeDataCenter, setIncludeDataCenter] = useState(false);
  const [offsetActive,      setOffsetActive]      = useState(false);
  const [compareWith,       setCompareWith]       = useState("peer");

  // ── Report state ─────────────────────────────────────────────────────────────
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText,    setReportText]    = useState<string | null>(null);
  const [reportError,   setReportError]   = useState<string | null>(null);
  const [activePreset,  setActivePreset]  = useState<number | null>(1); // "Current Estimate"

  // ── Core calculations ────────────────────────────────────────────────────────
  const stdPct = Math.max(0, 100 - highEnergyPct - efficientPct) / 100;
  const avgEnergyPerQuery =
    (highEnergyPct / 100) * E_HIGH +
    (efficientPct  / 100) * E_EFF  +
    stdPct                * E_STD;

  const rawDailyKwh  = users * queriesPerDay * avgEnergyPerQuery;
  const rawDailyCO2  = rawDailyKwh * GRID_INTENSITY;
  const withDC       = includeDataCenter ? rawDailyCO2 * 1.4 : rawDailyCO2;
  const dailyCO2     = offsetActive      ? withDC      * 0.75 : withDC;
  const semesterCO2  = dailyCO2  * SEMESTER_DAYS;
  const annualCO2    = dailyCO2  * YEAR_DAYS;

  // Equivalencies
  const flights      = annualCO2 / 1_500;
  const treesNeeded  = annualCO2 / 21;
  const carbonCost   = (annualCO2 / 1_000) * 50;  // $50/tonne

  // Status
  const status: "green" | "yellow" | "red" =
    semesterCO2 < 50_000  ? "green"  :
    semesterCO2 < 200_000 ? "yellow" : "red";

  const STATUS_CONFIG = {
    green:  { label: "LOW",      bg: "bg-green-950/60",  border: "border-green-600/40",  text: "text-green-400",  dot: "#22c55e", glow: "rgba(34,197,94,0.35)"  },
    yellow: { label: "MODERATE", bg: "bg-yellow-950/40", border: "border-yellow-600/40", text: "text-yellow-400", dot: "#facc15", glow: "rgba(250,204,21,0.35)"  },
    red:    { label: "HIGH",     bg: "bg-red-950/40",    border: "border-red-600/40",    text: "text-red-400",    dot: "#f87171", glow: "rgba(248,113,113,0.35)"  },
  };
  const cfg = STATUS_CONFIG[status];

  const VERDICT = {
    green:  "Northeastern's AI footprint is manageable and within best-practice ranges for research universities.",
    yellow: "Northeastern's AI footprint is growing — efficiency measures would have meaningful impact.",
    red:    "Northeastern's AI footprint is significant. This warrants institutional attention and a formal measurement program.",
  };

  // Comparison
  const peer = PEER_DATA[compareWith] ?? PEER_DATA.peer;
  const compMax = Math.max(annualCO2, peer.annualKg) * 1.15;
  const nuBarPct  = (annualCO2    / compMax) * 100;
  const peerBarPct = (peer.annualKg / compMax) * 100;

  // ── Preset apply ────────────────────────────────────────────────────────────
  function applyPreset(index: number) {
    const p = PRESETS[index];
    setActivePreset(index);
    animateUsers(p.users);
    animateQPD(p.queriesPerDay);
    animateHighEnergy(p.highEnergyPct);
    animateEfficient(p.efficientPct);
    setIncludeDataCenter(p.includeDataCenter);
    setOffsetActive(p.offsetActive);
    setReportText(null);
    setReportError(null);
  }

  // ── Generate report ──────────────────────────────────────────────────────────
  async function generateReport() {
    setReportLoading(true);
    setReportText(null);
    setReportError(null);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: Math.round(users),
          queriesPerDay: Math.round(queriesPerDay),
          highEnergyPct: Math.round(highEnergyPct),
          efficientPct: Math.round(efficientPct),
          includeDataCenter,
          offsetActive,
          compareWith,
          dailyCO2,
          semesterCO2,
          annualCO2,
          status,
        }),
      });
      const data = await res.json();
      if (data.error) setReportError(data.error);
      else setReportText(data.summary);
    } catch {
      setReportError("Network error — could not reach the API.");
    } finally {
      setReportLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-16">

      {/* ── SECTION 1 · HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
          Interactive Tool · Spring 2026
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          AI Carbon <span className="text-green-400">Simulator</span>
        </h1>
        <p className="text-base text-gray-400 leading-relaxed">
          Adjust assumptions and see how Northeastern&apos;s footprint changes in real time.
          Every slider update recalculates instantly — no page reload required.
        </p>
      </motion.div>

      {/* ── SECTION 2 · SIMULATOR ─────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">

        {/* LEFT: Control Panel */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-green-900/30 bg-[#0a180d] overflow-hidden">
            {/* panel header */}
            <div className="flex items-center gap-3 border-b border-green-900/30 px-5 py-3.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 ml-1">
                Control Panel — NU AI Carbon Model v1.0
              </span>
            </div>

            <div className="p-6 space-y-7">
              {/* Sliders */}
              <div className="space-y-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-green-800 pb-1 border-b border-green-900/20">
                  Usage parameters
                </p>
                <SliderControl
                  label="Campus AI users"
                  hint="of 24,000 total"
                  value={users}
                  min={1_000}
                  max={24_000}
                  step={100}
                  format={(v) => Math.round(v).toLocaleString()}
                  onChange={setUsers}
                />
                <SliderControl
                  label="Queries per person per day"
                  value={queriesPerDay}
                  min={1}
                  max={50}
                  format={(v) => `${Math.round(v)}`}
                  onChange={setQPD}
                />
                <SliderControl
                  label="% using high-energy tools (image/video AI)"
                  hint="e.g. Midjourney, Sora"
                  value={highEnergyPct}
                  min={0}
                  max={100}
                  format={(v) => `${Math.round(v)}%`}
                  onChange={setHighEnergy}
                />
                <SliderControl
                  label="% using efficient models"
                  hint="e.g. lightweight, on-device"
                  value={efficientPct}
                  min={0}
                  max={100}
                  format={(v) => `${Math.round(v)}%`}
                  onChange={setEfficient}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-green-800 pb-1 border-b border-green-900/20">
                  Adjustments
                </p>
                <ToggleControl
                  label="Include NU data center AI workloads"
                  hint="Research compute, hosted models — adds 40%"
                  value={includeDataCenter}
                  onChange={setIncludeDataCenter}
                />
                <ToggleControl
                  label="Carbon offset program active"
                  hint="Renewable energy credits, vendor agreements — subtracts 25%"
                  value={offsetActive}
                  onChange={setOffsetActive}
                />
              </div>

              {/* Comparison dropdown */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-green-800 pb-1 border-b border-green-900/20">
                  Peer comparison
                </p>
                <div className="relative">
                  <select
                    value={compareWith}
                    onChange={(e) => setCompareWith(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-green-900/40 bg-green-950/20 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-green-700/60 cursor-pointer"
                  >
                    <option value="peer">Peer University Average</option>
                    <option value="mit">MIT</option>
                    <option value="harvard">Harvard University</option>
                    <option value="bu">Boston University</option>
                    <option value="stanford">Stanford University</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Avg energy indicator */}
              <div className="rounded-xl bg-black/20 px-4 py-3">
                <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                  <span>Computed avg energy / query</span>
                  <span className="font-mono text-green-700">
                    {(avgEnergyPerQuery * 1000).toFixed(2)} Wh
                  </span>
                </div>
                <div className="text-[10px] text-gray-700">
                  {Math.round(highEnergyPct)}% × 20 Wh + {Math.round(efficientPct)}% × 1 Wh + {Math.round(Math.max(0, 100 - highEnergyPct - efficientPct))}% × 3 Wh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Output Panel */}
        <div className="space-y-4">
          {/* Status indicator */}
          <motion.div
            layout
            className={`rounded-2xl border px-5 py-4 ${cfg.bg} ${cfg.border}`}
            style={{ boxShadow: `0 0 30px ${cfg.glow}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Footprint Status
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="relative flex h-2.5 w-2.5"
                >
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: cfg.dot }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ background: cfg.dot }}
                  />
                </span>
                <span className={`text-sm font-black ${cfg.text}`}>{cfg.label}</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={`text-sm leading-relaxed ${cfg.text} opacity-80`}
              >
                {VERDICT[status]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Main metrics */}
          <div className="rounded-2xl border border-green-900/30 bg-[#0a180d] p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-800 mb-1 pb-2 border-b border-green-900/20">
              Emissions Output
            </p>
            <MetricRow label="Daily CO₂"    value={dailyCO2}    unit="kg"        size="large" color={cfg.dot} />
            <MetricRow label="Semester CO₂" value={semesterCO2} unit="kg"        size="large" color={cfg.dot} />
            <MetricRow label="Annual CO₂"   value={annualCO2}   unit="kg"        size="large" color={cfg.dot} />
          </div>

          {/* Equivalencies */}
          <div className="rounded-2xl border border-green-900/30 bg-[#0a180d] p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-800 mb-1 pb-2 border-b border-green-900/20">
              Equivalencies (annual)
            </p>
            <MetricRow label="Transatlantic flights"   value={flights}      unit="round trips" />
            <MetricRow label="Trees needed to offset"  value={treesNeeded}  unit="tree-years"  />
            <MetricRow label="Carbon cost @ $50/tonne" value={carbonCost}   unit="USD"         />
          </div>

          {/* Peer comparison */}
          <div className="rounded-2xl border border-green-900/30 bg-[#0a180d] p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-800 mb-4 pb-2 border-b border-green-900/20">
              vs. {peer.name}
            </p>
            <div className="space-y-3">
              {/* NU bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Northeastern (sim)</span>
                  <span className="font-mono text-green-400 font-bold">
                    {(annualCO2 / 1000).toFixed(1)} t/yr
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    animate={{ width: `${nuBarPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              {/* Peer bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">{peer.name}</span>
                  <span className="font-mono text-gray-500">
                    {(peer.annualKg / 1000).toFixed(1)} t/yr
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gray-600"
                    animate={{ width: `${peerBarPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-700 pt-1">
                Peer estimates are modelled projections, not confirmed figures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · PRESETS ───────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-xl font-black text-white mb-1">Scenario Presets</h2>
          <p className="text-sm text-gray-500">
            Snap all sliders to a preset configuration. Values animate smoothly.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESETS.map((preset, i) => {
            const isActive = activePreset === i;
            return (
              <button
                key={i}
                onClick={() => applyPreset(i)}
                className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                  isActive
                    ? "border-green-600/50 bg-green-950/40"
                    : "border-green-900/30 bg-[#0a180d] hover:border-green-800/50 hover:bg-green-950/20"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePreset"
                    className="absolute inset-0 rounded-2xl bg-green-500/5"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isActive ? "text-green-500" : "text-gray-700"
                      }`}
                    >
                      {["01","02","03","04"][i]}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-bold mb-1 ${isActive ? "text-green-300" : "text-white"}`}>
                    {preset.label}
                  </p>
                  <p className="text-[11px] text-gray-600">{preset.sublabel}</p>
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-700">
                    <span>{preset.users.toLocaleString()} users</span>
                    <span>{preset.queriesPerDay} q/day</span>
                    <span>{preset.highEnergyPct}% high-E</span>
                    <span>{preset.efficientPct}% efficient</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 4 · EXPORT / GENERATE REPORT ─────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-green-900/30 bg-[#0a180d] overflow-hidden"
        >
          <div className="border-b border-green-900/20 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white">Generate Report Snapshot</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Uses Claude AI to write a 3-sentence executive summary for a provost briefing,
                based on current simulator values.
              </p>
            </div>
            <button
              onClick={generateReport}
              disabled={reportLoading}
              className="shrink-0 flex items-center gap-2.5 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-400 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Generate Report Snapshot
                </>
              )}
            </button>
          </div>

          {/* Current state preview */}
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-green-900/15 bg-black/10">
            {[
              { label: "Users", value: `${Math.round(users).toLocaleString()}` },
              { label: "Queries/day", value: `${Math.round(queriesPerDay)}` },
              { label: "Semester CO₂", value: `${(semesterCO2 / 1000).toFixed(1)} t` },
              { label: "Status", value: status.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-700">{label}</div>
                <div className="text-sm font-black text-green-400 font-mono">{value}</div>
              </div>
            ))}
          </div>

          {/* Report output */}
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              {!reportText && !reportError && !reportLoading && (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-700 italic"
                >
                  Click &ldquo;Generate Report Snapshot&rdquo; to create an AI-written executive summary
                  based on the current simulation state.
                </motion.p>
              )}

              {reportLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-sm text-green-600"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-green-500"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                  Claude is writing your provost briefing…
                </motion.div>
              )}

              {reportError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3"
                >
                  <p className="text-xs font-semibold text-red-400 mb-1">API Error</p>
                  <p className="text-sm text-gray-400">{reportError}</p>
                  <p className="text-xs text-gray-700 mt-2">
                    To enable this feature, set{" "}
                    <code className="text-green-700">ANTHROPIC_API_KEY</code> in your Vercel
                    environment variables and redeploy.
                  </p>
                </motion.div>
              )}

              {reportText && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-800 rounded-full" />
                  <div className="pl-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-green-700 mb-3">
                      Executive Summary — Provost Briefing
                    </p>
                    <p className="text-base text-gray-200 leading-relaxed">{reportText}</p>
                    <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 text-green-800">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Generated by Claude claude-sonnet-4-6 · Based on current simulation state ·{" "}
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
