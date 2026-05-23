import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image, text } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Simulate model inference delay (2-4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Simulated ViT model analysis results
    const analyses = [
      `Based on the facial analysis using Vision Transformer (ViT-B/16), the model detected characteristics that may be associated with autism spectrum traits. The model indicates a confidence score of ${(70 + Math.random() * 25).toFixed(1)}%. The analysis focuses on facial expression patterns, eye contact indicators, and social communication cues.`,
      `ViT model analysis complete. Key observations from the image: variations in facial expression symmetry, attention patterns, and social engagement indicators. The model reports a confidence level of ${(72 + Math.random() * 23).toFixed(1)}% for autism-related characteristic detection.`,
      `The computer vision model processed the image and identified features commonly studied in autism research. Reported confidence: ${(68 + Math.random() * 27).toFixed(1)}%. Note: This is a simulated analysis for demonstration purposes only.`,
      `Image analyzed with Vision Transformer (84.7% accuracy on training set). The model found ${Math.floor(Math.random() * 3) + 2} markers that may be relevant to autism spectrum assessment. This is not a medical diagnosis.`
    ];

    const selectedAnalysis = analyses[Math.floor(Math.random() * analyses.length)];

    // Include text context if provided
    let finalResponse = selectedAnalysis;
    if (text && text.trim()) {
      finalResponse += `\n\nRegarding your question: "${text}" — ${generateTextResponse(text)}`;
    }

    finalResponse += `\n\n---\n*Note: This is a simulated demonstration using AI models (ViT + LLaMA-3). This is NOT a medical diagnostic tool. Always consult qualified healthcare professionals for autism assessment.*`;

    return NextResponse.json({
      success: true,
      analysis: finalResponse,
      model: "ViT-B/16 + LLaMA-3-8B (Simulated)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}

function generateTextResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  const autismKeywords = [
    'autism', 'autistic', 'asd', 'spectrum', 'signs', 'symptoms',
    'diagnosis', 'therapy', 'support', 'behavior', 'communication'
  ];

  if (autismKeywords.some(keyword => lowerQuery.includes(keyword))) {
    const responses = [
      "Autism Spectrum Disorder is a neurodevelopmental condition with varying levels of support needs.",
      "Early intervention and personalized therapy can significantly improve outcomes.",
      "Each autistic individual has unique strengths and challenges.",
      "Support strategies should be tailored to the individual's specific needs."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return "I specialize in autism-related information. Ask me about autism spectrum characteristics, diagnosis processes, therapeutic interventions, or support strategies.";
}
