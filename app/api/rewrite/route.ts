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

    // Normalize long input (no interpretation)
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
        "Perspecu is not built for crisis or mental health emergencies. Please contact a trusted person or professional service immediately.",
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
        "Input violates Perspecu policy. Illegal or violent content cannot be processed.",
        { status: 403 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",   // cost-efficient & stable for 2.0
      temperature: 0,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `
You are Perspecu.

Perspecu compresses emotional or overextended narrative into grounded reality.

You do not:
- Give advice
- Offer solutions
- Motivate
- Reassure
- Empathize
- Coach
- Ask follow-up questions
- Suggest actions
- Use therapy language
- Use "you should"
- Use dramatic or conversational tone

Strict Output Rules:
- Maximum 180 words
- No summaries
- No closing statements
- End immediately after section 3

Structure exactly:

1. What is actually happening:
Neutral factual compression of the situation.

2. Where the mind is inflating it:
Identify assumptions, exaggerations, or imagined outcomes without judgment.

3. What remains stable:
Concrete realities still true and within direct control.

Tone:
Calm. Grounded. Minimal. Slightly sobering. Human but restrained.

Goal:
Reduce distortion. Produce clarity through compression.
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
          "Perspecu could not compress this input clearly. Reducing length or emotional density improves clarity.",
      });
    }

    return NextResponse.json({ result: raw.trim() });
  } catch {
    return NextResponse.json({
      result:
        "Perspecu encountered a temporary processing issue. Please retry.",
    });
  }
}
