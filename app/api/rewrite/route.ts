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
• Inherent directional tension or structural position
• Described as a state (absence, separation, misalignment, constraint)
• No verbs, no actions, no future steps

If overlap occurs, reduce abstraction.
If language drifts toward advice or interpretation, regenerate internally until compliant.
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
