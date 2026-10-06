"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ArrowRight, Car, Tv } from "lucide-react";
import Link from "next/link";
import { nuData, totalUsers } from "@/lib/data";

// ─── Core maths ────────────────────────────────────────────────────────────────
const DAILY_KG =
  totalUsers * nuData.avgQueriesPerPersonPerDay * nuData.energyPerQueryKwh * nuData.co2PerKwhKg;
const KG_PER_SECOND = DAILY_KG / 86400;

function semesterKgNow(): number {
  const start = new Date(nuData.semesterStartDate).getTime();
  const secondsElapsed = Math.max(0, (Date.now() - start) / 1000);
  return secondsElapsed * KG_PER_SECOND;
}

// ─── Hero Clock ─────────────────────────────────────────────────────────────────
function CarbonClock() {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const target = semesterKgNow();

    // Phase 1: count up from 0 → target in 2 s
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        // Phase 2: real-time tick
        let live = target;
        const tick = setInterval(() => {
          live += KG_PER_SECOND;
          setDisplay(live);
        }, 1000);
        // cleanup handled by component unmount below
        return () => clearInterval(tick);
      },
    });

    return () => controls.stop();
  }, []);

  const formatted = Math.floor(display).toLocaleString("en-US");

  return (
    <div className="flex flex-col items-center">
      {/* glow ring behind number */}
      <div
        className="pointer-events-none absolute h-[320px] w-[700px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, #22c55e 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* main number */}
      <div
        className="relative font-black tabular-nums leading-none tracking-tighter text-green-400"
        style={{
          fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
          textShadow:
            "0 0 30px rgba(34,197,94,0.7), 0 0 80px rgba(34,197,94,0.35)",
        }}
      >
        {formatted}
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-wide text-white/80 sm:text-3xl">
        kg CO₂
      </div>

      {/* pulsing dot + tagline */}
      <div className="mt-5 flex items-center gap-2.5 text-sm text-green-400/80">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        and counting — updated in real time
      </div>
    </div>
  );
}

// ─── Stat card with animated count-up ──────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: number;
  sub: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      delay,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-[#0d2218] p-7 text-center"
    >
      {/* subtle inner glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 65%)",
        }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">
        {label}
      </p>
      <div
        className="text-5xl font-black tabular-nums text-green-400"
        style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}
      >
        {Math.floor(display).toLocaleString("en-US")}
      </div>
      <p className="mt-2 text-sm text-gray-500">{sub}</p>
    </motion.div>
  );
}

// ─── Equivalency bar row ────────────────────────────────────────────────────────
function EquivRow({
  icon,
  count,
  label,
  sub,
  delay,
  color,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  sub: string;
  delay: number;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const barWidth = Math.min(100, (count / 10000) * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-white">
          <span style={{ color }}>{icon}</span>
          <span className="font-semibold">{label}</span>
        </div>
        <span className="font-black tabular-nums text-white text-lg" style={{ color }}>
          {count >= 1000
            ? (count / 1000).toFixed(1) + "k"
            : count.toLocaleString("en-US")}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${barWidth}%` } : { width: 0 }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-gray-600">{sub}</p>
    </motion.div>
  );
}

// ─── Typewriter subtitle ─────────────────────────────────────────────────────────
const TYPEWRITER_TEXT = "The first AI carbon intelligence platform built for a research university.";

function TypewriterSubtitle() {
  const [displayed, setDisplayed] = useState("");
  const [cursorOn, setCursorOn] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setDisplayed(TYPEWRITER_TEXT.slice(0, i));
        if (i >= TYPEWRITER_TEXT.length) {
          clearInterval(iv);
          setDone(true);
          setTimeout(() => setCursorOn(false), 900);
        }
      }, 36);
      return () => clearInterval(iv);
    }, 800);
    return () => clearTimeout(startDelay);
  }, []);

  return (
    <p className="mt-3 text-base sm:text-lg font-medium text-green-500/90 tracking-wide min-h-[1.75rem]">
      {displayed}
      {!done && cursorOn && (
        <span className="animate-pulse text-green-400 font-light">|</span>
      )}
    </p>
  );
}

// ─── Particle background ─────────────────────────────────────────────────────────
const PARTICLES = [
  { size: 4,  top: "78%", left: "12%",  dur: "8s",  delay: "0s",    dx: "18px"  },
  { size: 3,  top: "65%", left: "25%",  dur: "11s", delay: "1.4s",  dx: "-12px" },
  { size: 5,  top: "82%", left: "38%",  dur: "9s",  delay: "0.7s",  dx: "24px"  },
  { size: 3,  top: "70%", left: "52%",  dur: "12s", delay: "2.1s",  dx: "-8px"  },
  { size: 4,  top: "88%", left: "63%",  dur: "7.5s",delay: "0.3s",  dx: "14px"  },
  { size: 6,  top: "74%", left: "74%",  dur: "10s", delay: "1.8s",  dx: "-20px" },
  { size: 3,  top: "60%", left: "85%",  dur: "8.5s",delay: "0.9s",  dx: "10px"  },
  { size: 4,  top: "80%", left: "6%",   dur: "13s", delay: "3s",    dx: "-16px" },
  { size: 3,  top: "67%", left: "93%",  dur: "9.5s",delay: "1.1s",  dx: "8px"   },
];

function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            "--dur": p.dur,
            "--delay": p.delay,
            "--dx": p.dx,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function Home() {
  const semesterKg = semesterKgNow();
  const weekKg = DAILY_KG * 7;

  // Equivalencies based on semester total
  const flights = Math.round(semesterKg / 1500);
  const drives = Math.round(semesterKg / 70);
  const netflixHours = Math.round(semesterKg / 0.036);

  return (
    <div className="relative">
      {/* ── SECTION 1 · HERO ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <HeroParticles />

        {/* deep background radial */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(16,64,26,0.55) 0%, transparent 70%)",
          }}
        />

        {/* grid lines overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-green-700/40 bg-green-950/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-500">
            Northeastern University · Spring 2026
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-2 max-w-3xl text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          Estimated CO₂ from AI usage<br />
          at Northeastern
        </motion.h1>

        <TypewriterSubtitle />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4 mb-12 text-base font-medium text-green-700 uppercase tracking-widest"
        >
          This Semester
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl"
        >
          <CarbonClock />
        </motion.div>

        {/* sub-labels */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col items-center gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-1"
        >
          <span>24,000 Northeastern community members</span>
          <span className="hidden sm:inline text-green-900">·</span>
          <span>~{(totalUsers * nuData.avgQueriesPerPersonPerDay).toLocaleString()} AI queries per day</span>
          <span className="hidden sm:inline text-green-900">·</span>
          <span>Based on IEA 2024 published energy estimates</span>
        </motion.div>

        {/* Built over one week · Ilia Duda */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-5 right-6 text-[11px] text-gray-700 font-mono no-print select-none"
        >
          Built in one week · Ilia Duda · 2026
        </motion.div>
      </section>

      {/* ── SECTION 2 · STAT CARDS ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Today"
            value={DAILY_KG}
            sub={`kg CO₂ from AI at NU today`}
            delay={0}
          />
          <StatCard
            label="This Week"
            value={weekKg}
            sub={`kg CO₂ across 7 days`}
            delay={0.1}
          />
          <StatCard
            label="This Semester"
            value={semesterKg}
            sub={`kg CO₂ since Jan 13, 2026`}
            delay={0.2}
          />
        </div>
      </section>

      {/* ── SECTION 3 · WHAT THIS MEANS ──────────────────────────────────── */}
      <section className="border-t border-green-900/25 bg-[#080f0a]">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center text-3xl font-black text-white"
          >
            What This <span className="text-green-400">Means</span>
          </motion.h2>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT — equivalencies */}
            <div>
              <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-green-700">
                NU&apos;s semester AI footprint equals…
              </p>
              <div className="space-y-8">
                <EquivRow
                  icon={
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  }
                  count={flights}
                  label="Transatlantic flights"
                  sub={`÷ 1,500 kg CO₂ per Boston → London flight`}
                  delay={0.1}
                  color="#22c55e"
                />
                <EquivRow
                  icon={<Car className="h-5 w-5" />}
                  count={drives}
                  label="Boston → NYC drives"
                  sub={`÷ 70 kg CO₂ per round trip`}
                  delay={0.2}
                  color="#86efac"
                />
                <EquivRow
                  icon={<Tv className="h-5 w-5" />}
                  count={netflixHours}
                  label="Hours of Netflix streaming"
                  sub={`÷ 0.036 kg CO₂ per hour (SD, wired)`}
                  delay={0.3}
                  color="#4ade80"
                />
              </div>

              {/* footnote */}
              <p className="mt-8 text-xs text-gray-700 leading-relaxed">
                Equivalencies are illustrative order-of-magnitude comparisons. Sources: ICAO
                carbon calculator, EPA emissions factors, Carbon Trust streaming report (2023).
              </p>
            </div>

            {/* RIGHT — methodology + CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col justify-between gap-8"
            >
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-green-700">
                  Methodology
                </p>
                <p className="text-base leading-relaxed text-gray-400">
                  NUCarbon uses a bottom-up model combining published AI energy benchmarks
                  (IEA 2024, Patterson et al. 2021) with self-reported usage rates from
                  EDUCAUSE surveys across R1 universities. The US average grid intensity
                  (EPA eGRID2021) of{" "}
                  <span className="font-medium text-green-400">0.386 kg CO₂ / kWh</span>{" "}
                  converts energy to emissions.
                </p>
                <p className="mt-4 text-base leading-relaxed text-gray-400">
                  The estimate is conservative: it models{" "}
                  <span className="font-medium text-green-400">8 AI queries per person per day</span>{" "}
                  against Northeastern&apos;s 24,000-person community — excluding server-side
                  training, cooling overhead, and embodied hardware emissions.
                </p>

                {/* formula block */}
                <div className="mt-6 rounded-xl border border-green-900/30 bg-[#0d1f10] p-4 font-mono text-xs leading-6 text-gray-500">
                  <span className="text-green-600">daily_kg</span>
                  {" = "}
                  <span className="text-green-400">24,000</span>
                  {" × "}
                  <span className="text-green-400">8</span>
                  {" × "}
                  <span className="text-green-400">0.003 kWh</span>
                  {" × "}
                  <span className="text-green-400">0.386</span>
                  <br />
                  <span className="text-gray-700">{" ".repeat(11)}= {DAILY_KG.toFixed(2)} kg / day</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/ecosystem"
                  className="group flex w-full items-center justify-between rounded-xl bg-green-500 px-6 py-4 font-bold text-black transition-all hover:bg-green-400 active:scale-[0.98]"
                >
                  <span>Explore the AI Ecosystem</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/benchmarks"
                    className="flex items-center justify-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
                  >
                    Benchmarks
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/research-agenda"
                    className="flex items-center justify-center gap-2 rounded-xl border border-green-800/50 bg-green-950/30 py-3 text-sm font-medium text-green-300 transition-all hover:bg-green-900/40 hover:text-white"
                  >
                    Research Gaps
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
