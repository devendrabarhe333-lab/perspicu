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

    if (crisisWords.some(w => inputLower.includes(w))) {
      return new Response(
        "Perspicu is not built for crisis or mental health emergencies. Please reach out to a trusted person or professional service immediately.",
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
      "behead",
    ];

    if (rejectWords.some(w => inputLower.includes(w))) {
      return new Response(
        "Input violates content policy. Perspicu does not process illegal, violent, or hateful material.",
        { status: 403 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content: `
You are Perspicu: a single-pass cognitive structuring tool.

OUTPUT EXACTLY THREE SECTIONS ONLY.
No introduction. No summary. No extra text.

FORMAT (STRICT):

WHY:
Describe the present structural pattern in the input. Neutral, third-person, factual observation only.

IMPACT:
Describe systemic consequences if this structure persists. Structural or operational effects only.

PATH:
Describe the directional tension or inherent pull already present in the situation. Observational phrasing only.

GLOBAL CONSTRAINTS:
- No second-person language
- No advice, suggestions, or recommendations
- No emotional or motivational framing
- No coaching or therapy language
- No questions
- No actions, steps, or instructions
- Analytical tone only

If the input is vague, describe its vagueness structurally.
          `.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    if (!raw.trim()) {
      return new Response(
        "Could not generate a clear structure from this input. Try a shorter, more concrete description.",
        { status: 200 }
      );
    }

    return NextResponse.json({
      result: raw.trim(),
    });
  } catch {
    return NextResponse.json({
      result: "WHY: —\nIMPACT: —\nPATH: —",
    });
  }
}
