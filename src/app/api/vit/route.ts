import { NextRequest, NextResponse } from "next/server";

const LOCAL_VIT_URL  = "http://localhost:5001";
const GROQ_API_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const GROQ_SYSTEM_PROMPT =
  "You are a compassionate assistant helping families with autism-related observations. " +
  "When shown a face image, describe what you see objectively and educationally. " +
  "Mention facial features or expressions that are sometimes associated with autism " +
  "in a non-diagnostic, informative context. Always recommend consulting a qualified " +
  "healthcare professional for formal assessment. Be clear and concise.";

/** Returns the full data-URL with prefix intact (Groq and local server both need it). */
function normaliseImage(imageInput: string): string {
  return imageInput.startsWith("data:") ? imageInput : `data:image/png;base64,${imageInput}`;
}

async function predictLocal(imageInput: string): Promise<{
  success: boolean;
  prediction: string;
  confidence: number;
  probabilities: { autistic: number; non_autistic: number };
} | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const r = await fetch(`${LOCAL_VIT_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageInput }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function predictGroqVision(imageInput: string, userText?: string, lang?: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const imageUrl   = normaliseImage(imageInput);
  const langPrompt = lang === "fr" ? "Répondez en français." :
                     lang === "ar" ? "الرد باللغة العربية." : "Answer in English.";

  const r = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [
        {
          role:    "system",
          content: GROQ_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `${userText || "Please analyze this child's face."}\n\n${langPrompt}` },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.5,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Groq Vision ${r.status}: ${t}`);
  }
  const d = await r.json();
  return d.choices?.[0]?.message?.content ?? "Analysis complete, but no details were returned.";
}

export async function POST(request: NextRequest) {
  try {
    const { image, text, lang } = await request.json();
    if (!image) {
      return NextResponse.json(
        { error: "No image provided", success: false }, { status: 400 },
      );
    }

    const imageUrl = normaliseImage(image);

    // ── 1. Try local fine-tuned ViT server first ──────────────────────
    const localResult = await predictLocal(imageUrl);

    if (localResult?.success) {
      const [prediction, confidence, autisticProb] = [
        localResult.prediction,
        localResult.confidence,
        localResult.probabilities.autistic,
      ];
      return NextResponse.json({
        success:       true,
        prediction,
        confidence:   localResult.confidence,
        probabilities: localResult.probabilities,
        analysis: buildTextResponse(prediction, confidence, autisticProb, text),
        model: "local-vit-b16-finetuned",
        timestamp: new Date().toISOString(),
      });
    }

    // ── 2. Fallback: Groq Vision API ───────────────────────────────────
    try {
      const analysis = await predictGroqVision(image, text, lang);
      return NextResponse.json({
        success: true,
        prediction: analysis.includes("autistic") ? "Possible autistic traits (Groq Vision)" : "No clear autistic traits detected (Groq Vision)",
        confidence: 75,
        probabilities: { autistic: 50, non_autistic: 50 },
        analysis,
        model: `Groq-Vision-${GROQ_VISION_MODEL}`,
        timestamp: new Date().toISOString(),
      });
    } catch (groqErr) {
      console.error("Both backends failed:", groqErr);
      return NextResponse.json(
        {
          success: false,
          error: "Both the local ViT model and the Groq Vision API are unavailable.",
          analysis:
            "❌ Image analysis service is unavailable.\n\nPlease start the local ViT server:\n  cd IA-chatboot & python vit_server.py\n\nOr check that your internet / GROQ_API_KEY is configured.",
        },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Vision route error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request", analysis: "❌ Please provide a valid image." },
      { status: 400 },
    );
  }
}

/** Build a compassionate human-readable analysis string from the local ViT output. */
function buildTextResponse(prediction: string, confidence: number, autisticProb: number, userText?: string): string {
  const lang = typeof userText === "string" && /[\u0600-\u06FF]/.test(userText) ? "ar"  :
               typeof userText === "string" && /[\u00C0-\u017F]/.test(userText) ? "fr" : "en";

  if (lang === "fr") {
    return prediction === "Autistic"
      ? `D'après l'analyse du modèle, l'image présente des traits compatibles avec l'autisme (probabilité d'autisme : ${autisticProb.toFixed(1)} %, confiance globale : ${confidence.toFixed(1)} %).\n\n⚠️ Ceci n'est pas un diagnostic médical. Seul un professionnel de santé qualifié peut poser un diagnostic officiel. Si vous avez des préoccupations, veuillez consulter un pédiatre, un psychologue ou un psychiatre.`
      : `D'après l'analyse du modèle, l'image ne présente pas de traits clairement associés à l'autisme (probabilité d'autisme : ${autisticProb.toFixed(1)} %, confiance globale : ${confidence.toFixed(1)} %).\n\n⚠️ Ce résultat ne constitue pas un diagnostic. Pour toute préoccupation, consultez un professionnel de santé qualifié.`;
  }
  if (lang === "ar") {
    return prediction === "Autistic"
      ? `بناءً على تحليل النموذج، تظهر الصورة سمات متوافقة مع التوحد (احتمالية التوحد: ${autisticProb.toFixed(1)}%، مستوى الثقة: ${confidence.toFixed(1)}%).\n\n⚠️ هذا ليس تشخيصًا طبيًا. فقط أخصائي رعاية صحية مؤهل يمكنه تقديم تشخيص رسمي. إذا كانت لديك مخاوف، يرجى استشارة طبيب أطفال أو عالم نفس أو طبيب نفسي.`
      : `بناءً على تحليل النموذج، لا تظهر الصورة سمات واضحة مرتبطة بالتوحد (احتمالية التوحد: ${autisticProb.toFixed(1)}%، مستوى الثقة: ${confidence.toFixed(1)}%).\n\n⚠️ هذا النتيجة لا تمثل تشخيصًا. لأي مخاوف، يرجى استشارة أخصائي رعاية صحية مؤهل.`;
  }

  return prediction === "Autistic"
    ? `Based on the fine-tuned model analysis, the image shows traits **compatible with autism spectrum characteristics** (autism probability: **${autisticProb.toFixed(1)}%**, confidence: **${confidence.toFixed(1)}%**).\n\n⚠️ **This is NOT a medical diagnosis.** Only a qualified healthcare professional (pediatrician, psychologist, or psychiatrist) can provide an official diagnosis. If you have concerns, please consult a specialist.`
    : `Based on the fine-tuned model analysis, the image does **not** show clear traits associated with autism (autism probability: **${autisticProb.toFixed(1)}%**, confidence: **${confidence.toFixed(1)}%**).\n\n⚠️ **This is NOT a medical diagnosis.** If you have any concerns, please consult a qualified healthcare professional for a thorough assessment.`;
}

export async function GET(_req: NextRequest) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    const health = await (await fetch(`${LOCAL_VIT_URL}/health`, { signal: controller.signal })).json();
    clearTimeout(timer);
    return NextResponse.json({ local_server: "ok", ...health });
  } catch {
    return NextResponse.json({
      local_server: "unavailable",
      fallback:     "Groq Vision API",
      model:        "ViT-B/16 (fine-tuned on autism face dataset) — start with: cd IA-chatboot && python vit_server.py",
    });
  }
}
