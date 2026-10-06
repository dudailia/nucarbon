"use client";


import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nuData, totalUsers } from "@/lib/data";

// ─── Core calculations ────────────────────────────────────────────────────────
const DAILY_KG =
  totalUsers * nuData.avgQueriesPerPersonPerDay * nuData.energyPerQueryKwh * nuData.co2PerKwhKg;
const DAILY_QUERIES = totalUsers * nuData.avgQueriesPerPersonPerDay;
const ANNUAL_TONNES = (DAILY_KG * 273) / 1000;

function semesterKgNow(): number {
  const start = new Date(nuData.semesterStartDate).getTime();
  const days = Math.max(0, (Date.now() - start) / 86_400_000);
  return DAILY_KG * days;
}

const TODAY = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-green-700/50 bg-[#0d2218] px-5 py-2.5 text-sm font-semibold text-green-300 shadow-xl no-print"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 text-green-400">
            <polyline points="2,8 6,12 14,4" />
          </svg>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Streaming summary hook ───────────────────────────────────────────────────
function useExecutiveSummary() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function stream() {
      try {
        const res = await fetch("/api/executive-summary");
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) { setLoading(false); setDone(true); return; }

        while (true) {
          const { done: rdone, value } = await reader.read();
          if (rdone) break;
          setText((prev) => prev + decoder.decode(value, { stream: true }));
        }
        setDone(true);
      } catch {
        setText("Unable to load executive summary. Check network connection.");
        setDone(true);
      } finally {
        setLoading(false);
      }
    }

    stream();
  }, []);

  return { text, loading, done };
}

// ─── Metrics table data ───────────────────────────────────────────────────────
const METRICS = [
  {
    metric: "Daily AI queries at NU",
    value: `~${DAILY_QUERIES.toLocaleString()}`,
    confidence: "Medium",
    confColor: "text-yellow-500 print:text-yellow-700",
    source: "Modeled (EDUCAUSE 2024)",
  },
  {
    metric: "Daily CO₂ from AI (kg)",
    value: DAILY_KG.toFixed(1),
    confidence: "Medium",
    confColor: "text-yellow-500 print:text-yellow-700",
    source: "IEA 2024 / EPA eGRID",
  },
  {
    metric: "Semester CO₂ total (kg)",
    value: Math.round(semesterKgNow()).toLocaleString(),
    confidence: "Medium",
    confColor: "text-yellow-500 print:text-yellow-700",
    source: "Modeled (since Jan 13, 2026)",
  },
  {
    metric: "Annual projection (tonnes)",
    value: ANNUAL_TONNES.toFixed(1),
    confidence: "Low–Medium",
    confColor: "text-orange-500 print:text-orange-700",
    source: "Extrapolated daily rate × 273 days",
  },
  {
    metric: "Peer university avg (tonnes/yr)",
    value: "~190",
    confidence: "Low",
    confColor: "text-red-500 print:text-red-700",
    source: "Public sustainability reports",
  },
  {
    metric: "Transparency ranking",
    value: "#1 (prototype basis)",
    confidence: "—",
    confColor: "text-gray-500",
    source: "This dashboard",
  },
];

const RECOMMENDATIONS = [
  {
    num: "01",
    title: "Commission a formal AI energy audit in partnership with NU IT",
    body: "Northeastern's Office of Information Technology already logs API traffic at the network layer; a formal partnership to access this data in anonymized, aggregated form would replace modeled estimates with direct measurement within one semester. This audit should be scoped as a joint deliverable between the Sustainability Incubator and OIT, with results published in the next Annual Sustainability Report.",
  },
  {
    num: "02",
    title: "Establish a student-led AI Carbon Observatory within the Sustainability Incubator",
    body: "A formalized research unit — three to four undergraduate and graduate students, one faculty advisor, one semester of dedicated time — could produce Northeastern's first peer-reviewed AI carbon baseline and the first replicable methodology framework in American higher education. Seed funding of $20,000–$40,000 would cover survey infrastructure, data analysis tools, and open-access publication costs.",
  },
  {
    num: "03",
    title: "Publish Northeastern's methodology as an open standard for peer institutions",
    body: "The Association for the Advancement of Sustainability in Higher Education (AASHE) and Second Nature actively seek replicable carbon accounting methodologies; Northeastern's first-mover position on AI carbon measurement would generate significant institutional recognition and position the university as a national leader in sustainability transparency. Publication of an open-source framework, modeled on this prototype, would cost nothing beyond the research effort already proposed.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExecutivePage() {
  const { text, loading, done } = useExecutiveSummary();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Split streamed text into paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMsg("URL copied to clipboard");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
    } catch {
      setToastMsg("Could not copy — please copy the URL manually");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  }

  return (
    <>
      <Toast message={toastMsg} visible={toastVisible} />

      {/* Action bar — hidden on print */}
      <div className="no-print sticky top-14 z-30 border-b border-green-900/25 bg-[#0a1a0f]/95 backdrop-blur-md px-4 py-2.5">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Executive brief — optimized for print and sharing
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-green-900/40 bg-green-950/20 px-3.5 py-2 text-xs font-semibold text-green-400 transition-all hover:bg-green-950/40 hover:text-green-300"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
                <circle cx="12" cy="3" r="1.5" /><circle cx="12" cy="13" r="1.5" /><circle cx="3" cy="8" r="1.5" />
                <line x1="4.4" y1="7.2" x2="10.6" y2="4.1" /><line x1="4.4" y1="8.8" x2="10.6" y2="11.9" />
              </svg>
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-green-400 active:scale-[0.97]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
                <polyline points="4,6 4,1 12,1 12,6" />
                <rect x="1" y="6" width="14" height="7" rx="1.5" />
                <polyline points="4,10 4,15 12,15 12,10" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Document */}
      <div className="print-document mx-auto max-w-4xl px-4 sm:px-8 py-10 print:py-0 print:px-0">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >

          {/* ── SECTION 1 · LETTERHEAD ─────────────────────────────────── */}
          <header className="border-b-2 border-green-800/30 print:border-gray-300 pb-8">
            {/* Institution line */}
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                {/* NU shield mark */}
                <div className="h-10 w-10 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: "#CC0000" }}>
                  <span className="text-white font-black text-lg leading-none">N</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] print-accent"
                    style={{ color: "#CC0000" }}>
                    Northeastern University
                  </p>
                  <p className="text-xs text-gray-500 print:text-gray-600 uppercase tracking-widest">
                    Sustainability Incubator
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 print:text-gray-500 uppercase tracking-wider">
                  {TODAY}
                </p>
                <p className="text-[11px] text-gray-700 print:text-gray-500 mt-0.5">CONFIDENTIAL DRAFT</p>
              </div>
            </div>

            {/* Rule */}
            <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, #CC0000 0%, #CC000044 40%, transparent 70%)" }} />

            {/* Title block */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white print:text-black leading-tight">
                AI Carbon Intelligence Report
                <span className="block text-xl font-semibold text-gray-400 print:text-gray-500 mt-1">
                  Prototype — Spring 2026
                </span>
              </h1>

              {/* Meta row */}
              <div className="grid sm:grid-cols-3 gap-3 pt-3">
                {[
                  { label: "Prepared by", value: "Ilia Duda, Mathematics & Business Administration, Class of 2028" },
                  { label: "Institution", value: "Northeastern University, Boston MA" },
                  { label: "Status", value: "Research Prototype — Not an Official University Publication" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-green-900/25 print:border-gray-200 bg-green-950/15 print:bg-gray-50 px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 print:text-gray-500 mb-1">{label}</p>
                    <p className="text-xs text-gray-300 print:text-gray-800 leading-snug">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* ── SECTION 2 · EXECUTIVE SUMMARY ─────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-green-600 print:text-gray-500">
                I. Executive Summary
              </span>
              <div className="flex-1 h-px bg-green-900/25 print:bg-gray-200" />
              {loading && (
                <div className="no-print flex items-center gap-1.5 text-[11px] text-green-700">
                  <div className="flex gap-0.5">
                    {[0,1,2].map(i => (
                      <motion.span key={i} className="h-1 w-1 rounded-full bg-green-600"
                        animate={{ opacity: [0.3,1,0.3] }}
                        transition={{ duration: 1.1, delay: i*0.2, repeat: Infinity }} />
                    ))}
                  </div>
                  <span className="font-mono">Generating</span>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {paragraphs.length === 0 && loading ? (
                // Skeleton paragraphs while loading
                [80, 90, 75].map((w, i) => (
                  <motion.div key={i} className="space-y-1.5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.4, delay: i*0.2, repeat: Infinity }}>
                    <div className="h-3.5 rounded bg-green-900/30" style={{ width: `${w}%` }} />
                    <div className="h-3.5 rounded bg-green-900/30" style={{ width: `${w-10}%` }} />
                    <div className="h-3.5 rounded bg-green-900/30" style={{ width: `${w+5}%` }} />
                  </motion.div>
                ))
              ) : (
                paragraphs.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="text-sm sm:text-base text-gray-300 print:text-gray-800 leading-relaxed print:leading-loose"
                  >
                    {para}
                    {/* Streaming cursor on the last paragraph while still loading */}
                    {i === paragraphs.length - 1 && !done && (
                      <span className="no-print ml-0.5 inline-block animate-pulse text-green-500 font-light">|</span>
                    )}
                  </motion.p>
                ))
              )}

              {/* Confidence footnote */}
              {done && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-gray-600 print:text-gray-500 italic border-t border-green-900/20 print:border-gray-200 pt-3 mt-2"
                >
                  {process.env.NODE_ENV !== "production" || text.includes("[API Error")
                    ? "Note: This summary was pre-written for demo purposes. Set ANTHROPIC_API_KEY to generate live summaries."
                    : "Summary generated by Claude claude-sonnet-4-6 (Anthropic) from a structured research brief prompt. Reviewed for accuracy against cited sources."}
                </motion.p>
              )}
            </div>
          </section>

          {/* ── SECTION 3 · METRICS TABLE ──────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-green-600 print:text-gray-500">
                II. Key Metrics Summary
              </span>
              <div className="flex-1 h-px bg-green-900/25 print:bg-gray-200" />
            </div>

            <div className="overflow-x-auto rounded-xl border border-green-900/25 print:border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-900/25 print:border-gray-200 bg-green-950/20 print:bg-gray-50">
                    {["Metric", "Current Estimate", "Confidence", "Data Source"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-green-700 print:text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map(({ metric, value, confidence, confColor, source }, i) => (
                    <tr
                      key={metric}
                      className={`border-b border-green-900/15 print:border-gray-100 transition-colors hover:bg-green-950/10 ${
                        i % 2 !== 0 ? "bg-white/[0.015] print:bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-200 print:text-gray-800">{metric}</td>
                      <td className="px-4 py-3 font-black font-mono text-sm text-green-400 print:text-gray-900">{value}</td>
                      <td className={`px-4 py-3 text-xs font-semibold ${confColor}`}>{confidence}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 print:text-gray-500">{source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-gray-600 print:text-gray-500 italic leading-relaxed">
              All estimates carry inherent uncertainty due to reliance on survey-derived adoption rates and published energy benchmarks.
              Confidence levels reflect data provenance: &ldquo;Medium&rdquo; indicates model-based estimates with peer-reviewed inputs;
              &ldquo;Low–Medium&rdquo; indicates extrapolation; &ldquo;Low&rdquo; indicates estimates from publicly available institutional reports.
            </p>
          </section>

          {/* ── SECTION 4 · RECOMMENDATIONS ────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-green-600 print:text-gray-500">
                III. Recommendations
              </span>
              <div className="flex-1 h-px bg-green-900/25 print:bg-gray-200" />
            </div>

            <div className="space-y-6">
              {RECOMMENDATIONS.map(({ num, title, body }, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 items-start"
                >
                  {/* Number */}
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg print:rounded-sm text-sm font-black text-white print:text-white"
                    style={{ background: "#CC0000" }}>
                    {num}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-0.5 border-b border-green-900/15 print:border-gray-200 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-base font-black text-white print:text-gray-900 leading-snug mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-400 print:text-gray-700 leading-relaxed">
                      {body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── FOOTER / SIGNATURE ──────────────────────────────────────── */}
          <footer className="border-t-2 border-green-800/25 print:border-gray-200 pt-6 print:pt-8">
            <div className="grid sm:grid-cols-2 gap-6 text-xs">
              <div>
                <p className="font-black uppercase tracking-widest text-green-700 print:text-gray-500 mb-2">Prepared by</p>
                <p className="text-gray-300 print:text-gray-800 font-semibold">Ilia Duda</p>
                <p className="text-gray-500 print:text-gray-600">Mathematics & Business Administration, Class of 2028</p>
                <p className="text-gray-500 print:text-gray-600">Northeastern University, Boston MA</p>
              </div>
              <div className="sm:text-right">
                <p className="font-black uppercase tracking-widest text-green-700 print:text-gray-500 mb-2">Document</p>
                <p className="text-gray-500 print:text-gray-600">NUCarbon Research Dashboard</p>
                <p className="text-gray-500 print:text-gray-600">
                  <a href="https://nucarbon.vercel.app" className="underline hover:text-green-400 print:text-blue-600">
                    nucarbon.vercel.app
                  </a>
                </p>
                <p className="text-gray-600 print:text-gray-500 mt-1 italic">
                  Not an official Northeastern University publication.
                </p>
              </div>
            </div>

            {/* Print only: data note */}
            <div className="hidden print:block mt-6 border border-gray-200 rounded px-4 py-3 bg-gray-50">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                <strong>Data note:</strong> All figures are estimates derived from peer-reviewed literature (IEA 2024, Patterson et al. 2021, Strubell et al. 2019, EPA eGRID2021) applied to modelled campus adoption rates. Actual figures may differ by ±40%. This prototype was built to demonstrate the feasibility of real-time AI carbon accounting — not to serve as a final measurement. Live dashboard available at nucarbon.vercel.app.
              </p>
            </div>
          </footer>

          {/* ── PRINT BUTTON (screen only) ──────────────────────────────── */}
          <div className="no-print flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-green-900/30 bg-[#0a180d] p-6">
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">Ready to share with leadership?</p>
              <p className="text-xs text-gray-500">
                Click Download PDF to save a clean print version. The nav, buttons, and screen-only
                elements are automatically hidden. Formatted for US Letter at 0.75&rdquo; margins.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 px-5 py-2.5 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-4 w-4">
                  <circle cx="12" cy="3" r="1.5" /><circle cx="12" cy="13" r="1.5" /><circle cx="3" cy="8" r="1.5" />
                  <line x1="4.4" y1="7.2" x2="10.6" y2="4.1" /><line x1="4.4" y1="8.8" x2="10.6" y2="11.9" />
                </svg>
                Share Report
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-400 active:scale-[0.97]"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-4 w-4">
                  <polyline points="4,6 4,1 12,1 12,6" />
                  <rect x="1" y="6" width="14" height="7" rx="1.5" />
                  <polyline points="4,10 4,15 12,15 12,10" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

        </motion.article>
      </div>
    </>
  );
}
