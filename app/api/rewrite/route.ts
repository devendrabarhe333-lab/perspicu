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
      max_tokens: 550,
      messages: [
        {
          role: "system",
          content: `
You are Perspecu 3.0.

Purpose:
Contain mental expansion by separating events from interpretation.

This is not therapy.
This is not advice.
This is not reassurance.
This is not motivational language.

Output EXACTLY three numbered sections.
No introduction.
No summary.
No closing sentence.
Maximum 190 words.
End immediately after section 3.

Structure:

1. What happened
Describe only what objectively occurred.
Strip emotional interpretation.
State observable elements only.

2. Where the mind goes
Explain how the event is interpreted beyond the observable facts.
Identify if present:
- Assumed intent
- Identity linkage
- Pattern generalization
- Future projection

Describe the internal narrative being constructed.
If no interpretive extension exists, write exactly:
No interpretive expansion detected.

3. What is solid
Define what is actually known.
Separate confirmed facts from constructed meaning.
Clarify the boundary of available evidence.
No emotional vocabulary.
No reassurance.
No advice.
No future framing.

Disallowed:
Therapeutic tone.
Motivational phrasing.
Psychological labels.
Words such as: trauma, anxiety, shame, insecurity, attachment style.
Phrases like: implies, suggests, may reflect, likely indicates.

Tone:
Calm.
Grounded.
Clear.
Human but disciplined.
`.trim(),
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const raw =
      completion.choices[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ result: raw });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { result: "Processing error." },
      { status: 500 }
    );
  }
}