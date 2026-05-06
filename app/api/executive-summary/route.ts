import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are writing a 3-paragraph executive summary for a university provost about AI carbon footprint at a research university. Write in formal, measured institutional prose.

Paragraph 1: The scale of the issue — how AI tool adoption at research universities is creating a new, unmeasured category of carbon emissions, with specific reference to energy benchmarks from the IEA and peer-reviewed literature.

Paragraph 2: What a prototype dashboard like this demonstrates is possible — real-time carbon accounting, peer benchmarking, scenario modeling, and research intelligence, all built from published data and open methodology.

Paragraph 3: The recommended next steps for institutional action — specifically a formal IT partnership to access usage data, establishment of a student-led measurement program, and publication of a methodology that could serve as a national standard.

Keep each paragraph to exactly 3 sentences. Do not use bullet points, headers, or markdown. Write as if this text will appear in a formal brief handed to a university president. Tone: serious, evidence-based, not alarmist. Use "Northeastern" to refer to the institution.`;

const DEMO_TEXT = `The rapid proliferation of artificial intelligence tools across university campuses represents an emerging and largely unmeasured category of institutional carbon emissions. Research from the International Energy Agency (2024) projects global data center energy demand — driven substantially by AI inference workloads — to reach 1,000 TWh by 2026, yet no major American research university currently disaggregates AI-related consumption in its annual sustainability reporting. Northeastern University's estimated daily AI footprint of approximately 222 kilograms of CO₂-equivalent, extrapolated from published benchmarks and campus adoption data, illustrates both the scale of this gap and the urgency of addressing it.

The NUCarbon prototype demonstrates that rigorous, methodology-driven AI carbon accounting is achievable with existing data and modest institutional investment. Drawing on five peer-reviewed sources and publicly available grid emissions data, the dashboard provides real-time semester and annual CO₂ projections, tool-by-tool energy intensity comparisons, peer institution benchmarking across ten research universities, and an interactive scenario simulator allowing administrators to model the impact of policy interventions. Built in a matter of days by a single undergraduate student, this prototype establishes that a production-grade system — one incorporating actual IT network logs and facilities data — is well within Northeastern's technical and organizational capacity.

The Sustainability Incubator is positioned to lead the development of the first comprehensive, open-methodology AI carbon intelligence system at any American research university. As an immediate next step, Northeastern should commission a formal partnership between the Sustainability Incubator and Office of Information Technology to obtain anonymized API traffic data and software license counts, establishing the empirical foundation that current estimates lack. Concurrently, formalizing a student-led AI Carbon Observatory within the Incubator — with faculty advising and a modest seed grant — would generate publishable research while producing a replicable framework that AASHE's 1,000-plus member institutions could adopt as a national standard.`;

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Simulate a slow reveal of the demo text (character streaming)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream the demo text in chunks to mimic real streaming
        const words = DEMO_TEXT.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(chunk));
          // Small delay between words for the streaming effect
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Write the executive summary now." }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n\n[API Error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
