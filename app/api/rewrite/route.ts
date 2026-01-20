import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = String(body?.text || "").trim();

    if (!input) {
      return NextResponse.json({ result: "" });
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
      "no point living",
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
      "kill",
      "murder",
      "rape",
      "porn",
      "child porn",
      "bomb",
      "terror",
      "genocide",
      "hate speech",
      "jihad",
      "behead",
    ];
    if (rejectWords.some((w) => inputLower.includes(w))) {
      return new NextResponse(
        "Input violates content policy. Perspicu does not process illegal, violent, or hateful content.",
        { status: 403 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content: `
You are Perspicu.

You output EXACTLY three sections and nothing else.

WHY:
Present structural pattern only.
Neutral, third-person, descriptive.
Noun phrases or observational clauses only.

IMPACT:
Systemic consequence if the pattern persists.
Effects on coordination, continuity, or structure.
No judgment or guidance.

PATH:
Describe the inherent structural orientation or tension already present.
Neutral observational phrasing is allowed.
State-describing verbs ARE allowed (e.g. "exists", "remains", "is oriented toward").
No advice, no steps, no future actions.

ABSOLUTE CONSTRAINTS:
- No second-person language
- No advice, suggestions, or guidance
- No empathy or reassurance
- No imperatives
- No questions
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
          "Perspicu couldn’t extract a clean structural pattern from this input. Try a shorter or more concrete description — the tool is designed for structural clarity, not emotional processing.",
      });
    }

    return NextResponse.json({
      result: raw.trim(),
    });
  } catch {
    return NextResponse.json({
      result:
        "Perspicu couldn’t process this input due to a temporary error. Please try again.",
    });
  }
}
