import { NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_INPUT_CHARS = 1200;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let input = String(body?.text || "").trim();

    if (!input) {
      return NextResponse.json({ result: "" });
    }

    if (input.length > MAX_INPUT_CHARS) {
      input = input.slice(0, MAX_INPUT_CHARS);
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 550,
      messages: [
        {
          role: "system",
          content: `
You are Perspecu.

Function:
Reduce narrative distortion into structural clarity and grounded containment.

Non-negotiable rules:

- Output EXACTLY four numbered sections.
- No introduction.
- No summary.
- No advice.
- No reassurance.
- No motivational tone.
- No therapy language.
- No second-person language.
- No emotional labeling (avoid words like anxiety, fear, insecurity, trauma, guilt, etc.).
- No hypothetical framing.
- Maximum 220 words.
- End immediately after section 4.

Structure exactly:

1. Situation:
State only observable facts directly expressed in the input. Remove exaggeration and interpretation.

2. Expansion:
Identify where the input extends a specific event into a broader conclusion, identity statement, future prediction, or global pattern.
If none exists, write exactly:
No expansion detected.

3. Structural reality:
Describe the actual measurable conditions present. Separate observable facts from inferred meaning.
Do not repeat section 1.

4. Contained conclusion:
Provide a grounded structural compression of the dynamic. No comfort. No advice. No emotion. Just the stable configuration that remains.

Tone:
Neutral. Precise. Direct. Stabilizing. Controlled.
`.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    let raw = completion.choices[0]?.message?.content?.trim() ?? "";

    // ---- Structural Guard: prevent Section similarity ----
    const sections = raw.split(/\n(?=\d\.\s)/);

    if (sections.length === 4) {
      const section1 = sections[0].toLowerCase().replace(/\s+/g, " ").trim();
      const section4 = sections[3].toLowerCase().replace(/\s+/g, " ").trim();

      if (section1 === section4 || section4.length > section1.length * 1.2) {
        raw = raw.replace(
          sections[3],
          "4. Contained conclusion:\nDynamic remains limited to the described interaction. Broader conclusions unsupported."
        );
      }
    }

    return NextResponse.json({ result: raw });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { result: "Processing error." },
      { status: 500 }
    );
  }
}
