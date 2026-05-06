"use client";


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Building data ─────────────────────────────────────────────────────────────
type Intensity = "green" | "yellow" | "red";

type Building = {
  id: string;
  name: string;
  subtitle: string;
  x: number; y: number; w: number; h: number;
  intensity: Intensity;
  carbonScore: number;       // 1–10
  aiKwhDay: number;
  note: string;
  badge?: string;
  initiatives: string[];
  projects: string[];
};

const BUILDINGS: Building[] = [
  {
    id: "columbus",
    name: "Columbus Place",
    subtitle: "Residential Quad",
    x: 310, y: 28, w: 168, h: 52,
    intensity: "yellow",
    carbonScore: 5,
    aiKwhDay: 32,
    note: "Moderate AI use — primarily ChatGPT and Grammarly for coursework, peaking during finals.",
    initiatives: ["Solar-ready roof design", "EV charging integration"],
    projects: ["Residential Energy Behavior Study", "Night-mode AI Usage Pattern Analysis"],
  },
  {
    id: "curry",
    name: "Curry Student Center",
    subtitle: "Student Services Hub",
    x: 148, y: 138, w: 128, h: 65,
    intensity: "yellow",
    carbonScore: 5,
    aiKwhDay: 28,
    note: "Diverse AI use across student services, events coordination, and informal study spaces.",
    initiatives: ["Smart occupancy lighting", "Food service waste reduction"],
    projects: ["Campus AI Literacy Survey 2026", "Digital Services Footprint Audit"],
  },
  {
    id: "snell",
    name: "Snell Library",
    subtitle: "W.E. Snell Memorial Library",
    x: 340, y: 128, w: 152, h: 80,
    intensity: "yellow",
    carbonScore: 6,
    aiKwhDay: 58,
    note: "Student AI tool usage — high volume, distributed across hundreds of daily users running research queries.",
    initiatives: ["24/7 efficiency scheduling", "Database server consolidation (2024)"],
    projects: ["AI Research Tool Usage Study", "Library Digital Carbon Footprint Report"],
  },
  {
    id: "cabot",
    name: "Cabot Center",
    subtitle: "Athletics & Recreation East",
    x: 562, y: 148, w: 118, h: 62,
    intensity: "green",
    carbonScore: 2,
    aiKwhDay: 8,
    note: "Low AI dependency — primarily administrative tools and scheduling automation.",
    initiatives: ["LED retrofit complete (2023)", "Water recapture system"],
    projects: ["Athletic Performance AI Ethics Review"],
  },
  {
    id: "isec",
    name: "ISEC",
    subtitle: "Interdisciplinary Science & Engineering Complex",
    x: 730, y: 105, w: 152, h: 98,
    intensity: "red",
    carbonScore: 9,
    aiKwhDay: 520,
    note: "High-performance computing cluster — largest single AI energy consumer on campus.",
    badge: "AI Research Hub",
    initiatives: ["LEED Gold certified", "Free cooling system (winter months)", "Energy monitoring dashboard"],
    projects: ["Neural Climate Modeling Initiative (NSF-funded)", "On-Campus GPU Carbon Accounting Study"],
  },
  {
    id: "ell",
    name: "Ell / Dodge Hall",
    subtitle: "Core Academic Classrooms",
    x: 75, y: 245, w: 152, h: 70,
    intensity: "green",
    carbonScore: 4,
    aiKwhDay: 35,
    note: "Moderate AI use in lecture halls and seminar rooms — mixed tool adoption across departments.",
    initiatives: ["Smart thermostat rollout 2024", "Daylight-responsive lighting"],
    projects: ["Classroom AI Integration Study", "Lecture Transcription Energy Analysis"],
  },
  {
    id: "matthews",
    name: "Matthews Arena",
    subtitle: "Sports & Events Venue",
    x: 45, y: 358, w: 148, h: 80,
    intensity: "green",
    carbonScore: 3,
    aiKwhDay: 12,
    note: "Low AI impact — event logistics, ticketing automation, and broadcast coordination.",
    initiatives: ["Ice rink refrigerant upgrade (2022)", "Renewable energy credit purchase"],
    projects: ["Event Logistics Optimization AI Pilot"],
  },
  {
    id: "marino",
    name: "Marino Recreation",
    subtitle: "Fitness & Wellness Center",
    x: 228, y: 353, w: 118, h: 70,
    intensity: "green",
    carbonScore: 3,
    aiKwhDay: 9,
    note: "Minimal AI footprint — equipment monitoring and member scheduling only.",
    initiatives: ["Heat pump installation 2023", "Energy dashboard for members"],
    projects: ["Wearable Health Data Sustainability Study"],
  },
  {
    id: "sustainability",
    name: "271 Huntington Ave",
    subtitle: "Sustainability Incubator HQ",
    x: 48, y: 492, w: 142, h: 52,
    intensity: "green",
    carbonScore: 1,
    aiKwhDay: 3,
    note: "Carbon-minimal operations — the incubator leads by example with carbon-aware compute.",
    badge: "Sustainability Incubator HQ",
    initiatives: ["100% renewable electricity", "Zero-waste office commitment", "Carbon-aware compute scheduling"],
    projects: ["NUCarbon Dashboard (this project)", "University Sustainability Playbook 2026"],
  },
  {
    id: "ruggles",
    name: "Ruggles MBTA",
    subtitle: "Orange Line / Commuter Rail",
    x: 388, y: 512, w: 140, h: 46,
    intensity: "green",
    carbonScore: 1,
    aiKwhDay: 0.5,
    note: "Transit hub — mode shift to transit is one of the highest-leverage carbon interventions for commuter students.",
    badge: "MBTA Station",
    initiatives: ["MBTA electrification plan", "Bike share station adjacent"],
    projects: ["Campus Commute Carbon Reduction Study"],
  },
];

// ─── Kanban data ───────────────────────────────────────────────────────────────
type KanbanStatus = "active" | "proposed" | "completed";
type Project = {
  title: string;
  dept: string;
  status: KanbanStatus;
  desc: string;
  highlight?: boolean;
};

const KANBAN: Project[] = [
  // Active
  { title: "AI Carbon Baseline Study", dept: "Sustainability Incubator", status: "active", desc: "Measuring AI tool energy use across 500-student sample, stratified by college." },
  { title: "Smart Building Energy Optimization", dept: "ISEC / Facilities", status: "active", desc: "ML-driven HVAC scheduling reducing peak load — 12% energy savings in pilot semester." },
  { title: "Campus Food Waste ML Predictor", dept: "Computer Science", status: "active", desc: "Deep learning model predicting dining hall surplus to reduce food waste by 30%." },
  // Proposed
  { title: "Real-time AI Usage Dashboard", dept: "Sustainability Incubator", status: "proposed", desc: "Live carbon tracking for AI tool usage across all seven NU campuses.", highlight: true },
  { title: "Cross-campus Solar Potential Analysis", dept: "CEE / Facilities", status: "proposed", desc: "LiDAR analysis of rooftop solar potential across 40 campus buildings." },
  { title: "Student Behavior Change Study", dept: "Psychology / Sustainability", status: "proposed", desc: "RCT testing carbon-awareness nudges embedded in AI tool interfaces." },
  // Completed
  { title: "LED Retrofit Impact Analysis", dept: "Facilities Management", status: "completed", desc: "Full campus lighting retrofit documentation: 31% energy reduction, $420k annual savings." },
  { title: "MBTA Commute Carbon Calculator", dept: "Civil Engineering", status: "completed", desc: "Tool estimating commute emissions for Northeastern's 18,000 undergraduate students." },
  { title: "Green Roof Biodiversity Survey", dept: "Biology / CSSH", status: "completed", desc: "Pilot green roof on Shillman Hall: 47 species identified in year one." },
];

// ─── Color maps ────────────────────────────────────────────────────────────────
const INT_FILL: Record<Intensity, string>   = { green: "#22c55e", yellow: "#facc15", red: "#ef4444" };
const INT_SCORE: Record<Intensity, string>  = { green: "text-green-400", yellow: "text-yellow-400", red: "text-red-400" };
const STATUS_CONFIG = {
  active:    { label: "Active",    bg: "bg-green-950/50",  border: "border-green-700/40",  text: "text-green-400"  },
  proposed:  { label: "Proposed",  bg: "bg-blue-950/40",   border: "border-blue-700/40",   text: "text-blue-400"   },
  completed: { label: "Completed", bg: "bg-gray-900/50",   border: "border-gray-700/30",   text: "text-gray-400"   },
};

// ─── Carbon meter ──────────────────────────────────────────────────────────────
function CarbonMeter({ score }: { score: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const color = score <= 3 ? "#22c55e" : score <= 6 ? "#facc15" : "#ef4444";
  return (
    <div className="relative flex h-[72px] w-[72px] items-center justify-center">
      <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90" fill="none">
        <circle cx={36} cy={36} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
        <motion.circle
          cx={36} cy={36} r={r}
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${fill} ${circ - fill}` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="font-black text-xl leading-none" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Building side panel ───────────────────────────────────────────────────────
function BuildingPanel({ building, onClose }: { building: Building; onClose: () => void }) {
  const color = INT_FILL[building.intensity];
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-4 overflow-y-auto max-h-[580px] lg:max-h-full"
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {building.badge && (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{ borderColor: color + "55", color, background: color + "15" }}>
                {building.badge}
              </span>
            )}
          </div>
          <h3 className="text-base font-black text-white leading-snug">{building.name}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{building.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg border border-green-900/40 bg-green-950/20 p-1.5 text-gray-600 hover:text-gray-300 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>

      {/* score + energy row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-green-900/25 bg-[#060f08] p-4 flex flex-col items-center gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1">Carbon Score</p>
          <CarbonMeter score={building.carbonScore} />
          <p className={`text-[10px] font-bold uppercase tracking-wider ${INT_SCORE[building.intensity]}`}>
            {building.intensity === "green" ? "Low Impact" : building.intensity === "yellow" ? "Moderate" : "High Impact"}
          </p>
        </div>
        <div className="rounded-xl border border-green-900/25 bg-[#060f08] p-4 flex flex-col justify-center gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700">AI Energy</p>
          <p className="font-black font-mono text-2xl" style={{ color }}>
            {building.aiKwhDay < 1 ? "<1" : building.aiKwhDay}
          </p>
          <p className="text-[11px] text-gray-600">kWh/day (est.)</p>
        </div>
      </div>

      {/* note */}
      <p className="text-xs text-gray-400 leading-relaxed">{building.note}</p>

      {/* initiatives */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 mb-2">Sustainability Initiatives</p>
        <ul className="space-y-1.5">
          {building.initiatives.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 12 12" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" className="h-3 w-3 mt-0.5 shrink-0">
                <polyline points="2,6 5,9 10,3" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* projects */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 mb-2">Research Projects</p>
        <div className="space-y-2">
          {building.projects.map((proj) => (
            <div key={proj} className="rounded-lg border border-green-900/25 bg-green-950/10 px-3 py-2.5">
              <p className="text-xs font-semibold text-green-300">{proj}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Campus SVG map ────────────────────────────────────────────────────────────
function CampusMap({ selected, onSelect }: {
  selected: Building | null;
  onSelect: (b: Building) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-green-900/30 bg-[#050d07]">
      {/* HUD chrome top bar */}
      <div className="flex items-center justify-between border-b border-green-900/25 bg-[#030807] px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="font-mono text-[11px] text-green-800 tracking-wider">
            NUCARBON · CAMPUS GRID · BOSTON, MA
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-green-900">42.3398°N  71.0892°W</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[10px] text-green-800">LIVE</span>
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 900 568"
        className="w-full"
        style={{ aspectRatio: "900/568" }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="campus-grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(34,197,94,0.045)" strokeWidth="0.5" />
          </pattern>
          {/* Glow filters */}
          <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-green" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-sel" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background fill */}
        <rect width={900} height={568} fill="#050d07" />
        {/* Grid overlay */}
        <rect width={900} height={568} fill="url(#campus-grid)" />

        {/* Campus perimeter — soft highlight */}
        <rect x={22} y={18} width={860} height={490} rx={6} fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth={1} />

        {/* Corner brackets */}
        {[[22,18],[882,18],[22,508],[882,508]].map(([cx, cy], i) => {
          const sx = i < 2 ? 1 : -1;
          const sy = i % 2 === 0 ? 1 : -1;
          return (
            <path key={i}
              d={`M ${cx + sx*22} ${cy} L ${cx} ${cy} L ${cx} ${cy + sy*22}`}
              fill="none" stroke="rgba(34,197,94,0.2)" strokeWidth={1.5} />
          );
        })}

        {/* Scan line */}
        <rect className="map-scan" x={22} y={18} width={860} height={2} fill="rgba(34,197,94,0.3)" />

        {/* ── Roads ── */}
        {/* Huntington Ave */}
        <rect x={0} y={466} width={900} height={24} fill="#0c1a0f" />
        <line x1={0} y1={466} x2={900} y2={466} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <line x1={0} y1={490} x2={900} y2={490} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <line x1={0} y1={478} x2={900} y2={478} stroke="rgba(255,255,255,0.025)" strokeWidth={1} strokeDasharray="24 16" />
        <text x={780} y={481} fill="rgba(255,255,255,0.12)" fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={2}>HUNTINGTON AVE</text>

        {/* North path (Columbus Ave approximate) */}
        <rect x={0} y={10} width={900} height={14} fill="#0c1a0f" />
        <text x={150} y={20} fill="rgba(255,255,255,0.08)" fontSize={8} fontFamily="monospace" letterSpacing={2}>COLUMBUS AVE</text>

        {/* ── ISEC glow pulse ── */}
        <rect className="isec-glow"
          x={722} y={97} width={168} height={114}
          rx={4} fill="#ef4444" stroke="none" />

        {/* ── Buildings ── */}
        {BUILDINGS.map((b) => {
          const isSelected = selected?.id === b.id;
          const isHovered  = hovered === b.id;
          const color      = INT_FILL[b.intensity];
          const isISEC     = b.id === "isec";
          const isIncubator = b.id === "sustainability";

          return (
            <g
              key={b.id}
              onClick={() => onSelect(b)}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
              filter={isISEC ? "url(#glow-red)" : isIncubator ? "url(#glow-green)" : isSelected ? "url(#glow-sel)" : undefined}
            >
              {/* Building fill */}
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h}
                rx={3}
                fill={color}
                fillOpacity={isSelected ? 0.28 : isHovered ? 0.22 : 0.12}
                stroke={color}
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.8}
                strokeOpacity={isSelected ? 1 : isHovered ? 0.8 : 0.45}
              />
              {/* Selected inner highlight */}
              {isSelected && (
                <rect
                  x={b.x + 2} y={b.y + 2} width={b.w - 4} height={b.h - 4}
                  rx={2}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.5}
                  strokeOpacity={0.4}
                />
              )}

              {/* Building name */}
              <text
                x={b.x + b.w / 2}
                y={b.y + (b.badge ? b.h / 2 - 5 : b.h / 2 + 1)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? color : "rgba(255,255,255,0.8)"}
                fontSize={Math.min(11, b.w / 10)}
                fontWeight={isSelected ? "800" : "600"}
                fontFamily="sans-serif"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {b.name}
              </text>

              {/* Badge label */}
              {b.badge && (
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fontSize={Math.min(9, b.w / 12)}
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing={0.5}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  ★ {b.badge}
                </text>
              )}

              {/* Incubator pulsing star */}
              {isIncubator && (
                <text
                  className="incubator-star"
                  x={b.x + b.w - 14}
                  y={b.y + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#22c55e"
                  fontSize={14}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  ★
                </text>
              )}
            </g>
          );
        })}

        {/* ── Legend ── */}
        <g transform="translate(730, 468)">
          <rect width={152} height={90} rx={4} fill="rgba(5,13,7,0.92)" stroke="rgba(34,197,94,0.15)" strokeWidth={0.8} />
          <text x={10} y={16} fill="rgba(34,197,94,0.5)" fontSize={8} fontWeight="700" fontFamily="monospace" letterSpacing={1}>CARBON INTENSITY</text>
          {[["#22c55e","Low (1–3)"], ["#facc15","Moderate (4–6)"], ["#ef4444","High (7–10)"]].map(([c, l], i) => (
            <g key={l} transform={`translate(10, ${28 + i*20})`}>
              <rect width={12} height={9} rx={2} fill={c} fillOpacity={0.25} stroke={c} strokeWidth={0.8} strokeOpacity={0.6} />
              <text x={18} y={8} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="sans-serif">{l}</text>
            </g>
          ))}
          <text x={10} y={80} fill="rgba(34,197,94,0.25)" fontSize={7.5} fontFamily="monospace">Click building for details</text>
        </g>

        {/* ── Compass rose ── */}
        <g transform="translate(858, 36)">
          <circle cx={0} cy={0} r={14} fill="rgba(5,13,7,0.8)" stroke="rgba(34,197,94,0.15)" strokeWidth={0.8} />
          {[["N",0,-10],["S",0,10],["E",10,0],["W",-10,0]].map(([d, dx, dy]) => (
            <text key={String(d)} x={Number(dx)} y={Number(dy)+3.5} textAnchor="middle" fill={d==="N" ? "#22c55e" : "rgba(255,255,255,0.25)"} fontSize={7} fontWeight="800" fontFamily="monospace">
              {String(d)}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ─── Kanban column ─────────────────────────────────────────────────────────────
function KanbanColumn({ status, projects }: { status: KanbanStatus; projects: Project[] }) {
  const cfg = STATUS_CONFIG[status];
  const icons: Record<KanbanStatus, React.ReactNode> = {
    active: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
        <circle cx="7" cy="7" r="6" /><polyline points="7,4 7,7 9,9" />
      </svg>
    ),
    proposed: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
        <path d="M7 2v5l3 1.5M13 7A6 6 0 111 7a6 6 0 0112 0z" />
      </svg>
    ),
    completed: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
        <circle cx="7" cy="7" r="6" /><polyline points="4,7 6,9 10,5" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${cfg.bg} ${cfg.border}`}>
        <span className={cfg.text}>{icons[status]}</span>
        <span className={`text-xs font-black uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
        <span className={`ml-auto text-xs font-bold ${cfg.text} opacity-60`}>{projects.length}</span>
      </div>

      {projects.map((proj, i) => (
        <motion.div
          key={proj.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ delay: i * 0.07 }}
          className={`rounded-xl border p-4 transition-all hover:border-green-800/50 ${
            proj.highlight
              ? "border-green-600/40 bg-green-950/25"
              : "border-green-900/25 bg-[#0a180d]"
          }`}
        >
          {proj.highlight && (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-700/40 bg-green-950/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-green-500 mb-2">
              ★ This Project
            </span>
          )}
          <p className={`text-sm font-bold mb-1 ${proj.highlight ? "text-green-200" : "text-white"}`}>
            {proj.title}
          </p>
          <p className="text-[11px] text-gray-600 mb-2">{proj.dept}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{proj.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LivingLabPage() {
  const [selected, setSelected] = useState<Building | null>(null);

  function handleSelect(b: Building) {
    setSelected((prev) => (prev?.id === b.id ? null : b));
  }

  const active    = KANBAN.filter((p) => p.status === "active");
  const proposed  = KANBAN.filter((p) => p.status === "proposed");
  const completed = KANBAN.filter((p) => p.status === "completed");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-20">

      {/* ── SECTION 1 · HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
          Boston Campus · Living Laboratory
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          Northeastern as a<br />
          <span className="text-green-400">Living Laboratory</span>
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
          Every building, every department, every research project — mapped as a sustainability
          ecosystem. Click any building to see its AI energy profile and active research.
        </p>
      </motion.div>

      {/* ── SECTION 2 · MAP + PANEL ───────────────────────────────────────── */}
      <section>
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Map — shrinks when panel is open */}
          <motion.div
            layout
            className="w-full lg:flex-1 min-w-0"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <CampusMap selected={selected} onSelect={handleSelect} />
          </motion.div>

          {/* Side panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 320 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="shrink-0 overflow-hidden lg:block"
                style={{ minWidth: selected ? 300 : 0 }}
              >
                <div className="w-[320px] rounded-2xl border border-green-900/30 bg-[#0a180d] p-5 h-full">
                  <BuildingPanel building={selected} onClose={() => setSelected(null)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile panel — full width below map */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={`mobile-${selected.id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28 }}
              className="lg:hidden overflow-hidden mt-4"
            >
              <div className="rounded-2xl border border-green-900/30 bg-[#0a180d] p-5">
                <BuildingPanel building={selected} onClose={() => setSelected(null)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map legend row */}
        {!selected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center text-xs text-gray-700"
          >
            10 buildings mapped · Click any building to explore its AI energy profile
          </motion.p>
        )}
      </section>

      {/* ── SECTION 3 · KANBAN BOARD ──────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-white mb-2">
            Living Lab Project Tracker
          </h2>
          <p className="text-sm text-gray-500 max-w-xl">
            Sustainability research projects active at Northeastern — across stages from ideation
            to publication.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          <KanbanColumn status="active"    projects={active} />
          <KanbanColumn status="proposed"  projects={proposed} />
          <KanbanColumn status="completed" projects={completed} />
        </div>
      </section>

      {/* ── SECTION 4 · THE PITCH ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-green-600/25 bg-[#0d2218]">
          {/* ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)" }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />

          <div className="relative px-8 py-11 sm:px-12 sm:py-14">
            <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-6">
                  The Vision
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-snug mb-5">
                  This map was built in hours.<br />
                  <span className="text-green-400">Imagine what months could build.</span>
                </h3>
                <p className="text-base text-gray-400 leading-relaxed mb-4">
                  With institutional data access — energy meters, IT traffic logs, facilities
                  records, purchasing data — this prototype could become a{" "}
                  <span className="text-green-300 font-semibold">real-time sustainability intelligence
                  platform</span> for Northeastern&apos;s entire campus ecosystem.
                </p>
                <p className="text-base text-gray-400 leading-relaxed">
                  Every building&apos;s AI energy draw, updated hourly. Every research project&apos;s
                  carbon budget, tracked against its findings. Every student&apos;s tool usage,
                  anonymized and aggregated into institutional insight. That is the opportunity
                  the Sustainability Incubator is positioned to lead.
                </p>
              </div>

              {/* What it would take */}
              <div className="rounded-xl border border-green-800/30 bg-black/20 p-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-green-700 mb-5">
                  What It Would Take
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: "⚡", label: "Facilities API access", detail: "Building-level energy meters already exist — just need IT partnership" },
                    { icon: "🔒", label: "Anonymized network logs", detail: "AI traffic data to AI endpoints — precedent exists at peer institutions" },
                    { icon: "👥", label: "One student research team", detail: "3–4 students, 1 faculty advisor, 1 semester of focused work" },
                    { icon: "📊", label: "Institutional endorsement", detail: "Sustainability office sign-off to make data access requests credible" },
                  ].map(({ icon, label, detail }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="text-base leading-none mt-0.5">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-green-300">{label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/research-agenda"
                className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition-all hover:bg-green-400 active:scale-[0.97]"
              >
                Read the Full Research Agenda
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 px-6 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
              >
                Try the Carbon Simulator
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 px-6 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
              >
                See National Landscape
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
