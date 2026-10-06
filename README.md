# NUCarbon

An estimation dashboard for the carbon cost of AI tool use across Northeastern University: it models campus-wide AI energy consumption from published per-query energy figures and assumed adoption rates, then makes the assumptions visible and editable.

**Live:** https://nucarbon.vercel.app

---

## Status

Built in one week as a self-contained prototype. It is complete and deployed, but it is **a model, not a measurement system** — see [What the numbers are](#what-the-numbers-are). There is no test suite and no backend; every figure derives from constants in `lib/data.ts`.

## What the numbers are

This is the most important thing to understand before reading any chart.

NUCarbon does **not** measure anything. It has no telemetry, no meter feed, and no integration with any Northeastern system. Every number on the site is computed from a small set of published coefficients and stated assumptions in [`lib/data.ts`](lib/data.ts):

- 20,000 students + 4,000 faculty and staff (24,000 total)
- ~8 AI queries per person per day
- per-query energy by tool, 0.001–0.02 kWh, from published inference-energy estimates
- 0.386 kg CO₂ per kWh grid intensity, the EPA eGRID2021 US average (852.3 lb CO₂e/MWh)
- per-tool daily adoption rates (e.g. ChatGPT 65%, Copilot 40%), which are assumptions, not survey data

Change any one of those and every headline moves. The counter on the landing page ticks upward in real time, but it is extrapolating the model forward on the client clock — it is not a live reading. The in-app "Data Methodology" badge and the About page state the same caveats, and figure sources are cited to the underlying papers (Strubell et al., Patterson et al., Lacoste et al., Schwartz et al., IEA 2024).

Treat the output as an order-of-magnitude sizing exercise, which is what it is good for.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind 3.4, self-hosted Geist |
| Charts | Recharts, plus D3 + TopoJSON for the US state choropleth |
| Motion | Framer Motion (page transitions, loading sequence, scroll reveals) |
| AI | Anthropic SDK — three server routes, all optional |
| Hosting | Vercel |

About 7,200 lines across `app/`, `components/`, and `lib/`. Nine pages: landing, simulator, benchmarks, compare, ecosystem, executive, research, research agenda, living lab.

## What was technically hard

**Making an assumption-driven model honest without making it boring.** The failure mode for a project like this is a confident dashboard that hides the fact that its inputs are guesses. The design response was to make the assumptions first-class: a persistent Data Methodology badge on every page, a scenario simulator that lets a reader change adoption rates and per-query energy and watch the headline move, and source citations on the research page pointing at the actual papers the coefficients came from. The credibility of the artifact comes from being auditable, not from being precise.

**A choropleth without a mapping library.** The state comparison view renders from the raw `us-atlas` TopoJSON fetched at runtime and projected with D3 (`topojson-client` + `d3-geo`) directly into SVG, rather than pulling in a full mapping stack for one view. Keeps the bundle small; costs a hand-written projection and fit.

**Degrading cleanly without an API key.** The three AI routes (`/api/research-assistant`, `/api/generate-report`, `/api/executive-summary`) each check `ANTHROPIC_API_KEY` before constructing a client and return a structured error if it is absent. Every chart, the simulator, and all nine pages render fully without it, so the site is deployable and reviewable with zero configuration.

## Setup

Requires Node 18+.

```bash
git clone https://github.com/dudailia/nucarbon.git
cd nucarbon
npm install
cp .env.example .env.local   # optional — only needed for the AI surfaces
npm run dev                  # http://localhost:3000
```

The only variable is `ANTHROPIC_API_KEY`, and it is optional. Without it the site builds and runs; only the research assistant, the simulator's generated report, and the executive summary return an error. `.env.example` documents this and contains no real values.

```bash
npm run build
npm run lint
```

## Attribution

Built for the Northeastern University Sustainability Incubator. Northeastern University is not the publisher of this site and has not endorsed these estimates.

## License

No license file. All rights reserved.
