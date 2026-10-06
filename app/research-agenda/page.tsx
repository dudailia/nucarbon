"use client";


import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

// ─── Data Matrix ────────────────────────────────────────────────────────────
type Availability = "Available Now" | "Requires Survey" | "Requires IT Access" | "Does Not Exist Yet";
type Precision = "Exact" | "Estimated" | "Unknown";

type DataSource = {
  name: string;
  description: string;
  availability: Availability;
  precision: Precision;
  potential: string;
  owner: string;
};

const DATA_SOURCES: DataSource[] = [
  {
    name: "NU IT Network Traffic Logs",
    description: "Packet-level or flow-level data showing traffic to AI service endpoints (OpenAI, Anthropic, GitHub Copilot APIs)",
    availability: "Requires IT Access",
    precision: "Exact",
    potential: "Direct proxy for query volume — the gold standard for usage measurement",
    owner: "NU IT / CISO",
  },
  {
    name: "Campus Energy Consumption Data",
    description: "Building-level kWh from Facilities — provides baseline for any on-campus compute infrastructure",
    availability: "Available Now",
    precision: "Estimated",
    potential: "Baseline for campus-hosted compute; context for off-campus API usage share",
    owner: "Facilities / Sustainability",
  },
  {
    name: "Software License Counts",
    description: "GitHub Copilot, Microsoft 365 Copilot, and other enterprise AI seat licenses procured by NU",
    availability: "Available Now",
    precision: "Exact",
    potential: "Hard lower bound on active user counts — useful for calibration",
    owner: "NU Procurement / OIT",
  },
  {
    name: "Student & Faculty AI Usage Surveys",
    description: "IRB-approved self-report surveys on tool adoption, query frequency, and use case breakdown",
    availability: "Requires Survey",
    precision: "Estimated",
    potential: "Currently the only source of use-case and adoption data at peer institutions",
    owner: "Research team (IRB required)",
  },
  {
    name: "Cloud Compute Bills",
    description: "AWS, Azure, or GCP invoices for any NU-operated AI infrastructure (research clusters, hosted models)",
    availability: "Requires IT Access",
    precision: "Exact",
    potential: "Direct measurement of on-premises AI energy; includes GPU utilization data",
    owner: "NU Research Computing",
  },
  {
    name: "Vendor Carbon Disclosure Reports",
    description: "OpenAI, Anthropic, Google, and Microsoft annual sustainability / GHG disclosure documents",
    availability: "Available Now",
    precision: "Unknown",
    potential: "Tool-level footprint context — but vendor figures are often incomplete or aggregated",
    owner: "Public domain",
  },
  {
    name: "NU Data Center PUE",
    description: "Power Usage Effectiveness ratio for any NU-operated server rooms or co-location facilities",
    availability: "Does Not Exist Yet",
    precision: "Unknown",
    potential: "Critical multiplier for on-campus compute footprint; most universities lack this",
    owner: "Facilities (to be established)",
  },
];

const AVAIL_CONFIG: Record<Availability, { bg: string; border: string; text: string; dot: string; short: string }> = {
  "Available Now": {
    bg: "bg-green-950/50",
    border: "border-green-700/50",
    text: "text-green-300",
    dot: "#22c55e",
    short: "Available",
  },
  "Requires Survey": {
    bg: "bg-yellow-950/40",
    border: "border-yellow-700/40",
    text: "text-yellow-300",
    dot: "#facc15",
    short: "Survey needed",
  },
  "Requires IT Access": {
    bg: "bg-orange-950/40",
    border: "border-orange-700/40",
    text: "text-orange-300",
    dot: "#fb923c",
    short: "IT access needed",
  },
  "Does Not Exist Yet": {
    bg: "bg-red-950/40",
    border: "border-red-800/40",
    text: "text-red-300",
    dot: "#f87171",
    short: "Doesn't exist",
  },
};

const PREC_CONFIG: Record<Precision, { text: string; bg: string }> = {
  Exact: { text: "text-green-400", bg: "bg-green-950/40" },
  Estimated: { text: "text-yellow-400", bg: "bg-yellow-950/30" },
  Unknown: { text: "text-gray-500", bg: "bg-white/5" },
};

// ─── Research questions ───────────────────────────────────────────────────────
const QUESTIONS = [
  {
    number: "01",
    question:
      "What is the actual AI-related energy consumption at Northeastern, and how does it compare to peer institutions?",
    color: "#22c55e",
    timeline: "6–9 months",
    funding: "~$25k seed grant",
    type: "Measurement",
    methodology: [
      "Deploy anonymized API traffic monitoring on NU's network edge in partnership with OIT — captures query volume without content inspection",
      "Combine with software license data (Copilot seats, Microsoft 365 AI features) to establish hard lower bounds on user counts across colleges",
      "Run parallel survey (n ≥ 500, stratified by college and role) to capture unmanaged tool usage (personal API keys, consumer ChatGPT accounts)",
    ],
    outputs: ["Peer-reviewed baseline report", "Reusable measurement framework", "Comparison dataset across 3–5 R1 peers"],
  },
  {
    number: "02",
    question:
      "Which AI use cases on campus generate the most value per unit of carbon — and which are low-value, high-energy waste?",
    color: "#86efac",
    timeline: "9–12 months",
    funding: "~$40k + faculty time",
    type: "Value × Impact",
    methodology: [
      "Pair usage data with academic outcome proxies (grade distributions, submission rates, research output) to model value per use case at the aggregate level",
      "Conduct qualitative interviews (n = 40) with students and faculty across high- and low-adoption departments to surface task taxonomies and perceived value",
      "Apply a carbon-cost-effectiveness lens borrowed from health economics: cost-per-unit-of-impact (QALY equivalent for academic productivity)",
    ],
    outputs: ["AI use-case carbon efficiency rankings", "Policy memo for NU Provost", "Framework for responsible AI procurement criteria"],
  },
  {
    number: "03",
    question:
      "How do students and faculty think about the environmental cost of the AI tools they use daily?",
    color: "#4ade80",
    timeline: "4–6 months",
    funding: "~$15k (survey + analysis)",
    type: "Behavioral",
    methodology: [
      "Mixed-methods survey (quantitative scales + qualitative probes) measuring awareness, concern, and willingness to change behavior — administered at semester start and end",
      "A/B test: show a random half of survey respondents this NUCarbon dashboard before answering — measure whether data exposure shifts reported attitudes or intended behavior",
      "Ground findings in existing frameworks: Stern's Value-Belief-Norm theory, tech acceptance models, and campus sustainability behavior literature",
    ],
    outputs: ["First dataset on AI carbon awareness in higher ed", "Behavioral intervention design brief", "Journal article: Environmental Communication or Computers & Education"],
  },
];

// ─── Timeline steps ────────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  {
    month: "Month 1",
    title: "Data Audit",
    description: "Audit existing data sources, interview IT and Facilities to map what's accessible and on what timeline",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    month: "Month 2",
    title: "Survey Deploy",
    description: "Deploy usage survey to 500-student stratified sample; simultaneously seek IRB approval for behavioral arm",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    month: "Month 3",
    title: "Baseline Report",
    description: "Publish open baseline report with full methodology; submit NUCarbon framework to Sustainability office for endorsement",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    month: "Month 6",
    title: "Incubator Demo",
    description: "Present findings at Sustainability Innovation Week; demo live dashboard to VP of Sustainability and peer institution contacts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    month: "Month 12",
    title: "Publication",
    description: "Submit for peer review; share open-source measurement framework with AASHE member institutions and Second Nature GHG Protocol working group",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const NU_LOCATIONS = [
  { city: "Boston", role: "Main campus", anchor: true },
  { city: "Seattle", role: "Graduate campus" },
  { city: "Oakland", role: "Graduate campus" },
  { city: "Miami", role: "Graduate campus" },
  { city: "Portland", role: "Graduate campus" },
  { city: "London", role: "Global campus" },
  { city: "Vancouver", role: "Graduate campus" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
      {children}
    </span>
  );
}

function DataMatrix() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const grouped: Record<Availability, DataSource[]> = {
    "Available Now": [],
    "Requires Survey": [],
    "Requires IT Access": [],
    "Does Not Exist Yet": [],
  };
  DATA_SOURCES.forEach((d) => grouped[d.availability].push(d));

  return (
    <div ref={ref} className="space-y-4">
      {(Object.entries(grouped) as [Availability, DataSource[]][]).map(
        ([avail, sources], groupIdx) => {
          if (!sources.length) return null;
          const cfg = AVAIL_CONFIG[avail];
          return (
            <motion.div
              key={avail}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: groupIdx * 0.08 }}
            >
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: cfg.dot }}
                />
                <h3 className={`text-sm font-bold ${cfg.text} uppercase tracking-wider`}>
                  {avail}
                </h3>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-700">{sources.length} source{sources.length > 1 ? "s" : ""}</span>
              </div>

              {/* Source rows */}
              <div className="space-y-2 pl-5">
                {sources.map((src, i) => {
                  const precCfg = PREC_CONFIG[src.precision];
                  return (
                    <motion.div
                      key={src.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.35, delay: groupIdx * 0.08 + i * 0.05 + 0.1 }}
                      className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border} group`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-1.5 flex-wrap">
                            <h4 className="font-bold text-white text-sm leading-snug">{src.name}</h4>
                            <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${precCfg.bg} ${precCfg.text}`}>
                              {src.precision}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-2">{src.description}</p>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            <span className="text-green-700 font-medium">Potential: </span>
                            {src.potential}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[11px] text-gray-700 uppercase tracking-wider">{src.owner}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        }
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 pt-5 border-t border-green-900/20">
        {(Object.entries(AVAIL_CONFIG) as [Availability, typeof AVAIL_CONFIG[Availability]][]).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full" style={{ background: v.dot }} />
            {k}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-600">
          <span>Precision:</span>
          {(Object.entries(PREC_CONFIG) as [Precision, { text: string; bg: string }][]).map(([k, v]) => (
            <span key={k} className={`font-medium ${v.text}`}>{k}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ q, index }: { q: (typeof QUESTIONS)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-green-900/30 bg-[#0d1f10]"
    >
      {/* top gradient line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${q.color}88 0%, transparent 100%)` }} />

      {/* left glow */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 opacity-10"
        style={{ background: `linear-gradient(90deg, ${q.color} 0%, transparent 100%)` }}
      />

      <div className="relative p-7 sm:p-9">
        {/* question header */}
        <div className="flex items-start gap-5 mb-7">
          <div
            className="shrink-0 text-5xl font-black leading-none tabular-nums opacity-20"
            style={{ color: q.color }}
          >
            {q.number}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ background: q.color + "20", color: q.color }}
              >
                {q.type}
              </span>
              <span className="text-xs text-gray-600">{q.timeline} · {q.funding}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              &ldquo;{q.question}&rdquo;
            </h3>
          </div>
        </div>

        {/* methodology */}
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-4">Proposed methodology</p>
          <ol className="space-y-4">
            {q.methodology.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
                  style={{ background: q.color + "20", color: q.color }}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-gray-400 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* outputs */}
        <div className="rounded-xl bg-black/20 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">Expected outputs</p>
          <ul className="space-y-2">
            {q.outputs.map((out) => (
              <li key={out} className="flex items-center gap-2.5 text-sm text-gray-300">
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke={q.color} strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke={q.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {out}
              </li>
            ))}
          </ul>
        </div>

        {/* timeline badge */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-gray-700">Estimated timeline</span>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: q.color + "15", color: q.color }}
          >
            {q.timeline}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function HorizontalTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative">
      {/* connector line */}
      <div className="hidden sm:block absolute top-[38px] left-[calc(10%+20px)] right-[calc(10%+20px)] h-px bg-green-900/40" />
      <motion.div
        className="hidden sm:block absolute top-[38px] left-[calc(10%+20px)] h-px bg-gradient-to-r from-green-500 to-green-800 origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        style={{ right: "calc(10% + 20px)" }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-3">
        {TIMELINE_STEPS.map((step, i) => (
          <motion.div
            key={step.month}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.12 + 0.2 }}
            className="flex flex-col items-center text-center"
          >
            {/* node */}
            <div
              className="relative z-10 mb-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-600 bg-[#0a1a0f] text-green-400"
            >
              {step.icon}
              {/* glow ring on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                style={{ boxShadow: "0 0 16px rgba(34,197,94,0.5)" }} />
            </div>

            <span className="text-[11px] font-black uppercase tracking-widest text-green-600 mb-1">
              {step.month}
            </span>
            <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[160px]">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResearchAgendaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-28">

      {/* ── SECTION 1 · HEADER ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <SectionLabel>Research Agenda · Spring 2026</SectionLabel>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-5">
          From estimates to evidence:<br />
          <span className="text-green-400">a research agenda</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl leading-relaxed mb-8">
          What data exists, what&apos;s missing, and how Northeastern could lead on AI
          sustainability measurement — across all campuses.
        </p>

        {/* framing row */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Data sources identified", value: "7", note: "3 accessible now" },
            { label: "Research questions", value: "3", note: "With full methodology" },
            { label: "First results possible", value: "3 mo.", note: "With seed funding" },
          ].map(({ label, value, note }) => (
            <div key={label} className="rounded-xl border border-green-900/30 bg-green-950/10 px-5 py-4 flex items-center gap-4">
              <div
                className="text-3xl font-black text-green-400 tabular-nums leading-none"
                style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}
              >
                {value}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{label}</div>
                <div className="text-xs text-gray-600">{note}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── SECTION 2 · DATA MATRIX ─────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <SectionLabel>Data Availability Matrix</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            What data exists — and where the gaps are
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Every source mapped by availability and measurement precision. Green sources are
            ready to use today. Orange and red sources represent the research frontier.
          </p>
        </motion.div>
        <DataMatrix />
      </section>

      {/* ── SECTION 3 · RESEARCH QUESTIONS ──────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <SectionLabel>Research Questions</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Three questions the Incubator could own
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Each is tractable in 6–12 months, publishable, and positions Northeastern as the
            institution that defined the measurement standard for AI sustainability in higher education.
          </p>
        </motion.div>
        <div className="space-y-6">
          {QUESTIONS.map((q, i) => (
            <QuestionCard key={q.number} q={q} index={i} />
          ))}
        </div>
      </section>

      {/* ── SECTION 4 · LIVING LAB ───────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <SectionLabel>The Living Lab Opportunity</SectionLabel>
        <div className="relative overflow-hidden rounded-2xl border border-green-700/25 bg-[#0a1f10]">
          {/* background world-map SVG hint */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
            <svg viewBox="0 0 800 400" className="h-full w-full">
              <ellipse cx="400" cy="200" rx="380" ry="180" stroke="white" strokeWidth="0.5" fill="none" />
              <ellipse cx="400" cy="200" rx="260" ry="180" stroke="white" strokeWidth="0.5" fill="none" />
              <ellipse cx="400" cy="200" rx="140" ry="180" stroke="white" strokeWidth="0.5" fill="none" />
              <line x1="20" y1="200" x2="780" y2="200" stroke="white" strokeWidth="0.5" />
              <line x1="400" y1="20" x2="400" y2="380" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="relative p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug mb-5">
                  Northeastern&apos;s 24,000-person community is an extraordinary{" "}
                  <span className="text-green-400">living laboratory</span>
                </h3>
                <p className="text-base text-gray-400 leading-relaxed mb-5">
                  Distributed across 7 cities and 3 countries, using the same AI tools
                  against different grid intensities, cultural norms, and academic contexts —
                  this is a natural experiment that no single-site study can replicate.
                </p>
                <p className="text-base text-gray-400 leading-relaxed">
                  A standardized measurement framework developed at Northeastern could
                  become a model for universities worldwide. AASHE has 1,000+ member
                  institutions actively looking for exactly this kind of replicable methodology.
                  The first mover advantage is real, and the moment is now — before AI carbon
                  accounting becomes regulated and the easy wins are gone.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-5">
                  NU Campuses — 7 cities, 3 countries
                </p>
                <div className="space-y-2.5">
                  {NU_LOCATIONS.map(({ city, role, anchor }) => (
                    <div
                      key={city}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                        anchor
                          ? "border border-green-600/40 bg-green-950/40"
                          : "border border-green-900/25 bg-green-950/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${anchor ? "bg-green-400" : "bg-green-800"}`}
                        />
                        <span className={`font-semibold text-sm ${anchor ? "text-green-300" : "text-gray-400"}`}>
                          {city}
                        </span>
                        {anchor && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-950 rounded px-1.5 py-0.5">
                            Main
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-700">{role}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-green-900/30 bg-black/20 px-4 py-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Each campus sits on a different regional grid with a different carbon
                    intensity. Boston (ISO New England) vs. Oakland
                    (WECC) produces a natural control for grid effects on
                    the same AI usage pattern — a ready-made comparative study.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 5 · TIMELINE ─────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <SectionLabel>Next Steps</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            A 12-month path to publication
          </h2>
          <p className="text-sm text-gray-500 max-w-xl">
            Achievable with one researcher, one faculty advisor, and seed funding.
            Every milestone produces a standalone deliverable.
          </p>
        </motion.div>
        <HorizontalTimeline />
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-green-600/20 bg-[#0d2218] px-8 py-10 sm:px-12"
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 70% at 100% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-green-500/40 via-green-400/20 to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="text-lg font-bold text-white mb-2">
              This dashboard is a starting point, not the answer.
            </p>
            <p className="text-sm text-gray-400">
              The methodology is documented, the gaps are mapped, and the research questions
              are tractable. What it needs now is institutional commitment and a researcher
              with the access to close the loop.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition-all hover:bg-green-400 whitespace-nowrap"
            >
              Read the Methodology
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/benchmarks"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 px-6 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white whitespace-nowrap"
            >
              Back to Benchmarks
            </Link>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
