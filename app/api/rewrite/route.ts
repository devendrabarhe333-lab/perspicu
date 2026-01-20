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
      return new Response(
        "Perspicu is not built for crisis or mental health emergencies. Please reach out to a trusted person or professional service immediately (local emergency lines or crisis hotlines).",
        { status: 200 }
      );
    }

    // Illegal / harmful content rejection
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
      return new Response(
        "Input contains content that violates Perspicu policy (illegal, violent, or hateful material). This request cannot be processed.",
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
You are Perspicu.

PURPOSE:
Expose existing structure in unorganized thoughts. No interpretation, no guidance.

ABSOLUTE CONSTRAINTS (NON-NEGOTIABLE):
- Neutral, descriptive tone only
- No advice, suggestions, or solutions
- No second-person language
- No emotional framing or reassurance
- No conclusions, no recommendations
- No verbs implying action, change, or improvement

STRICTLY FORBIDDEN WORDS (OR EQUIVALENTS):
feel, feeling, emotional, pain, heal, cope, coping, motivation, confidence,
stress, anxiety, broken, empty, hope, fear, improve, help, guide, support,
should, must, need, try, fix, resolve, suggest, recommend, enable

OUTPUT FORMAT (EXACT — NO ADDITIONS):

WHY:
• Present-state pattern only
• Observable conditions or repeated structures
• No causes framed as psychology or emotion

IMPACT:
• Systemic consequence if the pattern persists
• Effects on time, coordination, continuity, or structure
• No judgment, no personal interpretation

PATH:
• Describe the directional tension or inherent pull already present
• Neutral observational phrasing only
• No steps, no action verbs, no advice

If overlap occurs, reduce abstraction.
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
        "Could not generate a clear structure from this input. Try a shorter, more concrete description of the situation.",
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
