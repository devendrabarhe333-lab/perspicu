import { NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_INPUT_CHARS = 1200; // 🔑 critical fix

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let input = String(body?.text || "").trim();

    if (!input) {
      return NextResponse.json({ result: "" });
    }

    // 🔒 Normalize long emotional dumps (NO interpretation)
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
      return new NextResponse(
        "Perspicu is not designed for crisis situations. Please contact a trusted person or professional service immediately.",
        { status: 200 }
      );
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
      return new NextResponse(
        "Input violates content policy. Perspicu does not process illegal or violent content.",
        { status: 403 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: `
You are Perspicu.

You output EXACTLY three sections and nothing else.

WHY:
Present-state structural pattern only.
Neutral, third-person, factual description.

IMPACT:
Systemic consequence if the pattern persists.
External effects only.

PATH:
Inherent structural tension or directional pull.
Described as a state (misalignment, separation, constraint).

ABSOLUTE CONSTRAINTS:
- No second-person language
- No advice, guidance, or actions
- No emotional framing
- No verbs implying change
- No intro, no summary, no questions
- Output ONLY the three labeled sections
          `.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    console.log("Raw OpenAI output:", raw);

    if (!raw.trim()) {
      return NextResponse.json({
        result:
          "Perspicu could not extract a stable structure from this input. Reducing length or emotional density reveals clearer patterns.",
      });
    }

    return NextResponse.json({ result: raw.trim() });
  } catch {
    return NextResponse.json({
      result:
        "Perspicu encountered a temporary processing error. Please retry.",
    });
  }
}
