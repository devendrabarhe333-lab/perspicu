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

Function:
Compress narrative expansion into structural clarity.

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
- No inference beyond the literal input.
- Maximum 180 words.
- End immediately after section 3.

Critical rule for section 2:

If the input contains no escalation, generalization, projection, or conclusion beyond stated facts, write exactly:

No expansion detected.

Do not infer.
Do not speculate.
Do not imply hidden meaning.
Do not use words such as:
implies, suggests, may reflect, indicates, potentially, likely.

Structure exactly:

1. What is happening:
Describe only observable elements directly stated in the input.

2. Where expansion occurs:
Identify structural escalation only if explicitly present.
If none exists, write:
No expansion detected.

3. What remains concrete:
State only grounded present facts from the input.

Tone:
Calm. Neutral. Precise. Mechanical. Slightly sobering.
          `.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ result: raw.trim() });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { result: "Processing error." },
      { status: 500 }
    );
  }
}
