import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = String(body?.text || "").trim();

    if (!input) {
      return NextResponse.json({ result: "" });
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
You are Perspicu.

PURPOSE:
Pure structural clarity. Pattern description only.

ABSOLUTE RULES (NON-NEGOTIABLE):
- No emotions or emotional states
- No therapy, coaching, or guidance
- No advice, suggestions, or improvement language
- No second-person language
- No verbs implying action or change

STRICTLY FORBIDDEN WORDS:
feel, feeling, emotional, pain, heal, cope, coping, motivation, confidence,
stress, anxiety, broken, empty, hope, fear, improve, help, guide, support,
require, requirement, necessary, necessity, explore, exploration,
establish, establishment, should, must, need

OUTPUT FORMAT (EXACT — DO NOT ADD ANYTHING):

WHY:
<observable conditions only>

IMPACT:
<external consequences only — time, structure, coordination>

PATH:
<structural state only — absence, separation, constraints, misalignment>

If any rule is violated, regenerate internally until fully compliant.
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
