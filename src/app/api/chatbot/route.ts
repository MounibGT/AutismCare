import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function chatWithGroq(question: string, lang: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const systemPrompt =
    lang === "fr"
      ? "Tu es un assistant spécialisé dans le soutien aux personnes autistes et leurs familles. Tu réponds en français, de manière bienveillante, claire et concise. Tu ne donnes pas de diagnostic médical mais tu peux partager des informations générales sur l'autisme, les thérapies, le dépistage et les stratégies de soutien."
      : lang === "ar"
        ? "أنت مساعد متخصص في دعم الأشخاص المصابين بالتوحد وعائلاتهم. ترد باللغة العربية بطريقة دافئة وواضحة وموجزة. لا تقدم تشخيصات طبية ولكن يمكنك مشاركة معلومات عامة حول التوحد والعلاجات والدعم."
        : "You are a compassionate assistant specialized in supporting autistic individuals and their families. Answer in English in a kind, clear, and concise way. Do not provide medical diagnoses, but share general information about autism, therapies, screening, and support strategies.";

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response right now.";
}

export async function POST(request: NextRequest) {
  try {
    const { question, lang = "en" } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "No question provided", success: false },
        { status: 400 },
      );
    }

    const groqResponse = await chatWithGroq(question, lang);

    return NextResponse.json({
      success: true,
      response: groqResponse,
      confidence: 0.9,
      model: "Groq-Llama-3.1-8B",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        response:
          "I'm currently unable to reach the AI service. Please check that your API key is configured correctly and try again.",
        confidence: 0,
        model: "Error",
      },
      { status: 500 },
    );
  }
}

/** Simple healthcheck: verifies the Groq key is present. */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  const isReady = !!apiKey;
  return NextResponse.json({
    success: isReady,
    status: isReady ? "ready" : "no_api_key",
    model: "Groq-Llama-3.1-8B",
  });
}
