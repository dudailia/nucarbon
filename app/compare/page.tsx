"use client";


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as d3 from "d3";

// ─── Types ────────────────────────────────────────────────────────────────────
type Transparency = "green" | "yellow" | "red";

type University = {
  name: string;
  shortName: string;
  city: string;
  lat: number;
  lng: number;
  footprint: number;        // tonnes CO₂/yr (illustrative)
  transparency: Transparency;
  stars: number;            // 1–5
  publishedMethod: boolean;
  actionTaken: boolean;
  note: string;
  // pixel jitter for dense clusters (Boston area)
  jitter?: [number, number];
};

// ─── University data ──────────────────────────────────────────────────────────
const UNIVERSITIES: University[] = [
  {
    name: "Northeastern University",
    shortName: "Northeastern",
    city: "Boston, MA",
    lat: 42.3398,
    lng: -71.0892,
    footprint: 140,
    transparency: "green",
    stars: 5,
    publishedMethod: true,
    actionTaken: true,
    note: "First real-time AI carbon dashboard at a US research university.",
    jitter: [14, 10],
  },
  {
    name: "MIT",
    shortName: "MIT",
    city: "Cambridge, MA",
    lat: 42.3601,
    lng: -71.0942,
    footprint: 180,
    transparency: "yellow",
    stars: 3,
    publishedMethod: false,
    actionTaken: true,
    note: "Climate commitments exist; AI energy not disaggregated in reports.",
    jitter: [-16, -12],
  },
  {
    name: "Harvard University",
    shortName: "Harvard",
    city: "Cambridge, MA",
    lat: 42.377,
    lng: -71.1167,
    footprint: 220,
    transparency: "yellow",
    stars: 3,
    publishedMethod: false,
    actionTaken: true,
    note: "Sustainability reports mention AI broadly; no quantified metrics.",
    jitter: [-26, 8],
  },
  {
    name: "Boston University",
    shortName: "BU",
    city: "Boston, MA",
    lat: 42.3505,
    lng: -71.1054,
    footprint: 95,
    transparency: "red",
    stars: 1,
    publishedMethod: false,
    actionTaken: false,
    note: "No public AI energy or carbon disclosure found as of May 2026.",
    jitter: [6, -14],
  },
  {
    name: "Stanford University",
    shortName: "Stanford",
    city: "Palo Alto, CA",
    lat: 37.4275,
    lng: -122.1697,
    footprint: 280,
    transparency: "green",
    stars: 4,
    publishedMethod: true,
    actionTaken: true,
    note: "Publishes annual energy data with partial AI compute breakdown.",
  },
  {
    name: "UC Berkeley",
    shortName: "UC Berkeley",
    city: "Berkeley, CA",
    lat: 37.8724,
    lng: -122.2595,
    footprint: 260,
    transparency: "green",
    stars: 4,
    publishedMethod: true,
    actionTaken: true,
    note: "Dedicated AI sustainability research group; publishes methodology.",
  },
  {
    name: "Carnegie Mellon University",
    shortName: "CMU",
    city: "Pittsburgh, PA",
    lat: 40.4433,
    lng: -79.9436,
    footprint: 200,
    transparency: "yellow",
    stars: 3,
    publishedMethod: false,
    actionTaken: true,
    note: "High AI research density; energy transparency lags behind research output.",
  },
  {
    name: "University of Michigan",
    shortName: "U. Michigan",
    city: "Ann Arbor, MI",
    lat: 42.278,
    lng: -83.7382,
    footprint: 190,
    transparency: "red",
    stars: 2,
    publishedMethod: false,
    actionTaken: false,
    note: "Carbon-neutral pledge active; AI workloads not yet disaggregated.",
  },
  {
    name: "Georgia Tech",
    shortName: "Georgia Tech",
    city: "Atlanta, GA",
    lat: 33.7756,
    lng: -84.3963,
    footprint: 170,
    transparency: "yellow",
    stars: 3,
    publishedMethod: false,
    actionTaken: true,
    note: "Campus energy dashboard exists but AI-specific data absent.",
  },
  {
    name: "University of Washington",
    shortName: "UW Seattle",
    city: "Seattle, WA",
    lat: 47.6553,
    lng: -122.3035,
    footprint: 195,
    transparency: "yellow",
    stars: 3,
    publishedMethod: false,
    actionTaken: true,
    note: "Strong sustainability office; AI carbon not separately tracked.",
  },
];

const SORTED = [...UNIVERSITIES].sort((a, b) =>
  b.stars !== a.stars ? b.stars - a.stars : a.footprint - b.footprint
);

const TRANSP_COLOR: Record<Transparency, string> = {
  green:  "#22c55e",
  yellow: "#facc15",
  red:    "#f87171",
};

const TRANSP_LABEL: Record<Transparency, string> = {
  green:  "Published",
  yellow: "Partial",
  red:    "No Disclosure",
};

const TRANSP_BG: Record<Transparency, string> = {
  green:  "bg-green-950/50 border-green-700/40 text-green-400",
  yellow: "bg-yellow-950/40 border-yellow-700/40 text-yellow-400",
  red:    "bg-red-950/40 border-red-700/40 text-red-400",
};

// ─── Star display ─────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 12 12" className="h-3 w-3" fill={i <= count ? "#22c55e" : "none"} stroke={i <= count ? "#22c55e" : "#1a3a24"} strokeWidth="1">
          <path d="M6 1l1.2 3.6H11L8.4 6.8l1.2 3.6L6 8.2 2.4 10.4l1.2-3.6L1 4.6h3.8z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function MapTooltip({ uni, x, y }: { uni: University; x: number; y: number }) {
  const color = TRANSP_COLOR[uni.transparency];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.12 }}
      className="pointer-events-none fixed z-50 w-64 rounded-xl border border-green-800/40 bg-[#0a1f10] shadow-2xl shadow-black/60"
      style={{ left: x + 14, top: y - 20 }}
    >
      <div className="border-b border-green-900/30 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-black text-sm text-white leading-snug">{uni.name}</p>
          <span
            className="shrink-0 mt-0.5 rounded-full h-2.5 w-2.5"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
        <p className="text-[11px] text-gray-600 mt-0.5">{uni.city}</p>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Est. AI footprint</span>
          <span className="font-black font-mono text-white">{uni.footprint} t/yr</span>
        </div>
        <div className="flex justify-between text-xs items-center">
          <span className="text-gray-500">Transparency</span>
          <span className="font-semibold" style={{ color }}>{TRANSP_LABEL[uni.transparency]}</span>
        </div>
        <div className="flex justify-between text-xs items-center">
          <span className="text-gray-500">Score</span>
          <Stars count={uni.stars} />
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed pt-1 border-t border-green-900/20">
          {uni.note}
        </p>
      </div>
    </motion.div>
  );
}

// ─── US Map (D3) ──────────────────────────────────────────────────────────────
const W = 960;
const H = 580;
const PROJECTION = d3.geoAlbersUsa().scale(1280).translate([W / 2, H / 2]);
const PATH_GEN = d3.geoPath().projection(PROJECTION);
const R_SCALE = d3.scaleSqrt().domain([0, 300]).range([7, 28]);

function USMap() {
  const [statePaths, setStatePaths] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState<University | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    async function fetchMap() {
      try {
        const [topoModule, topoData] = await Promise.all([
          import("topojson-client"),
          fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(
            (r) => r.json()
          ),
        ]);
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const states = topoModule.feature(topoData as any, (topoData as any).objects.states) as d3.GeoPermissibleObjects;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const features = (states as any).features as d3.GeoPermissibleObjects[];
        const paths = features
          .map((f) => PATH_GEN(f))
          .filter((p): p is string => typeof p === "string");
        setStatePaths(paths);
        setLoaded(true);
      } catch {
        setLoaded(true); // show circles even if map fails
      }
    }
    fetchMap();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative select-none">
      {/* loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-green-800">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-green-700"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
            <span>Loading US map…</span>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Ocean background */}
        <rect width={W} height={H} fill="#060f08" rx="8" />

        {/* State fills */}
        {statePaths.map((d, i) => (
          <path key={i} d={d} fill="#0d2218" stroke="#142a1c" strokeWidth={0.6} />
        ))}

        {/* University circles — non-NU first so NU renders on top */}
        {UNIVERSITIES.filter((u) => u.name !== "Northeastern University").map((uni) => {
          const base = PROJECTION([uni.lng, uni.lat]);
          if (!base) return null;
          const [bx, by] = base;
          const [jx, jy] = uni.jitter ?? [0, 0];
          const cx = bx + jx;
          const cy = by + jy;
          const r = R_SCALE(uni.footprint);
          const color = TRANSP_COLOR[uni.transparency];

          return (
            <g
              key={uni.name}
              onMouseEnter={() => setHovered(uni)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* glow halo on hover */}
              <circle
                cx={cx} cy={cy}
                r={r + 6}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={hovered?.name === uni.name ? 0.5 : 0}
                style={{ transition: "opacity 0.15s" }}
              />
              <circle
                cx={cx} cy={cy}
                r={r}
                fill={color}
                fillOpacity={0.75}
                stroke="#060f08"
                strokeWidth={1.5}
              />
              {/* Short name label for large circles */}
              {r >= 16 && (
                <text
                  x={cx} y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.max(7, r * 0.45)}
                  fill="#000"
                  fontWeight="700"
                  pointerEvents="none"
                  opacity={0.6}
                >
                  {uni.shortName.split(" ")[0]}
                </text>
              )}
            </g>
          );
        })}

        {/* Northeastern — always on top with pulse ring */}
        {(() => {
          const nu = UNIVERSITIES.find((u) => u.name === "Northeastern University")!;
          const base = PROJECTION([nu.lng, nu.lat]);
          if (!base) return null;
          const [bx, by] = base;
          const [jx, jy] = nu.jitter ?? [0, 0];
          const cx = bx + jx;
          const cy = by + jy;
          const r = R_SCALE(nu.footprint);

          return (
            <g
              onMouseEnter={() => setHovered(nu)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Pulse rings */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={2} className="nu-pulse-ring nu-pulse-1" />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={1.5} className="nu-pulse-ring nu-pulse-2" />
              {/* Main dot */}
              <circle
                cx={cx} cy={cy}
                r={r}
                fill="#22c55e"
                fillOpacity={0.9}
                stroke="#0a1a0f"
                strokeWidth={2}
              />
              <text
                x={cx} y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={r * 0.48}
                fill="#000"
                fontWeight="900"
                pointerEvents="none"
              >
                NU
              </text>
              {/* Label below */}
              <text
                x={cx} y={cy + r + 11}
                textAnchor="middle"
                fontSize={9}
                fill="#22c55e"
                fontWeight="700"
                pointerEvents="none"
                letterSpacing="0.5"
              >
                ← You are here
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <MapTooltip key={hovered.name} uni={hovered} x={mousePos.x} y={mousePos.y} />
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-xl border border-green-900/30 bg-[#060f08]/90 backdrop-blur-sm px-4 py-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-2">Legend</p>
        {(["green", "yellow", "red"] as Transparency[]).map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: TRANSP_COLOR[t] }} />
            {TRANSP_LABEL[t]}
          </div>
        ))}
        <div className="pt-2 border-t border-green-900/20 space-y-1">
          <p className="text-[10px] text-gray-700">Circle size = AI carbon footprint</p>
          <p className="text-[10px] text-gray-700">Boston cluster is jittered for visibility</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* ── SECTION 1 · HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
          National Landscape · May 2026
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          Where does Northeastern<br />
          <span className="text-green-400">stand?</span>
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
          AI sustainability commitments and transparency across major US research universities.
          Data is illustrative — based on publicly available sustainability reports as of May 2026.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-green-700/30 bg-green-950/20 px-5 py-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-green-300">
            Northeastern ranks #1 on AI sustainability transparency
          </span>
          <span className="text-xs text-gray-600">among 10 peer institutions surveyed</span>
        </div>
      </motion.div>

      {/* ── SECTION 2 · MAP ───────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              AI Transparency Map — US Research Universities
            </h2>
            <p className="text-sm text-gray-500">
              Hover any circle for details. Larger circle = larger estimated AI footprint.
            </p>
          </div>
          <div className="flex gap-3">
            {(["green", "yellow", "red"] as Transparency[]).map((t) => (
              <span
                key={t}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${TRANSP_BG[t]}`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: TRANSP_COLOR[t] }} />
                {TRANSP_LABEL[t]}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-900/30 bg-[#060f08]">
          <USMap />
        </div>
      </motion.section>

      {/* ── SECTION 3 · LEADERBOARD ───────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-black text-white mb-2">
          Transparency Leaderboard
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Ranked by sustainability transparency score. Ties broken by lower estimated footprint.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-green-900/30">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-green-900/30 bg-[#0a180d]">
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-green-700 w-8">#</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-green-700">University</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-green-700">Est. AI Carbon</th>
                <th className="px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-green-700">Transparency</th>
                <th className="px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-green-700">Methodology</th>
                <th className="px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-green-700">Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {SORTED.map((uni, i) => {
                const isNU = uni.name === "Northeastern University";
                return (
                  <motion.tr
                    key={uni.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-green-900/20 transition-colors hover:bg-green-950/10 ${
                      isNU ? "bg-green-950/25" : i % 2 === 0 ? "" : "bg-white/[0.015]"
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-sm font-black tabular-nums ${
                          isNU ? "text-green-400" : "text-gray-700"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>

                    {/* University */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            background: TRANSP_COLOR[uni.transparency],
                            boxShadow: isNU ? `0 0 8px ${TRANSP_COLOR[uni.transparency]}` : "none",
                          }}
                        />
                        <div>
                          <p className={`font-semibold ${isNU ? "text-green-300" : "text-white"}`}>
                            {uni.shortName}
                            {isNU && (
                              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-black text-green-500 uppercase tracking-wider">
                                This project
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-600">{uni.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Footprint */}
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-mono font-bold ${isNU ? "text-green-400" : "text-gray-300"}`}>
                        {uni.footprint}
                      </span>
                      <span className="ml-1 text-xs text-gray-600">t/yr</span>
                    </td>

                    {/* Stars */}
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center">
                        <Stars count={uni.stars} />
                      </div>
                    </td>

                    {/* Published Method */}
                    <td className="px-4 py-3.5 text-center">
                      {uni.publishedMethod ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-green-700/30 bg-green-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3 w-3">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-700">—</span>
                      )}
                    </td>

                    {/* Action Taken */}
                    <td className="px-4 py-3.5 text-center">
                      {uni.actionTaken ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-green-700/30 bg-green-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3 w-3">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-red-800/30 bg-red-950/20 px-2.5 py-0.5 text-[11px] font-medium text-red-500">
                          No
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="mt-4 rounded-xl border border-green-900/20 bg-green-950/10 px-5 py-4">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-500">Footnote: </span>
            Transparency scores are based on publicly available sustainability reports as of May 2026.
            AI-specific carbon data is not yet systematically published by most institutions — this
            represents a significant gap in higher education sustainability reporting. All footprint
            figures are illustrative estimates derived from published research on AI energy use
            scaled by estimated campus size and AI adoption rates. They are not confirmed by the
            institutions listed.
          </p>
        </div>
      </motion.section>

      {/* ── SECTION 4 · OPPORTUNITY STATEMENT ────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-green-600/30 bg-[#0d2218]">
          {/* ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 55%)",
            }}
          />
          {/* top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
          {/* left bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-green-600 to-transparent rounded-l-2xl" />

          <div className="relative px-8 py-10 sm:px-12 sm:py-12">
            <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-6">
                  The opportunity
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug mb-5">
                  Northeastern has the opportunity to be the{" "}
                  <span className="text-green-400">first major research university</span> to
                  publish a comprehensive, methodology-driven AI carbon report.
                </h3>
                <p className="text-base text-gray-400 leading-relaxed">
                  This dashboard is the prototype. The research agenda is ready. The data
                  infrastructure exists. What&apos;s missing is institutional commitment — and a
                  student team to build it.
                </p>
              </div>

              {/* Readiness checklist */}
              <div className="rounded-xl border border-green-800/30 bg-black/20 p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-green-700 mb-4">
                  Readiness Assessment
                </p>
                <ul className="space-y-3">
                  {[
                    { label: "Live prototype", done: true },
                    { label: "Documented methodology", done: true },
                    { label: "Identified data sources", done: true },
                    { label: "Research questions scoped", done: true },
                    { label: "IT partnership", done: false },
                    { label: "Institutional endorsement", done: false },
                    { label: "Formal funding", done: false },
                  ].map(({ label, done }) => (
                    <li key={label} className="flex items-center gap-3 text-sm">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          done
                            ? "border-green-600/50 bg-green-950/50"
                            : "border-gray-700/50 bg-transparent"
                        }`}
                      >
                        {done && (
                          <svg viewBox="0 0 10 10" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" className="h-3 w-3">
                            <polyline points="1.5,5 4,7.5 8.5,2.5" />
                          </svg>
                        )}
                      </span>
                      <span className={done ? "text-green-300" : "text-gray-600"}>{label}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-green-900/20">
                  <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                    <span>Readiness</span>
                    <span className="text-green-500 font-bold">4 of 7</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-green-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "57%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                { stat: "1st", label: "to publish real-time AI carbon data", color: "#22c55e" },
                { stat: "1,000+", label: "AASHE member institutions watching for a framework", color: "#86efac" },
                { stat: "3 mo.", label: "to first publishable baseline with seed funding", color: "#4ade80" },
              ].map(({ stat, label, color }) => (
                <div key={stat} className="rounded-xl border border-green-900/25 bg-black/15 px-4 py-4 text-center">
                  <div
                    className="text-3xl font-black tabular-nums mb-1"
                    style={{ color, textShadow: `0 0 16px ${color}55` }}
                  >
                    {stat}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/research-agenda"
                className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition-all hover:bg-green-400 active:scale-[0.97]"
              >
                Read the Research Agenda
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 px-6 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
              >
                Try the Simulator
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
