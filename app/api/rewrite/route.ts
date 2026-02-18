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
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `
You are Perspecu.

Purpose:
Compress narrative input into structural clarity.

This is not paraphrasing.
Each section must perform a distinct transformation.

Non-negotiable rules:

- Output EXACTLY three numbered sections.
- No introduction.
- No summary.
- No closing sentence.
- No advice.
- No reassurance.
- No motivational tone.
- No empathy language.
- No second person language.
- No emotional vocabulary.
- No future framing.
- No hypothetical phrasing.
- No interpretive labeling.
- No inference beyond literal input.
- Maximum 180 words.
- End immediately after section 3.

Structure exactly:

1. Situation
Clear structural description of what occurred.
Remove narrative phrasing.

2. Expansion
Identify explicit escalation, generalization, or projection ONLY if directly stated.
If none exists, write exactly:
No expansion detected.

3. Concrete facts
Reduce to irreducible, countable, verifiable units.
Shorter than section 1.
Do not restate section 1.
Do not mirror sentence structure.
If similarity appears, compress further.
Use minimal phrasing.

Disallowed words:
implies, suggests, may reflect, indicates, potentially, likely.

Tone:
Neutral. Precise. Mechanical.
`.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    let raw = completion.choices[0]?.message?.content?.trim() ?? "";

    // ---- Structural Guard: prevent Section 1 == Section 3 ----
    const sections = raw.split(/\n(?=\d\.\s)/);

    if (sections.length === 3) {
      const section1 = sections[0].toLowerCase().replace(/\s+/g, " ").trim();
      const section3 = sections[2].toLowerCase().replace(/\s+/g, " ").trim();

      // If section 3 is too similar to section 1, force stronger compression
      if (section1 === section3 || section3.length > section1.length * 0.9) {
        raw = raw.replace(
          sections[2],
          "3. Concrete facts\nContent insufficiently reduced. Recompression required."
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
