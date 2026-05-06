import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SimState = {
  users: number;
  queriesPerDay: number;
  highEnergyPct: number;
  efficientPct: number;
  includeDataCenter: boolean;
  offsetActive: boolean;
  compareWith: string;
  dailyCO2: number;
  semesterCO2: number;
  annualCO2: number;
  status: "green" | "yellow" | "red";
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on this deployment." },
      { status: 503 }
    );
  }

  let state: SimState;
  try {
    state = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a sustainability advisor briefing a university provost. Write exactly 3 sentences — no more, no less — as an executive summary of the following AI carbon footprint simulation results for Northeastern University. Use the specific numbers provided. End with a single, concrete recommendation.

Simulation parameters:
- Active AI users: ${state.users.toLocaleString()} of 24,000 campus community
- Queries per person per day: ${state.queriesPerDay}
- High-energy tool users (image/video AI): ${state.highEnergyPct}%
- Efficient model users: ${state.efficientPct}%
- NU data center AI workloads included: ${state.includeDataCenter ? "yes (+40%)" : "no"}
- Carbon offset program: ${state.offsetActive ? "active (−25%)" : "inactive"}

Computed emissions:
- Daily CO₂: ${state.dailyCO2.toFixed(1)} kg
- Semester CO₂: ${(state.semesterCO2 / 1000).toFixed(1)} tonnes
- Annual CO₂: ${(state.annualCO2 / 1000).toFixed(1)} tonnes
- Risk level: ${state.status === "green" ? "LOW (within best-practice range)" : state.status === "yellow" ? "MODERATE (efficiency measures warranted)" : "HIGH (institutional action required)"}

Write the 3-sentence provost briefing now:`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ summary: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Claude API error: ${msg}` }, { status: 500 });
  }
}
