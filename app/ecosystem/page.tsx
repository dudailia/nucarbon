"use client";


import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { aiTools, calcDailyCO2Kg, calcTotalDailyCO2Kg, nuData } from "@/lib/data";

// ─── Category config ────────────────────────────────────────────────────────────
type CatKey = "Writing" | "Writing / Research" | "Coding" | "Research" | "Image" | "Audio";

const CATEGORY_STYLES: Record<
  CatKey,
  { bg: string; border: string; text: string; dot: string }
> = {
  Writing: {
    bg: "bg-blue-950/40",
    border: "border-blue-700/40",
    text: "text-blue-300",
    dot: "#60a5fa",
  },
  "Writing / Research": {
    bg: "bg-blue-950/30",
    border: "border-blue-600/30",
    text: "text-blue-300",
    dot: "#93c5fd",
  },
  Coding: {
    bg: "bg-purple-950/40",
    border: "border-purple-700/40",
    text: "text-purple-300",
    dot: "#c084fc",
  },
  Research: {
    bg: "bg-teal-950/40",
    border: "border-teal-700/40",
    text: "text-teal-300",
    dot: "#2dd4bf",
  },
  Image: {
    bg: "bg-amber-950/40",
    border: "border-amber-700/40",
    text: "text-amber-300",
    dot: "#fbbf24",
  },
  Audio: {
    bg: "bg-orange-950/40",
    border: "border-orange-700/40",
    text: "text-orange-300",
    dot: "#fb923c",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-green-950/30",
  border: "border-green-800/40",
  text: "text-green-300",
  dot: "#4ade80",
};

function catStyle(cat: string) {
  return CATEGORY_STYLES[cat as CatKey] ?? DEFAULT_STYLE;
}

// ─── Pre-computed values ────────────────────────────────────────────────────────
const maxEnergy = Math.max(...aiTools.map((t) => t.energyPerUseKwh));
const totalDailyCO2 = calcTotalDailyCO2Kg();

const chartData = aiTools
  .map((t) => ({
    name: t.name,
    co2: parseFloat(calcDailyCO2Kg(t).toFixed(2)),
    color: t.color,
  }))
  .sort((a, b) => b.co2 - a.co2);

const top3Pct = Math.round(
  (chartData.slice(0, 3).reduce((s, d) => s + d.co2, 0) / totalDailyCO2) * 100
);
const top3Names = chartData.slice(0, 3).map((d) => d.name);

// ─── Custom tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; co2: number; color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-green-800/50 bg-[#0d1f10] px-4 py-3 shadow-xl text-sm">
      <p className="font-bold text-white mb-1">{d.name}</p>
      <p className="text-green-400">
        <span className="font-black">{d.co2}</span>{" "}
        <span className="text-gray-500">kg CO₂ / day</span>
      </p>
    </div>
  );
}

// ─── Tool card ──────────────────────────────────────────────────────────────────
function ToolCard({ tool, index }: { tool: (typeof aiTools)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const cs = catStyle(tool.category);

  const energyBarPct = (tool.energyPerUseKwh / maxEnergy) * 100;
  const co2Per100g = (tool.energyPerUseKwh * 100 * nuData.co2PerKwhKg * 1000).toFixed(1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-4px)" : "translateY(0px)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${cs.dot}44`
          : "0 0 0 1px transparent",
      }}
      className={`relative flex flex-col gap-4 rounded-2xl border p-5 ${cs.bg} ${cs.border} cursor-default`}
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-white leading-tight truncate">{tool.name}</h3>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cs.bg} ${cs.text} border ${cs.border}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: cs.dot }}
            />
            {tool.category}
          </span>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-3xl font-black tabular-nums leading-none"
            style={{ color: cs.dot }}
          >
            {tool.estimatedDailyUsersPercent}%
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">
            daily adoption
          </div>
        </div>
      </div>

      {/* description — visible on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.p
            key="desc"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-gray-400 leading-relaxed overflow-hidden"
          >
            {tool.description}
          </motion.p>
        )}
      </AnimatePresence>

      {/* adoption tagline */}
      <p className="text-xs text-gray-500">
        ~<span className="text-gray-300 font-medium">
          {Math.round(24000 * tool.estimatedDailyUsersPercent / 100).toLocaleString()}
        </span>{" "}
        Northeastern community members use this daily
      </p>

      {/* energy bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-600">
          <span>Energy per use</span>
          <span className="font-mono text-gray-400">
            {(tool.energyPerUseKwh * 1000).toFixed(1)} Wh
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: cs.dot }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${energyBarPct}%` } : { width: 0 }}
            transition={{ duration: 0.9, delay: index * 0.06 + 0.25, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-700">
          <span>Low</span>
          <span>High (Midjourney)</span>
        </div>
      </div>

      {/* CO2 stat */}
      <div className="rounded-lg bg-black/20 px-3 py-2 flex items-center justify-between">
        <span className="text-[11px] text-gray-500">CO₂ per 100 uses</span>
        <span className="font-mono font-bold text-sm" style={{ color: cs.dot }}>
          {co2Per100g} g CO₂
        </span>
      </div>
    </motion.div>
  );
}

// ─── Bar chart section ──────────────────────────────────────────────────────────
function DailyEmissionsChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="w-full">
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="rgba(34,197,94,0.08)"
          />
          <XAxis
            type="number"
            tick={{ fill: "#4b5563", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v} kg`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: "#9ca3af", fontSize: 13, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="co2" radius={[0, 4, 4, 0]} isAnimationActive={inView} animationDuration={900} animationEasing="ease-out">
            {chartData.map((entry, i) => {
              // green gradient: darkest at top (highest), lightest at bottom
              const lightness = 35 + (i / (chartData.length - 1)) * 30;
              return (
                <Cell
                  key={entry.name}
                  fill={`hsl(142, 71%, ${lightness}%)`}
                />
              );
            })}
            {/* Value labels */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function EcosystemPage() {
  const sortedByAdoption = [...aiTools].sort(
    (a, b) => b.estimatedDailyUsersPercent - a.estimatedDailyUsersPercent
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* ── SECTION 1 · HEADER ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
          Research Dashboard · Spring 2026
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          The AI Ecosystem<br />
          <span className="text-green-400">at Northeastern</span>
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
          Estimated energy and carbon footprint by tool — based on published inference costs and
          estimated campus adoption rates. Hover any card to expand details.
        </p>

        {/* quick stats row */}
        <div className="mt-8 flex flex-wrap gap-5">
          {[
            { label: "Tools tracked", value: aiTools.length },
            {
              label: "Total campus daily CO₂",
              value: `${totalDailyCO2.toFixed(1)} kg`,
            },
            {
              label: "Highest-impact tool",
              value: chartData[0].name,
            },
            {
              label: "Most-used tool",
              value: sortedByAdoption[0].name,
            },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-green-900/30 bg-green-950/15 px-4 py-3">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">{label}</div>
              <div className="font-bold text-green-300">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── SECTION 2 · TOOL GRID ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">
              Tool-by-Tool Breakdown
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sorted by daily adoption rate · hover a card to see full description
            </p>
          </div>
          {/* category legend */}
          <div className="hidden md:flex flex-wrap gap-2 justify-end">
            {(Object.entries(CATEGORY_STYLES) as [CatKey, typeof DEFAULT_STYLE][])
              .filter(([k]) => aiTools.some((t) => t.category === k))
              .map(([cat, cs]) => (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cs.bg} ${cs.border} ${cs.text}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cs.dot }} />
                  {cat}
                </span>
              ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedByAdoption.map((tool, i) => (
            <ToolCard key={tool.name} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* ── SECTION 3 · BAR CHART ───────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-white mb-2">
            Estimated Daily Campus CO₂ by Tool
          </h2>
          <p className="text-sm text-gray-500 max-w-xl">
            Kilograms of CO₂ generated per day across all estimated users at Northeastern.
            Accounts for adoption rate, query volume, and per-tool energy intensity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="rounded-2xl border border-green-900/30 bg-[#0a180d] p-6 sm:p-8"
        >
          {/* axis label */}
          <p className="text-xs uppercase tracking-widest text-gray-700 mb-6 text-right pr-16">
            kg CO₂ / day →
          </p>
          <DailyEmissionsChart />

          {/* manual value labels — recharts cell labels need extra work, show as a legend table */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {chartData.map((d, i) => {
              const lightness = 35 + (i / (chartData.length - 1)) * 30;
              return (
                <div
                  key={d.name}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span className="text-xs text-gray-400 truncate">{d.name}</span>
                  <span
                    className="text-xs font-black font-mono shrink-0"
                    style={{ color: `hsl(142,71%,${lightness}%)` }}
                  >
                    {d.co2}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 4 · INSIGHT CALLOUT ─────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-green-600/25 bg-[#0d2218]">
          {/* glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(34,197,94,0.07) 0%, transparent 60%)",
            }}
          />
          {/* left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-green-600 to-green-900 rounded-l-2xl" />

          <div className="relative px-8 py-8 sm:px-10 sm:py-10">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-3xl font-black text-green-400 tabular-nums leading-none">
                {top3Pct}%
              </span>
              <div>
                <h3 className="text-lg font-black text-white leading-snug">
                  of all campus AI carbon comes from just 3 tools
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {top3Names.join(", ")}
                </p>
              </div>
            </div>

            <p className="text-base text-gray-300 leading-relaxed max-w-3xl">
              The top 3 tools account for{" "}
              <span className="font-bold text-green-400">{top3Pct}%</span> of all AI-related
              carbon at Northeastern. Shifting usage patterns — or negotiating
              carbon-offset agreements with vendors — could meaningfully reduce this footprint.
              For example, routing writing tasks toward lower-energy models like Grammarly or
              Claude (2 Wh/query vs. 20 Wh for image generation) would have an outsized impact.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {chartData.slice(0, 3).map((d, i) => {
                const pct = ((d.co2 / totalDailyCO2) * 100).toFixed(1);
                const lightness = 35 + (i / 2) * 20;
                return (
                  <div
                    key={d.name}
                    className="rounded-xl border border-green-900/30 bg-black/20 px-4 py-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-xs font-black rounded-full h-5 w-5 flex items-center justify-center"
                        style={{
                          background: `hsl(142,71%,${lightness}%)22`,
                          color: `hsl(142,71%,${lightness}%)`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="font-bold text-white text-sm">{d.name}</span>
                    </div>
                    <div
                      className="text-2xl font-black tabular-nums"
                      style={{ color: `hsl(142,71%,${lightness}%)` }}
                    >
                      {d.co2} kg
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {pct}% of daily campus AI CO₂
                    </div>
                    {/* mini bar */}
                    <div className="mt-3 h-1 w-full rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `hsl(142,71%,${lightness}%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/research-agenda"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-400"
              >
                See the Research Agenda
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href="/benchmarks"
                className="inline-flex items-center gap-2 rounded-lg border border-green-800/50 bg-green-950/30 px-5 py-2.5 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
              >
                View Full Benchmarks
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
