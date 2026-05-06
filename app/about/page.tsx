"use client";


import { motion } from "framer-motion";
import { nuData, aiTools } from "@/lib/data";

const sources = [
  {
    title: "Patterson et al. (2021)",
    venue: "Communications of the ACM",
    finding: "Training GPT-3 emitted ~500 tonnes CO₂e; inference per query estimated at ~0.001–0.01 kWh depending on model size.",
    url: null,
  },
  {
    title: "Strubell, Ganesh & McCallum (2019)",
    venue: "ACL 2019",
    finding: "Training a single NLP model can emit as much CO₂ as five cars over their lifetimes. Popularized per-query energy framing.",
    url: null,
  },
  {
    title: "IEA Data Centres Report (2023)",
    venue: "International Energy Agency",
    finding: "Global data center electricity use: 200–250 TWh/yr. AI workloads are fastest-growing segment.",
    url: null,
  },
  {
    title: "EPA eGRID 2022 — NEWE Subregion",
    venue: "U.S. Environmental Protection Agency",
    finding: "New England grid emission factor: 0.386 kg CO₂/kWh (includes natural gas, nuclear, hydro, wind mix).",
    url: null,
  },
  {
    title: "EDUCAUSE AI Horizon Report (2024)",
    venue: "EDUCAUSE",
    finding: "65% of students at R1 institutions report weekly ChatGPT use; Copilot adoption in STEM 40–45%.",
    url: null,
  },
  {
    title: "Samsi et al. (2023) — MLCommons",
    venue: "arXiv / MLCommons",
    finding: "Inference benchmarks showing GPT-4 class models at ~0.002–0.005 kWh/query on A100-class hardware.",
    url: null,
  },
];

const assumptions = [
  { label: "Student population", value: nuData.studentPopulation.toLocaleString(), note: "NU Fall 2025 enrollment (public)" },
  { label: "Faculty & staff", value: nuData.facultyStaff.toLocaleString(), note: "NU HR headcount estimate" },
  { label: "Queries / person / day", value: nuData.avgQueriesPerPersonPerDay, note: "Avg across all tools, weighted by adoption" },
  { label: "Base energy (ChatGPT)", value: "3 Wh", note: "Patterson 2021 + Samsi 2023 midpoint" },
  { label: "Grid intensity (NE-ISO)", value: "0.386 kg CO₂/kWh", note: "EPA eGRID 2022 NEWE" },
  { label: "Semester start", value: nuData.semesterStartDate, note: "Spring 2026 first day of classes" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-black text-white mb-3">
          Methodology &amp; <span className="text-green-400">Data Sources</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mb-12">
          NUCarbon uses a bottom-up estimation model: adoption rates × query volume × per-query energy ×
          grid carbon intensity. Every assumption is documented and contestable.
        </p>
      </motion.div>

      {/* Model overview */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">Estimation Model</h2>
        <div className="rounded-2xl border border-green-900/40 bg-green-950/20 p-6 font-mono text-sm leading-relaxed">
          <p className="text-green-300">
            <span className="text-gray-600">{/* for each AI tool: */}</span>
            <span className="text-gray-500 italic">for each AI tool:</span>
          </p>
          <p className="text-white mt-2">daily_users = total_campus × adoption_rate</p>
          <p className="text-white">daily_queries = daily_users × avg_queries_per_day</p>
          <p className="text-white">daily_kwh = daily_queries × energy_per_query_kwh</p>
          <p className="text-white">daily_co2_kg = daily_kwh × grid_intensity_kg_per_kwh</p>
          <p className="text-white mt-2">semester_co2_kg = Σ(daily_co2_kg) × days_since_start</p>
          <p className="text-gray-500 mt-2 italic">Uncertainty: ±40% due to self-report bias and hardware variability</p>
        </div>
      </motion.section>

      {/* Key assumptions */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">Key Assumptions</h2>
        <div className="overflow-x-auto rounded-xl border border-green-900/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-900/30 bg-green-950/30">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-green-600">Parameter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-green-600">Value Used</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-green-600">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {assumptions.map(({ label, value, note }, i) => (
                <tr key={label} className={`border-b border-green-900/20 ${i % 2 === 0 ? "" : "bg-green-950/10"}`}>
                  <td className="px-4 py-3 text-gray-300 font-medium">{label}</td>
                  <td className="px-4 py-3 font-mono text-green-300">{value}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* AI tool energy sources */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">Per-Tool Energy Figures</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {aiTools.map((tool) => (
            <div key={tool.name} className="rounded-lg border border-green-900/30 bg-green-950/10 px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: tool.color }} />
                <span className="text-sm font-medium text-white">{tool.name}</span>
              </div>
              <span className="font-mono text-xs text-green-400 shrink-0">
                {(tool.energyPerUseKwh * 1000).toFixed(1)} Wh/query
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Image generation tools (Midjourney) use diffusion-model inference benchmarks from MLCommons (2023).
          Audio tools use Whisper-large-v3 A100 measurements.
        </p>
      </motion.section>

      {/* Literature cited */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h2 className="text-xl font-bold text-white mb-6">Literature &amp; Data Sources</h2>
        <div className="space-y-4">
          {sources.map(({ title, venue, finding }) => (
            <div key={title} className="rounded-xl border border-green-900/30 bg-green-950/10 p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-green-300 text-sm">{title}</h3>
                <span className="text-xs text-gray-600 shrink-0">{venue}</span>
              </div>
              <p className="text-sm text-gray-400">{finding}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-yellow-900/30 bg-yellow-950/10 p-5">
          <h3 className="text-sm font-semibold text-yellow-400 mb-2">Limitations &amp; Caveats</h3>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-700 shrink-0" />Adoption percentages are extrapolated from peer-institution surveys, not NU-specific measurements.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-700 shrink-0" />Energy figures vary by model version, prompt length, and data center location. Reported values are midpoint estimates.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-700 shrink-0" />This prototype has not been peer reviewed or validated by NU Office of Sustainability.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-700 shrink-0" />Scope 3 attribution methodology is proposed, not settled under any GHG Protocol standard.</li>
          </ul>
        </div>
      </motion.section>
    </div>
  );
}
