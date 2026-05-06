"use client";


import { useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { nuData, totalUsers } from "@/lib/data";
import Link from "next/link";

// ─── Core numbers ────────────────────────────────────────────────────────────
const DAILY_KG =
  totalUsers *
  nuData.avgQueriesPerPersonPerDay *
  nuData.energyPerQueryKwh *
  nuData.co2PerKwhKg;

function semesterKgNow(): number {
  const start = new Date(nuData.semesterStartDate).getTime();
  const days = Math.max(0, (Date.now() - start) / 86_400_000);
  return DAILY_KG * days;
}

const SEMESTER_KG = semesterKgNow();

// ─── Timeline data (Sept → May, academic year) ────────────────────────────────
const MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const DAYS_INTO_YEAR = [0, 30, 61, 91, 122, 153, 181, 212, 242];
const timelineData = MONTHS.map((month, i) => {
  const d = DAYS_INTO_YEAR[i];
  return {
    month,
    baseline: Math.round(DAILY_KG * d),
    optimized: Math.round(DAILY_KG * d * 0.7),
  };
});

// ─── Comparison definitions ──────────────────────────────────────────────────
const comparisons = [
  {
    id: "flights",
    label: "Transatlantic round trips",
    statement: (n: number) =>
      `Equivalent to ${n.toLocaleString()} Boston → London round trips`,
    insight:
      "Each transatlantic flight emits roughly 1,500 kg CO₂ per passenger. Northeastern's semester AI footprint equals that many flights.",
    value: (kg: number) => Math.round(kg / 1500),
    barMax: 50,
    barColor: "#22c55e",
    source: "ICAO Carbon Calculator",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <path
          d="M14 46 L44 26 C47 24 51 23 54 25 L62 30 C64 31 64 34 62 35 L54 38 L56 50 C57 51 56 53 54 53 L48 53 L44 44 L34 47 L35 52 C35 53 34 54 33 54 L28 54 C27 54 26 53 26 52 L24 46 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path d="M14 46 L24 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 58 C30 56 34 56 38 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "drives",
    label: "Boston → New York City drives",
    statement: (n: number) =>
      `Equivalent to ${n.toLocaleString()} drives from Boston to New York`,
    insight:
      "A round-trip Boston–NYC drive in an average car emits ~70 kg CO₂. This many trips would stretch end-to-end across Massachusetts.",
    value: (kg: number) => Math.round(kg / 70),
    barMax: 2000,
    barColor: "#4ade80",
    source: "EPA Fuel Economy Guide",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="18" y="38" width="44" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M24 38 L30 28 L52 28 L58 38" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
        <circle cx="28" cy="55" r="5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <circle cx="52" cy="55" r="5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <path d="M33 55 L47 55" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <rect x="36" y="32" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M22 44 L58 44" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: "netflix",
    label: "Hours of Netflix streaming",
    statement: (n: number) =>
      `Equivalent to ${(n / 1_000_000).toFixed(1)}M hours of Netflix streaming`,
    insight:
      "SD video streaming uses ~0.036 kg CO₂ per hour. This semester's AI usage equals the streaming footprint of the entire NU community watching nonstop for weeks.",
    value: (kg: number) => Math.round(kg / 0.036),
    barMax: 2_000_000,
    barColor: "#86efac",
    source: "Carbon Trust Streaming Report (2023)",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="16" y="24" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="20" y="28" width="40" height="24" rx="2" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.08" />
        <path d="M30 40 L44 40 M37 34 L37 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 57 L44 57" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 56 L40 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="37" cy="40" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M35 38 L35 42 L41 40 Z" fill="currentColor" fillOpacity="0.6" />
      </svg>
    ),
  },
  {
    id: "trees",
    label: "Tree-years to offset",
    statement: (n: number) =>
      `Would require ${n.toLocaleString()} trees growing for one full year to absorb`,
    insight:
      "A mature tree absorbs roughly 21 kg of CO₂ per year. Fully offsetting one semester of NU's AI footprint would require a forest of this many trees.",
    value: (kg: number) => Math.round(kg / 21),
    barMax: 5000,
    barColor: "#16a34a",
    source: "US Forest Service Carbon Sequestration",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <path d="M40 62 L40 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 52 L33 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 46 L47 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="30" r="13" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
        <circle cx="30" cy="35" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
        <circle cx="50" cy="35" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
        <path d="M30 62 L50 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "phones",
    label: "Smartphones fully charged",
    statement: (n: number) =>
      `Equivalent to charging ${(n / 1_000_000).toFixed(1)}M smartphones to 100%`,
    insight:
      "Charging a modern smartphone once emits ~0.0082 kg CO₂. Stacked end-to-end, this many phones would circle the Earth several times over.",
    value: (kg: number) => Math.round(kg / 0.00822),
    barMax: 5_000_000,
    barColor: "#22c55e",
    source: "EPA eGRID + IEA device efficiency data",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="28" y="18" width="24" height="44" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="31" y="22" width="18" height="30" rx="2" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.08" />
        <circle cx="40" cy="57" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M36 18 L44 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* lightning bolt */}
        <path d="M42 31 L38 38 L41 38 L38 47 L44 37 L41 37 Z" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    ),
  },
];

// ─── Animated count-up ───────────────────────────────────────────────────────
function CountUp({ to, format }: { to: number; format: (n: number) => string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{format(val)}</span>;
}

// ─── Comparison card ─────────────────────────────────────────────────────────
function ComparisonCard({ comp }: { comp: (typeof comparisons)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count = comp.value(SEMESTER_KG);
  const barPct = Math.min(100, (count / comp.barMax) * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-green-900/30 bg-[#0d1f10]"
    >
      {/* left color accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: comp.barColor }}
      />

      <div className="pl-7 pr-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
          {/* icon */}
          <div
            className="shrink-0 h-20 w-20 sm:h-24 sm:w-24"
            style={{ color: comp.barColor }}
          >
            {comp.icon}
          </div>

          {/* content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* big statement */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">
                {comp.label}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white leading-tight">
                <CountUp
                  to={count}
                  format={(n) =>
                    comp.statement(Math.floor(n))
                  }
                />
              </p>
            </div>

            {/* progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Scale indicator</span>
                <span className="font-mono" style={{ color: comp.barColor }}>
                  {barPct.toFixed(0)}% of reference scale
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: comp.barColor }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${barPct}%` } : { width: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <p className="text-[11px] text-gray-700">
                Reference scale: {comp.barMax.toLocaleString()} {comp.label.toLowerCase()}
              </p>
            </div>

            {/* insight */}
            <div
              className="rounded-lg px-4 py-3 text-sm text-gray-300 leading-relaxed"
              style={{ background: `${comp.barColor}0d` }}
            >
              <span className="font-semibold" style={{ color: comp.barColor }}>
                So what?{" "}
              </span>
              {comp.insight}
            </div>

            {/* source */}
            <p className="text-[11px] text-gray-700">
              Source: {comp.source}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-green-800/40 bg-[#0a180d] px-4 py-3 shadow-2xl text-sm space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-400">{p.name}</span>
          </div>
          <span className="font-black font-mono text-white">
            {p.value.toLocaleString()} kg
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="h-0.5 w-8 bg-green-400 rounded" />
        <span className="text-gray-400">Current trajectory</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-0.5 w-8 border-t-2 border-dashed border-green-700" />
        <span className="text-gray-400">With 30% efficiency improvement</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BenchmarksPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: true, margin: "-80px" });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-24">

      {/* ── SECTION 1 · HEADER ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
          Contextual benchmarks
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          What does Northeastern&apos;s<br />
          <span className="text-green-400">AI footprint actually mean?</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl leading-relaxed mb-8">
          Putting the numbers in context. The semester total of{" "}
          <span className="font-bold text-green-400">
            {Math.round(SEMESTER_KG).toLocaleString()} kg CO₂
          </span>{" "}
          is hard to hold in your head — so here are five things it&apos;s equivalent to.
        </p>
        <div className="inline-flex items-center gap-3 rounded-xl border border-green-900/30 bg-green-950/15 px-5 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-400">
            Semester total as of today:{" "}
            <span className="font-black text-white">
              {Math.round(SEMESTER_KG).toLocaleString()} kg CO₂
            </span>
          </span>
          <span className="text-xs text-gray-700">({DAILY_KG.toFixed(1)} kg/day)</span>
        </div>
      </motion.div>

      {/* ── SECTION 2 · COMPARISON CARDS ────────────────────────────────── */}
      <section className="space-y-5">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-2">Five Ways to Feel the Number</h2>
          <p className="text-sm text-gray-500">
            All equivalencies use published emissions factors. Bars show the count as a fraction of a reference scale.
          </p>
        </div>
        {comparisons.map((comp) => (
          <ComparisonCard key={comp.id} comp={comp} />
        ))}
      </section>

      {/* ── SECTION 3 · TIMELINE CHART ──────────────────────────────────── */}
      <section ref={chartRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={chartInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-white mb-2">
            Cumulative CO₂ Across the Academic Year
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Projected growth from September to May at current rates — and what a 30% efficiency
            improvement (lighter-weight models, fewer unnecessary queries) would look like.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={chartInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="rounded-2xl border border-green-900/30 bg-[#0a180d] p-6 sm:p-8"
        >
          <ResponsiveContainer width="100%" height={380}>
            <LineChart
              data={timelineData}
              margin={{ top: 20, right: 32, left: 16, bottom: 10 }}
            >
              <defs>
                <linearGradient id="baselineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#166534" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 4"
                stroke="rgba(34,197,94,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
                tick={{ fill: "#4b5563", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* "Potential savings" gap label — approximate midpoint */}
              <ReferenceLine
                x="Mar"
                stroke="rgba(34,197,94,0.15)"
                strokeDasharray="4 4"
                label={{
                  value: "← Potential savings with efficiency measures",
                  position: "insideTopRight",
                  fill: "#16a34a",
                  fontSize: 11,
                }}
              />

              <Line
                type="monotone"
                dataKey="baseline"
                name="Current trajectory"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
                isAnimationActive={chartInView}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="optimized"
                name="With 30% efficiency improvement"
                stroke="#166534"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ fill: "#166534", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#16a34a" }}
                isAnimationActive={chartInView}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
          <CustomLegend />

          {/* Savings callout below chart */}
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "End-of-year baseline",
                value: `${Math.round(DAILY_KG * 273).toLocaleString()} kg`,
                note: "Sept → May at current rates",
              },
              {
                label: "End-of-year optimized",
                value: `${Math.round(DAILY_KG * 273 * 0.7).toLocaleString()} kg`,
                note: "With 30% efficiency gain",
              },
              {
                label: "Potential annual savings",
                value: `${Math.round(DAILY_KG * 273 * 0.3).toLocaleString()} kg`,
                note: "30% reduction in AI energy intensity",
              },
            ].map(({ label, value, note }) => (
              <div
                key={label}
                className="rounded-xl border border-green-900/30 bg-green-950/10 px-4 py-4 text-center"
              >
                <div className="text-xs uppercase tracking-widest text-gray-600 mb-1">{label}</div>
                <div className="text-2xl font-black text-green-400">{value}</div>
                <div className="text-xs text-gray-600 mt-1">{note}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 4 · CTA BOX ──────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-green-600/30 bg-[#0d2218]">
          {/* ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(34,197,94,0.06) 0%, transparent 60%)",
            }}
          />
          {/* top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

          <div className="relative px-8 py-10 sm:px-12 sm:py-12">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-6">
                A note on uncertainty
              </span>
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-4">
                These are estimates. The real numbers could be{" "}
                <span className="text-green-400">higher or lower</span> — and that uncertainty
                is itself the research opportunity.
              </p>
              <p className="text-base text-gray-400 leading-relaxed mb-8">
                Northeastern has the data infrastructure, the research talent, and the
                institutional motivation to measure this precisely. This dashboard is a
                prototype of what that could look like — a live carbon accounting system for
                AI usage, validated against real API logs, updated in near-real-time, and
                integrated with NU&apos;s existing sustainability reporting. The methodology
                gaps are documented. The data partnerships are achievable. The first
                mover advantage is real.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/research-agenda"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition-all hover:bg-green-400 active:scale-[0.98]"
                >
                  See the Research Agenda
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 px-6 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
                >
                  Read the Methodology
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
