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
      max_tokens: 1024, // ✅ increased for long inputs
      messages: [
        {
          role: "system",
          content: `
You are Perspicu.

You output EXACTLY three sections and nothing else.

WHY:
Describe the present structural pattern in the input.
Neutral, third-person, factual observation only.

IMPACT:
Describe systemic consequences if the pattern remains unchanged.
Structural outcomes only.

PATH:
Describe the directional tension or inherent pull already present.
Observational only.

If the input is lengthy or unstructured, summarize key patterns concisely
while preserving the three-section structure.

ABSOLUTE CONSTRAINTS:
- No second-person language
- No advice, suggestions, guidance, or actions
- No empathy, reassurance, or emotional language
- No verbs implying action or change
- No intro, no summary, no questions
- Output ONLY the three labeled sections above
          `.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // 🔍 Temporary debug logging
    console.log("Raw OpenAI output:", raw);

    if (!raw.trim()) {
      return NextResponse.json({
        result:
          "Perspicu couldn't structure this input. Try shortening it or removing emotional phrasing to expose clearer structural patterns.",
      });
    }

    return NextResponse.json({
      result: raw.trim(),
    });
  } catch {
    return NextResponse.json({
      result:
        "Perspicu couldn't process this input due to a temporary error. Please try again.",
    });
  }
}
