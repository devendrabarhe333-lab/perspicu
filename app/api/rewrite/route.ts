import { NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_INPUT_CHARS = 1200;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const inputLower = input.toLowerCase();

    // Crisis short-circuit
    const crisisWords = [
      "suicide",
      "kill myself",
      "end my life",
      "self harm",
      "hurt myself",
      "want to die",
      "better off dead",
    ];

    if (crisisWords.some((w) => inputLower.includes(w))) {
      return NextResponse.json({
        result:
          "Perspecu is not designed for crisis situations. Please contact a trusted person or professional service immediately.",
      });
    }

    // Illegal / violent rejection
    const rejectWords = [
      "murder",
      "rape",
      "child porn",
      "bomb",
      "terror",
      "genocide",
      "behead",
    ];

    if (rejectWords.some((w) => inputLower.includes(w))) {
      return NextResponse.json(
        {
          result:
            "Input violates content policy. Perspecu does not process illegal or violent content.",
        },
        { status: 403 }
      );
    }

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
- No future framing.
- No hypothetical phrasing.
- Maximum 180 words.
- End immediately after section 3.

Structure exactly:

1. What is happening:
Describe only observable elements stated in the input.

2. Where expansion occurs:
Describe how the statement extends, generalizes, escalates, or converts a specific event into a larger conclusion.

3. What remains concrete:
State only grounded present facts. No projection. No interpretation.

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

    return NextResponse.json({
      result: raw.trim() || "No compression generated.",
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({
      result: "Temporary processing error. Please retry.",
    });
  }
}
