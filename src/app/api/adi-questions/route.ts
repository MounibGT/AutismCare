import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Load ADI questions from the JSON file
let adiQuestions: any[] = [];

async function loadAdiQuestions(): Promise<any[]> {
  if (adiQuestions.length > 0) return adiQuestions;
  
  try {
    // Try to load from the JSON file first
    const filePath = path.join(process.cwd(), "IA-chatboot", "adi_questions.json");
    const content = await fs.readFile(filePath, "utf-8");
    const questions = JSON.parse(content);
    adiQuestions = questions;
    return questions;
  } catch (error) {
    console.error("Error loading ADI questions from JSON, trying fallback:", error);
    
    // Fallback to parsing the text file
    try {
      const fallbackPath = path.join(process.cwd(), "autism_question_bot_data.txt");
      const content = await fs.readFile(fallbackPath, "utf-8");
      
      const qaPairs = content.split("\n\n");
      const questions = [];
      
      for (let i = 0; i < qaPairs.length; i += 2) {
        const qLine = qaPairs[i]?.replace("Q: ", "").trim();
        const aLine = qaPairs[i + 1]?.replace("A: ", "").trim();
        
        if (qLine && aLine) {
          questions.push({
            id: questions.length + 1,
            question_en: qLine,
            question_fr: qLine,
            question_ar: qLine,
            category: "general",
            answer_type: "text",
            possible_answers: [],
            score_map: {},
            description: aLine
          });
        }
      }
      
      adiQuestions = questions;
      return questions;
    } catch (fallbackError) {
      console.error("Error loading ADI questions:", fallbackError);
      return [];
    }
  }
}

// Get all questions or filter by category
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const lang = searchParams.get("lang") || "en";
  
  const questions = await loadAdiQuestions();
  
  // Filter by category if provided
  let filtered = questions;
  if (category) {
    filtered = questions.filter(q => q.category === category);
  }
  
  // Format questions based on language
  const formattedQuestions = filtered.map(q => ({
    id: q.id,
    question: q[`question_${lang}`] || q.question_en,
    category: q.category,
    answer_type: q.answer_type,
    possible_answers: q.possible_answers || [],
    section: q.section,
    description: q.description
  }));
  
  return NextResponse.json({
    success: true,
    questions: formattedQuestions,
    total: formattedQuestions.length
  });
}

// Submit an answer and get the score
export async function POST(request: NextRequest) {
  try {
    const { question_id, answer, lang = "en" } = await request.json();
    
    const questions = await loadAdiQuestions();
    const question = questions.find(q => q.id === question_id);
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }
    
    // Calculate score
    const score = question.score_map?.[answer.toString()] || 0;
    const scoreValues = Object.values(question.score_map || {}).map(v => Number(v));
    const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
    
    return NextResponse.json({
      success: true,
      question_id,
      answer,
      score,
      max_score: maxScore,
      question_text: question[`question_${lang}`] || question.question_en,
      lang
    });
  } catch (error) {
    console.error("Error processing ADI answer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process answer" },
      { status: 500 }
    );
  }
}

// Get ADI assessment summary and scoring info
export async function PUT(request: NextRequest) {
  try {
    const { responses } = await request.json();
    
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, error: "Invalid responses array" },
        { status: 400 }
      );
    }
    
    const questions = await loadAdiQuestions();
    let totalScore = 0;
    let maxPossibleScore = 0;
    const detailedResults = [];
    
    for (const response of responses) {
      const question = questions.find(q => q.id === response.questionId);
      if (question) {
        const score = question.score_map?.[response.answer.toString()] || 0;
        const scoreValues = Object.values(question.score_map || {}).map(v => Number(v));
        const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
        
        totalScore += score;
        maxPossibleScore += maxScore;
        
        detailedResults.push({
          questionId: question.id,
          questionText: question.question_en,
          answer: response.answer,
          score,
          maxScore,
          category: question.category
        });
      }
    }
    
    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    let riskLevel: "low" | "moderate" | "high" = "low";
    
    if (percentage >= 60) {
      riskLevel = "high";
    } else if (percentage >= 30) {
      riskLevel = "moderate";
    }
    
    return NextResponse.json({
      success: true,
      totalScore,
      maxPossibleScore,
      percentage: Math.round(percentage * 100) / 100,
      riskLevel,
      totalQuestions: responses.length,
      detailedResults,
      disclaimer: "This is a screening tool, not a diagnostic instrument. Please consult a qualified healthcare professional for proper assessment."
    });
  } catch (error) {
    console.error("Error calculating ADI score:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate score" },
      { status: 500 }
    );
  }
}