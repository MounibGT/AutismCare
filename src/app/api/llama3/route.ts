import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "No question provided" },
        { status: 400 }
      );
    }

    // Proxy to Llama 3 API running on port 5000
    const fetchResponse = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question
      }),
    });

    const data = await fetchResponse.json();

    if (fetchResponse.ok) {
      return NextResponse.json({
        success: true,
        response: data.response,
        model: "Llama 3-8B",
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: data.error || "Failed to get response from Llama 3 API" },
        { status: fetchResponse.status }
      );
    }
  } catch (error) {
    console.error("Llama 3 API error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Llama 3 API" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint
    const fetchResponse = await fetch('http://localhost:5000/health', {
      method: 'GET',
    });

    const data = await fetchResponse.json();

    if (fetchResponse.ok) {
      return NextResponse.json({
        success: true,
        ...data,
      });
    } else {
      return NextResponse.json(
        { error: "Llama 3 API health check failed" },
        { status: fetchResponse.status }
      );
    }
  } catch (error) {
    console.error("Llama 3 API health check error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Llama 3 API for health check" },
      { status: 500 }
    );
  }
}