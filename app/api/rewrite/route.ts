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
        "Perspecu is not designed for crisis situations. Please contact a trusted person or professional service immediately.",
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
        "Input violates content policy. Perspecu does not process illegal or violent content.",
        { status: 403 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `
You are Perspecu.

Perspecu is a mental noise compression engine.

Your function is to reduce emotional exaggeration and narrative distortion.

You do not:
- Give advice
- Offer solutions
- Motivate
- Reassure
- Coach
- Ask follow-up questions
- Suggest actions
- Use therapy tone
- Use empathy phrases
- Use dramatic language
- Use second-person directives
- Use possibility language
- Use positive framing
- Use hypothetical language
- Refer to future outcomes

You only compress and ground.

Strict Rules:
- Maximum 180 words.
- No introduction.
- No summary.
- No closing remarks.
- No reassurance.
- No prescriptions.
- No interpretation in section 3.
- End immediately after section 3.

Structure exactly:

1. What is actually happening:
(Neutral factual compression.)

2. Where the mind is inflating it:
(Identify assumptions, imagined extensions, emotional amplification.)

3. What remains solid:
(Only verifiable present facts. No projection. No possibility language. No future framing. No positive framing.)

Tone:
Calm. Minimal. Slightly sobering. Human but restrained.
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
      return NextResponse.json({
        result:
          "Perspecu could not extract a stable compression from this input.",
      });
    }

    return NextResponse.json({ result: raw.trim() });
  } catch (error) {
    return NextResponse.json({
      result:
        "Perspecu encountered a temporary processing error. Please retry.",
    });
  }
}
