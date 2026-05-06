"use client";


import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResearchBrief } from "@/app/api/research-assistant/route";

// ─── Suggested queries ────────────────────────────────────────────────────────
const SUGGESTED_QUERIES = [
  "What is the carbon cost of training vs inference for large language models?",
  "Which universities are leading on AI sustainability measurement?",
  "How does Northeastern's estimated AI footprint compare to its overall carbon goals?",
  "What policy interventions could reduce university AI carbon by 30%?",
];

// ─── Research paper data ──────────────────────────────────────────────────────
const PAPERS = [
  {
    title: "Energy and Policy Considerations for Deep Learning in NLP",
    authors: "Strubell, Ganesh & McCallum",
    year: 2019,
    venue: "ACL 2019",
    tag: "Training Costs",
    tagColor: "text-red-400 border-red-800/40 bg-red-950/30",
    summary:
      "First major paper to quantify the financial and environmental cost of training state-of-the-art NLP models, revealing costs orders of magnitude larger than previously understood.",
    keyStat: "626,155 lbs CO₂",
    keyStatLabel: "to train one NLP model with full NAS",
    doi: "https://arxiv.org/abs/1906.02629",
  },
  {
    title: "Carbon Emissions and Large Neural Network Training",
    authors: "Patterson, Gonzalez, Le, et al.",
    year: 2021,
    venue: "arXiv / Google",
    tag: "LLM Training",
    tagColor: "text-orange-400 border-orange-800/40 bg-orange-950/30",
    summary:
      "Google researchers show that GPT-3's training carbon footprint is substantial, but that hardware choice and grid carbon intensity can reduce emissions by up to 100×.",
    keyStat: "552 t CO₂",
    keyStatLabel: "to train GPT-3 (could be 100× lower with optimization)",
    doi: "https://arxiv.org/abs/2104.10350",
  },
  {
    title: "Energy Usage Reports for Neural Network Training",
    authors: "Lottick, Susai, Friedler & Wilson",
    year: 2019,
    venue: "NeurIPS Climate Workshop",
    tag: "Measurement",
    tagColor: "text-blue-400 border-blue-800/40 bg-blue-950/30",
    summary:
      "Introduced the concept of Energy Usage Reports (EURs) for ML experiments, providing a framework for tracking and communicating energy costs analogous to financial reporting.",
    keyStat: "52.4 Wh",
    keyStatLabel: "average energy per ML experiment measured",
    doi: "https://arxiv.org/abs/1910.09700",
  },
  {
    title: "Green AI",
    authors: "Schwartz, Dodge, Smith & Etzioni",
    year: 2020,
    venue: "Communications of the ACM",
    tag: "Policy",
    tagColor: "text-green-400 border-green-700/40 bg-green-950/30",
    summary:
      "Coined the 'Red AI vs Green AI' framing and argued that efficiency should be a first-class research metric — not just accuracy — to counter unsustainable growth in AI compute.",
    keyStat: "10× per 18 months",
    keyStatLabel: "compute cost growth 2012–2019 (vs Moore's Law)",
    doi: "https://arxiv.org/abs/1907.10597",
  },
  {
    title: "Electricity 2024 — Data Centres and AI",
    authors: "International Energy Agency",
    year: 2024,
    venue: "IEA Report",
    tag: "Demand Forecast",
    tagColor: "text-purple-400 border-purple-800/40 bg-purple-950/30",
    summary:
      "Landmark IEA forecast projecting global data center electricity demand doubling by 2026, driven primarily by AI workloads — with the US and China accounting for most of the growth.",
    keyStat: "1,000 TWh",
    keyStatLabel: "projected global AI data center demand by 2026",
    doi: "https://www.iea.org/reports/electricity-2024",
  },
  {
    title: "Measuring the Carbon Intensity of AI in Cloud Instances",
    authors: "Dodge, Prewitt, Tachet des Combes, et al.",
    year: 2022,
    venue: "FAccT 2022",
    tag: "Cloud Carbon",
    tagColor: "text-teal-400 border-teal-700/40 bg-teal-950/30",
    summary:
      "Showed that the carbon intensity of identical AI workloads varies by up to 40× depending on cloud region and time of day, enabling significant reductions through smarter scheduling.",
    keyStat: "40× variance",
    keyStatLabel: "in carbon intensity across cloud regions and time of day",
    doi: "https://arxiv.org/abs/2206.05229",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TerminalPrompt({ value, onChange, onSubmit, loading }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  loading: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) onSubmit(value.trim());
    }
  }

  return (
    <div
      className="group flex gap-3 items-start rounded-xl border border-green-800/40 bg-[#060f08] p-4 focus-within:border-green-600/60 transition-colors cursor-text"
      onClick={() => ref.current?.focus()}
    >
      <span className="mt-0.5 shrink-0 font-mono text-sm text-green-600 select-none">›</span>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ask about AI energy consumption, sustainable computing, or Northeastern's research opportunities..."
        rows={2}
        disabled={loading}
        className="flex-1 resize-none bg-transparent text-sm text-gray-200 placeholder-gray-700 outline-none leading-relaxed disabled:opacity-50"
      />
      <button
        onClick={() => value.trim() && !loading && onSubmit(value.trim())}
        disabled={!value.trim() || loading}
        className="shrink-0 self-end flex items-center gap-2 rounded-lg bg-green-500 px-4 py-1.5 text-xs font-bold text-black transition-all hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
      >
        {loading ? (
          <>
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Researching
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5a.75.75 0 011.5 0v3.19l2.03 2.03a.75.75 0 01-1.06 1.06l-2.22-2.22A.75.75 0 017.25 8V4.5z" />
            </svg>
            Research
          </>
        )}
      </button>
    </div>
  );
}

function LoadingBrief() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-sm text-green-700">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-green-600"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
        <span className="font-mono text-xs tracking-wider">Researching — synthesizing literature…</span>
      </div>
      {[80, 60, 90, 70].map((w, i) => (
        <motion.div
          key={i}
          className="h-3 rounded bg-green-950/50"
          style={{ width: `${w}%` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function BriefSection({ label, children, delay = 0, accent = false }: {
  label: string;
  children: React.ReactNode;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl border p-5 ${
        accent
          ? "border-green-700/40 bg-green-950/20"
          : "border-green-900/25 bg-[#060f08]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-3">{label}</p>
      {children}
    </motion.div>
  );
}

function ResearchBriefDisplay({ brief, query, isDemo }: {
  brief: ResearchBrief;
  query: string;
  isDemo: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Brief header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 pb-4 border-b border-green-900/20"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Research Brief</span>
            {isDemo && (
              <span className="rounded-full border border-yellow-800/40 bg-yellow-950/30 px-2 py-0.5 text-[10px] font-semibold text-yellow-600">
                Demo Mode — set ANTHROPIC_API_KEY to enable live responses
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 leading-snug line-clamp-2 font-mono">&ldquo;{query}&rdquo;</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-gray-700 font-mono">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-[10px] text-green-800 font-mono">claude-sonnet-4-6</p>
        </div>
      </motion.div>

      {/* Summary */}
      <BriefSection label="Summary" delay={0.05} accent>
        <p className="text-sm text-gray-200 leading-relaxed">{brief.summary}</p>
      </BriefSection>

      {/* Key Findings */}
      <BriefSection label={`Key Findings (${brief.keyFindings.length})`} delay={0.12}>
        <ol className="space-y-3">
          {brief.keyFindings.map((f, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex items-start gap-3"
            >
              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-950/60 border border-green-800/40 text-[10px] font-black text-green-500 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">{f}</p>
            </motion.li>
          ))}
        </ol>
      </BriefSection>

      {/* Two-column: Implications + Next Steps */}
      <div className="grid sm:grid-cols-2 gap-4">
        <BriefSection label="University Implications" delay={0.3}>
          <p className="text-sm text-gray-400 leading-relaxed">{brief.implications}</p>
        </BriefSection>

        <BriefSection label="Suggested Next Steps" delay={0.36}>
          <ol className="space-y-3">
            {brief.nextSteps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 + i * 0.07 }}
                className="flex items-start gap-3"
              >
                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-950/60 border border-green-700/40 text-[10px] font-black text-green-400 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-400 leading-relaxed">{step}</p>
              </motion.li>
            ))}
          </ol>
        </BriefSection>
      </div>

      {/* Confidence note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-2.5 rounded-lg border border-yellow-900/25 bg-yellow-950/10 px-4 py-3"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-yellow-700 shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 4v2.5M8 10.5v.5" />
        </svg>
        <p className="text-xs text-yellow-700 leading-relaxed">
          <span className="font-semibold">Confidence note: </span>
          {brief.confidenceNote}
        </p>
      </motion.div>
    </motion.div>
  );
}

function PaperCard({ paper, index }: { paper: (typeof PAPERS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group flex flex-col rounded-2xl border border-green-900/25 bg-[#0a180d] p-5 hover:border-green-800/40 transition-colors"
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${paper.tagColor}`}>
          {paper.tag}
        </span>
        <span className="text-[11px] font-mono text-gray-700 shrink-0">{paper.year}</span>
      </div>

      {/* title */}
      <h3 className="text-sm font-black text-white leading-snug mb-1 flex-1">
        {paper.title}
      </h3>
      <p className="text-[11px] text-gray-600 mb-3">
        {paper.authors} · {paper.venue}
      </p>

      {/* summary */}
      <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{paper.summary}</p>

      {/* key stat */}
      <div className="rounded-lg border border-green-900/30 bg-green-950/15 px-3 py-2.5 mb-3">
        <p className="text-[10px] uppercase tracking-widest text-green-800 mb-1">Key Stat</p>
        <p className="font-black font-mono text-base text-green-400">{paper.keyStat}</p>
        <p className="text-[11px] text-gray-600 mt-0.5">{paper.keyStatLabel}</p>
      </div>

      {/* link */}
      <a
        href={paper.doi}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] text-green-800 hover:text-green-500 transition-colors font-medium group-hover:text-green-600"
      >
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3 w-3">
          <path d="M7 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M9 1h4m0 0v4m0-4L6 8" />
        </svg>
        Read paper
      </a>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading]   = useState(false);
  const [brief, setBrief]       = useState<ResearchBrief | null>(null);
  const [isDemo, setIsDemo]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  async function submit(q: string) {
    setQuery(q);
    setSubmitted(q);
    setLoading(true);
    setBrief(null);
    setError(null);
    setIsDemo(false);

    try {
      const res = await fetch("/api/research-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBrief(data as ResearchBrief);
        setIsDemo(!!data.demo);
      }
    } catch {
      setError("Network error — could not reach the research assistant.");
    } finally {
      setLoading(false);
    }
  }

  // Scroll to output when it arrives
  useEffect(() => {
    if ((brief || error) && outputRef.current) {
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [brief, error]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* ── SECTION 1 · HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-600 mb-5">
          AI-Powered · Sustainability Intelligence
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          Sustainable AI<br />
          <span className="text-green-400">Research Intelligence</span>
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
          Explore the latest research on AI energy consumption, carbon footprint, and sustainable computing.
          Powered by Claude — structured as a research brief, not a chatbot.
        </p>
      </motion.div>

      {/* ── SECTION 2 · RESEARCH ASSISTANT ───────────────────────────────── */}
      <section>
        {/* Terminal chrome */}
        <div className="rounded-2xl border border-green-900/30 bg-[#0a180d] overflow-hidden">

          {/* Panel header bar */}
          <div className="flex items-center justify-between gap-4 border-b border-green-900/25 px-5 py-3 bg-[#070e09]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-[11px] text-green-800 tracking-wider">
                nucarbon:research_assistant v1.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
              <span className="font-mono text-[10px] text-green-800">CONNECTED · claude-sonnet-4-6</span>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Suggested queries */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 mb-3">
                Suggested Research Queries
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); submit(q); }}
                    disabled={loading}
                    className="rounded-lg border border-green-900/40 bg-green-950/20 px-3 py-2 text-xs text-gray-400 text-left transition-all hover:border-green-700/50 hover:bg-green-950/40 hover:text-green-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 mb-2">
                Custom Query
              </p>
              <TerminalPrompt
                value={query}
                onChange={setQuery}
                onSubmit={submit}
                loading={loading}
              />
              <p className="mt-1.5 text-[10px] text-gray-700">
                Press Enter to submit · Shift+Enter for new line · Response structured as an academic research brief
              </p>
            </div>

            {/* Output area */}
            <div ref={outputRef} className="min-h-[80px]">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-3 pb-3 border-b border-green-900/20">
                      <span className="font-mono text-[11px] text-green-900">
                        QUERY: &ldquo;{submitted}&rdquo;
                      </span>
                    </div>
                    <LoadingBrief />
                  </motion.div>
                )}

                {!loading && error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-red-800/30 bg-red-950/20 px-5 py-4"
                  >
                    <p className="text-xs font-bold text-red-400 mb-1">Research Error</p>
                    <p className="text-sm text-gray-400">{error}</p>
                  </motion.div>
                )}

                {!loading && brief && (
                  <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="mb-4 pb-3 border-b border-green-900/20">
                      <span className="font-mono text-[11px] text-green-900">
                        QUERY: &ldquo;{submitted}&rdquo;
                      </span>
                    </div>
                    <ResearchBriefDisplay brief={brief} query={submitted} isDemo={isDemo} />
                  </motion.div>
                )}

                {!loading && !brief && !error && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 py-4"
                  >
                    <div className="h-px flex-1 bg-green-900/20" />
                    <span className="text-[11px] text-gray-700 font-mono">
                      Select a suggested query or type your own above
                    </span>
                    <div className="h-px flex-1 bg-green-900/20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · RESEARCH PAPERS ───────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-white mb-2">
            Core Literature
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Six landmark papers that define the field of AI energy accounting. Every number on this
            dashboard traces back to one of these sources.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PAPERS.map((paper, i) => (
            <PaperCard key={paper.title} paper={paper} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl border border-green-900/20 bg-green-950/10 px-5 py-4"
        >
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-500">Literature note: </span>
            This field is moving fast — these six papers represent the methodological foundation, but
            dozens of follow-on studies have refined the estimates. The IEA (2024) figures are the most
            current aggregate demand forecasts available. All NUCarbon estimates are derived from these
            sources applied to Northeastern-specific population and adoption rate assumptions.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
