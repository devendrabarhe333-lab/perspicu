import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = String(body?.text || "").trim();

    if (!input) {
      return NextResponse.json({ result: "" });
    }

    // --- Guardrails: crisis ---
    const crisisKeywords = [
      "suicide",
      "kill myself",
      "end my life",
      "self harm",
      "hurt myself",
      "want to die",
      "no point living",
    ];

    if (crisisKeywords.some(kw => input.toLowerCase().includes(kw))) {
      return new Response(
        "Perspicu is not designed for crisis situations. This appears serious — please contact a trusted person or professional service immediately (e.g., local emergency lines, suicide/crisis hotlines).",
        { status: 200 }
      );
    }

    // --- Guardrails: illegal / violent ---
    const rejectKeywords = [
      "kill",
      "murder",
      "bomb",
      "terror",
      "hate speech",
      "genocide",
      "rape",
      "child porn",
    ];

    if (rejectKeywords.some(kw => input.toLowerCase().includes(kw))) {
      return new Response(
        "Input violates content policy. Perspicu does not process this.",
        { status: 403 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 260,
      messages: [
        {
          role: "system",
          content: `
You are Perspicu: a single-pass, zero-influence cognitive structuring tool.

Users provide raw, unstructured thoughts. The output must expose structure only.

OUTPUT RULES — ABSOLUTE:
- EXACTLY three sections only
- No intro, no summary, no empathy, no questions
- No advice, guidance, coaching, or therapy language
- No second-person language
- No verbs implying action, change, or intervention
- Analytical, structural, neutral framing only

FORMAT — NO DEVIATIONS:

WHY:
Describe the present pattern or underlying structure in the input.
Third-person, neutral, factual observation only.

IMPACT:
Describe systemic consequences if the structure remains unchanged.
Logical, structural outcomes only (coordination, alignment, continuity, risk).

PATH:
Describe the inherent directional tension or structural pull already present.
Pure observation of positioning or constraint. No steps, no actions.

CRISIS OVERRIDE:
If the input involves self-harm, suicide, or acute danger, do NOT analyze.
Return only the predefined crisis message.

POLICY OVERRIDE:
If the input is illegal, hateful, or violent, return rejection text only.

If extra text appears, regenerate internally until EXACT compliance.
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
      result: raw.trim(),
    });
  } catch {
    return NextResponse.json({
      result: "WHY: —\nIMPACT: —\nPATH: —",
    });
  }
}
