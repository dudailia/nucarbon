import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a sustainability research analyst specializing in AI energy consumption and university carbon accounting. You write in clear, academic but accessible prose. Your audience is sustainability directors, university provosts, and research leads at R1 institutions.

When answering questions, respond ONLY with valid JSON in this exact structure — no other text, no markdown fences, just the raw JSON object:

{
  "summary": "Exactly 2 sentences summarizing the core answer and its significance.",
  "keyFindings": [
    "Finding 1 — include a specific number, percentage, or cited statistic wherever possible.",
    "Finding 2 — same requirement.",
    "Finding 3 — same requirement.",
    "Finding 4 — optional fourth finding if the topic warrants it."
  ],
  "implications": "One substantial paragraph (4-6 sentences) on what this means specifically for research universities — not corporations, not government, not consumers. Speak to the specific constraints and opportunities of a university setting: fixed annual budgets, student populations, research infrastructure, accreditation pressures, and sustainability reporting obligations.",
  "nextSteps": [
    "Step 1 — concrete, specific, actionable within a university context.",
    "Step 2 — concrete, specific, actionable within a university context.",
    "Step 3 — concrete, specific, actionable within a university context."
  ],
  "confidenceNote": "One sentence honestly noting the key uncertainty or limitation in this analysis."
}

Always acknowledge uncertainty in estimates. Tone: credible, precise, not alarmist. Never hallucinate specific institutions' unpublished data.`;

export type ResearchBrief = {
  summary: string;
  keyFindings: string[];
  implications: string;
  nextSteps: string[];
  confidenceNote: string;
};

// Fallback demo response when no API key is configured
const DEMO_RESPONSE: ResearchBrief = {
  summary:
    "AI inference workloads at US research universities are estimated to consume between 50–400 tonnes of CO₂ per year depending on campus size, research intensity, and tool adoption rates. This footprint is currently invisible in most institutional carbon accounting frameworks because no standard methodology exists for attributing cloud-based AI energy use to end institutions.",
  keyFindings: [
    "Training a large language model (e.g., GPT-3) produces approximately 552 tonnes CO₂e — equivalent to ~5 years of average US household emissions — though inference at scale can ultimately dwarf training costs (Patterson et al., 2021).",
    "The carbon intensity of identical AI workloads varies up to 40× depending on cloud region and time of day, suggesting that scheduling and provider selection are higher-leverage interventions than model choice alone (Dodge et al., 2022).",
    "Data center energy demand attributable to AI is projected to reach 1,000 TWh globally by 2026, up from 460 TWh in 2022 — a growth rate outpacing all other computing workload categories (IEA, 2024).",
    "No major US research university currently publishes AI-disaggregated carbon data in its annual sustainability report, representing both a transparency gap and a first-mover opportunity.",
  ],
  implications:
    "For research universities, the AI carbon challenge intersects uniquely with three institutional pressures: Second Nature carbon neutrality commitments, AASHE STARS ratings that increasingly weight scope 3 emissions, and the rapid AI adoption driven by both student demand and faculty research activity. Unlike corporate environments where a CTO can mandate model selection, universities must work through diffuse adoption patterns across thousands of independent researchers and students. This suggests that measurement and transparency — rather than top-down restriction — are the most viable first interventions. A university that establishes and publishes a credible AI carbon accounting methodology positions itself to lead a field that has no current standard-bearer.",
  nextSteps: [
    "Commission a pilot usage survey (n ≥ 300, stratified by college) to establish baseline AI tool adoption rates — this takes 6 weeks and costs under $5,000, generating data no peer institution currently has.",
    "Engage the university's OIT to determine whether API traffic to AI endpoints (OpenAI, Anthropic, GitHub Copilot) is logged at the network layer — if yes, this is the highest-precision data source available.",
    "Draft a one-page methodology note proposing how AI-related emissions should be categorized in the university's annual GHG inventory, and submit it to the Sustainability office for review.",
  ],
  confidenceNote:
    "All footprint estimates in this brief are derived from peer-reviewed literature applied to modelled adoption rates — actual figures could differ by ±50% without institution-specific measurement.",
};

export async function POST(req: NextRequest) {
  let query: string;
  try {
    const body = await req.json();
    query = String(body.query ?? "").trim();
    if (!query) return NextResponse.json({ error: "Query is required." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return a rich demo response so the page is still useful without a key
    return NextResponse.json({ ...DEMO_RESPONSE, demo: true });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    let brief: ResearchBrief;
    try {
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
      brief = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, return a structured error with the raw text
      return NextResponse.json({
        error: "Response parsing failed. Raw output below.",
        raw,
      }, { status: 500 });
    }

    return NextResponse.json(brief);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Claude API error: ${msg}` }, { status: 500 });
  }
}
