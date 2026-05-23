"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Send,
  ImagePlus,
  Trash2,
  Bot,
  User,
  Settings,
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  FileText,
  Camera,
} from "lucide-react";

// Types
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
  confidence?: number;
  sources?: string[];
};

interface ADIQuestion {
  id: number;
  question: string;
  category: string;
  answer_type: "single_choice" | "yes_no" | "text";
  possible_answers: string[];
  section: string;
  description: string;
}

interface ADIResponse {
  questionId: number;
  answer: string;
  score: number;
}

interface TypingState {
  isStreaming: boolean;
  isAnalyzingImage: boolean;
}

type ChatMode = "general" | "adi_assessment";

// Translations
const translations = {
  en: {
    welcome: "Welcome to Smart Assistant",
    welcomeDesc: "I'm here to help with any question, autism-related topics, image analysis, and ADI screening.",
    startADI: "Start ADI Assessment",
    startChat: "Start General Chat",
    adiIntro: "ADI Developmental Screening",
    adiDesc: "This questionnaire helps screen for developmental patterns associated with autism. It's not a diagnostic tool.",
    adiDisclaimer: "Important: This is a screening tool, not a diagnostic instrument. Please consult a qualified healthcare professional for proper assessment.",
    beginAssessment: "Begin Assessment",
    questionProgress: "Question",
    of: "of",
    next: "Next",
    previous: "Previous",
    submit: "Submit Assessment",
    skip: "Skip",
    assessmentComplete: "Assessment Complete",
    viewResults: "View Results",
    retakeAssessment: "Retake Assessment",
    backToChat: "Back to Chat",
    riskLevel: "Risk Level",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    score: "Score",
    totalQuestions: "Total Questions Answered",
    uploadImage: "Upload image for analysis",
    imageReady: "Image ready for analysis",
    placeholder: "Ask me anything or describe the image...",
    send: "Send",
    clearChat: "Clear chat",
    settings: "Settings",
    streaming: "Streaming Responses",
    connected: "Connected",
    offline: "Offline Mode",
    analyzing: "Analyzing image with ViT model...",
    thinking: "Thinking...",
    suggestions: [
      "What are early signs of autism?",
      "How is autism diagnosed?",
      "What is the capital of France?",
      "Explain machine learning",
    ],
  },
  fr: {
    welcome: "Bienvenue sur l'Assistant Intelligent",
    welcomeDesc: "Je suis là pour vous aider avec n'importe quelle question, l'autisme, l'analyse d'images et le dépistage ADI.",
    startADI: "Commencer l'évaluation ADI",
    startChat: "Commencer la conversation générale",
    adiIntro: "Dépistage développemental ADI",
    adiDesc: "Ce questionnaire aide à dépister les schémas développementaux associés à l'autisme. Ce n'est pas un outil de diagnostic.",
    adiDisclaimer: "Important: Ceci est un outil de dépistage, pas un instrument de diagnostic. Veuillez consulter un professionnel de santé qualifié pour une évaluation appropriée.",
    beginAssessment: "Commencer l'évaluation",
    questionProgress: "Question",
    of: "sur",
    next: "Suivant",
    previous: "Précédent",
    submit: "Soumettre l'évaluation",
    skip: "Passer",
    assessmentComplete: "Évaluation terminée",
    viewResults: "Voir les résultats",
    retakeAssessment: "Refaire l'évaluation",
    backToChat: "Retour à la conversation",
    riskLevel: "Niveau de risque",
    low: "Faible",
    moderate: "Modéré",
    high: "Élevé",
    score: "Score",
    totalQuestions: "Total des questions répondues",
    uploadImage: "Télécharger une image pour analyse",
    imageReady: "Image prête pour analyse",
    placeholder: "Posez-moi n'importe quelle question ou décrivez l'image...",
    send: "Envoyer",
    clearChat: "Effacer la conversation",
    settings: "Paramètres",
    streaming: "Réponses en continu",
    connected: "Connecté",
    offline: "Mode hors ligne",
    analyzing: "Analyse de l'image avec le modèle ViT...",
    thinking: "Réflexion...",
    suggestions: [
      "Quels sont les signes précoces de l'autisme?",
      "Quelle est la capitale de la France?",
      "Explique l'intelligence artificielle",
      "Quelles thérapies aident l'autisme?",
    ],
  },
  ar: {
    welcome: "مرحباً بكم في المساعد الذكي",
    welcomeDesc: "أنا هنا للمساعدة في أي سؤال، التوحد، تحليل الصور، وفحص ADI.",
    startADI: "بدء تقييم ADI",
    startChat: "بدء المحادثة العامة",
    adiIntro: "فحص النمو ADI",
    adiDesc: "هذا الاستبيان يساعد في فحص أنماط النمو المرتبطة بالتوحد. إنه ليس أداة تشخيص.",
    adiDisclaimer: "مهم: هذه أداة فحص، وليست أداة تشخيص. يرجى استشارة متخصص رعاية صحية مؤهل للتقييم المناسب.",
    beginAssessment: "بدء التقييم",
    questionProgress: "سؤال",
    of: "من",
    next: "التالي",
    previous: "السابق",
    submit: "إرسال التقييم",
    skip: "تخطي",
    assessmentComplete: "اكتمل التقييم",
    viewResults: "عرض النتائج",
    retakeAssessment: "إعادة التقييم",
    backToChat: "العودة إلى المحادثة",
    riskLevel: "مستوى الخطورة",
    low: "منخفض",
    moderate: "متوسط",
    high: "عالي",
    score: "النتيجة",
    totalQuestions: "إجمالي الأسئلة المجاب عنها",
    uploadImage: "رفع صورة للتحليل",
    imageReady: "الصورة جاهزة للتحليل",
    placeholder: "اسألني أي شيء أو صف الصورة...",
    send: "إرسال",
    clearChat: "مسح المحادثة",
    settings: "الإعدادات",
    streaming: "ردود متدفقة",
    connected: "متصل",
    offline: "وضع غير متصل",
    analyzing: "تحليل الصورة بنموذج ViT...",
    thinking: "جاري التفكير...",
    suggestions: [
      "ما هي العلامات المبكرة للتوحد؟",
      "ما عاصمة فرنسا؟",
      "اشرح التعلم الآلي",
      "ما هي العلاجات المفيدة للتوحد؟",
    ],
  },
};

export default function ADIChatbot() {
  const locale = useLocale();
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [showSettings, setShowSettings] = useState(false);
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [vitMetrics, setVitMetrics] = useState<null | {
    vit_ensemble?: {
      accuracy?: number; f1_score?: number; precision?: number; recall?: number;
      auc_roc?: number; training_images?: number; train_split?: string; val_split?: string;
      models?: string[]; techniques?: string[];
    };
    individual_models?: Record<string, { accuracy?: number; f1_score?: number; precision?: number; recall?: number }>;
    text_model?: {
      method?: string; provider?: string; model_id?: string;
      context_window?: number; max_tokens?: number; temperature?: number;
      accuracy?: number; precision?: number; recall?: number; f1_score?: number;
      benchmark_note?: string; note?: string;
    };
    training_info?: {
      dataset?: string; preprocessing?: string; augmentation?: string;
      optimizer?: string; learning_rate?: number; batch_size?: number;
      epochs?: number; early_stopping?: boolean;
    };
  }>(null);

  // ADI Assessment State
  const [adiQuestions, setAdiQuestions] = useState<ADIQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [adiResponses, setAdiResponses] = useState<ADIResponse[]>([]);
  const [showADIIntro, setShowADIIntro] = useState(false);
  const [adiResults, setAdiResults] = useState<{
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    riskLevel: "low" | "moderate" | "high";
    totalQuestions: number;
  } | null>(null);
  const [isSubmittingADI, setIsSubmittingADI] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingStateRef = useRef<TypingState>({ isStreaming: false, isAnalyzingImage: false });

  // Check backend connection on mount
  useEffect(() => {
    checkBackend();
    loadMetrics();
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch("/api/chatbot");
      const data = await res.json();
      setBackendConnected(!!data.success);
    } catch {
      setBackendConnected(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await fetch("/api/model-metrics");
      const data = await res.json();
      if (data.ok) setVitMetrics(data.metrics);
    } catch {
      // Metrics are optional — ignore failures
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load ADI questions
  const loadADIQuestions = async () => {
    try {
      const response = await fetch(`/api/adi-questions?lang=${locale}`);
      const data = await response.json();
      if (data.success) {
        setAdiQuestions(data.questions);
        return true;
      }
    } catch (error) {
      console.error("Error loading ADI questions:", error);
    }
    return false;
  };

  // Start ADI assessment
  const startADIAssessment = async () => {
    const loaded = await loadADIQuestions();
    if (loaded) {
      setChatMode("adi_assessment");
      setShowADIIntro(true);
      setAdiResponses([]);
      setCurrentQuestionIndex(0);
      setAdiResults(null);
    }
  };

  // Begin ADI questions after intro
  const beginADIAssessment = () => {
    setShowADIIntro(false);
    setCurrentQuestionIndex(0);
  };

  // Handle ADI answer
  const handleADIAnswer = (answer: string) => {
    const currentQuestion = adiQuestions[currentQuestionIndex];
    const newResponse: ADIResponse = {
      questionId: currentQuestion.id,
      answer,
      score: 0, // Score will be calculated on submission
    };

    // Update or add response
    setAdiResponses((prev) => {
      const existing = prev.filter((r) => r.questionId !== currentQuestion.id);
      return [...existing, newResponse];
    });
  };

  // Navigate ADI questions
  const nextADIQuestion = () => {
    if (currentQuestionIndex < adiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevADIQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit ADI assessment
  const submitADIAssessment = async () => {
    if (adiResponses.length === 0) return;

    setIsSubmittingADI(true);

    try {
      const response = await fetch("/api/adi-questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: adiResponses.map((r) => ({
            questionId: r.questionId,
            answer: r.answer,
          })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAdiResults({
          totalScore: data.totalScore,
          maxPossibleScore: data.maxPossibleScore,
          percentage: data.percentage,
          riskLevel: data.riskLevel,
          totalQuestions: data.totalQuestions,
        });
      }
    } catch (error) {
      console.error("Error submitting ADI assessment:", error);
    } finally {
      setIsSubmittingADI(false);
    }
  };

  // Switch back to general chat
  const switchToGeneralChat = () => {
    setChatMode("general");
    setShowADIIntro(false);
    setAdiResults(null);
  };


// Helper function to make responses concise
const makeConcise = (text: string): string => {
   if (!text) return "";
   let result = text;

   if (result.length <= 150) return result.trim();

   result = result.replace(/Current Status:[\s\S]*?(?=\n\n|\n[A-Z]|\n$)/g, '');
   result = result.replace(/To enable full responses:[^]*?(?=\n\n)/g, '');
   result = result.replace(/See TRAINING_GUIDE\.md[^]*?(?=\n)/g, '');
   result = result.replace(/For reference, here is your question:[^]*?(?=\n)/g, '');
   result = result.replace(/⚠️ \*\*Note:\*\*[\s\S]*?(?=\n)/g, '');

   const lines = result.trim().split('\n');
   const meaningfulLines = lines.filter(l => l.trim() && !l.includes('Current Status') && !l.includes('start backend'));
   if (meaningfulLines.length > 0) {
     result = meaningfulLines[0];
     if (meaningfulLines[1] && meaningfulLines[1].length < 100) result += ' ' + meaningfulLines[1];
   }

   return result.trim().slice(0, 200);
 };

  const createMessage = (role: "user" | "assistant", content: string, extras?: Partial<Message>) => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
    ...extras,
  });

  const handleSend = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage = input.trim();
    const imageData = uploadedImage;

    // Optimistically add user message
    const userMsg = createMessage("user", userMessage || "📸 Image uploaded", {
      image: imageData || undefined,
    });
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Add placeholder for streaming response
    const assistantMsg = createMessage("assistant", "");
    setMessages((prev) => [...prev, assistantMsg]);

    try {
        if (imageData) {
          // Image analysis
          typingStateRef.current.isAnalyzingImage = true;

          const response = await fetch("/api/vit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData, text: userMessage, lang: locale }),
          });
          const data = await response.json();

          if (data.success) {
            const resultText = data.analysis || "Analysis complete.";
            // Make image analysis response concise
            const conciseResult = makeConcise(resultText);
            const confidence = typeof data.confidence === "number" ? data.confidence : 0.85;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsg.id ? { ...msg, content: conciseResult, confidence } : msg
              )
            );
          } else if (data.analysis) {
            const resultText = data.analysis;
            // Make image analysis response concise
            const conciseResult = makeConcise(resultText);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsg.id ? { ...msg, content: conciseResult } : msg
              )
            );
          } else {
            const resultText = `❌ Image analysis failed: ${data.error || "Unknown error"}`;
            // Make error message concise
            const conciseError = makeConcise(resultText);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsg.id ? { ...msg, content: conciseError } : msg
              )
            );
          }
        } else if (userMessage) {
         // Text chat
         typingStateRef.current.isStreaming = true;

         const response = await fetch("/api/chatbot", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ question: userMessage, lang: locale, session_id: sessionId }),
         });
         const data = await response.json();

         let responseContent = data.response || "Error processing request";
         
         // Make response more concise like Kilo
         responseContent = makeConcise(responseContent);
         
         // If backend is not running, just use the response (make it concise)
         if (data.instructions) {
           responseContent = data.response;
           // Also make the fallback message concise
           responseContent = makeConcise(responseContent);
         }

         setMessages((prev) =>
           prev.map((msg) =>
             msg.id === assistantMsg.id
               ? { ...msg, content: responseContent, confidence: data.confidence }
               : msg
           )
         );
       }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsg.id
            ? { ...msg, content: "❌ An error occurred. Please check your connection and try again." }
            : msg
        )
      );
    } finally {
      typingStateRef.current.isStreaming = false;
      typingStateRef.current.isAnalyzingImage = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAdiResponses([]);
    setAdiResults(null);
    setShowADIIntro(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Render ADI Intro Screen
  const renderADIIntro = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
       <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
        <ClipboardList className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{t.adiIntro}</h2>
      <p className="text-gray-600 max-w-md mb-4">{t.adiDesc}</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md">
        <div className="flex items-start gap-2">
           <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 text-left">{t.adiDisclaimer}</p>
        </div>
      </div>
      <button
        onClick={beginADIAssessment}
         className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg"
      >
        {t.beginAssessment}
      </button>
    </div>
  );

  // Render ADI Results Screen
  const renderADIResults = () => {
    if (!adiResults) return null;

    const riskColors = {
      low: "bg-green-100 text-green-700 border-green-300",
      moderate: "bg-yellow-100 text-yellow-700 border-yellow-300",
      high: "bg-red-100 text-red-700 border-red-300",
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
         <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t.assessmentComplete}</h2>

        <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg mb-6 ${riskColors[adiResults.riskLevel]}`}>
          {t.riskLevel}: {t[adiResults.riskLevel]}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-sm w-full">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">{t.score}</div>
            <div className="text-3xl font-bold text-gray-800">
              {adiResults.totalScore} / {adiResults.maxPossibleScore}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full ${adiResults.riskLevel === "high" ? "bg-red-500" : adiResults.riskLevel === "moderate" ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${adiResults.percentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">{adiResults.percentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-500 mt-2">
            {t.totalQuestions}: {adiResults.totalQuestions}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-sm">
          <p className="text-sm text-yellow-800">{t.adiDisclaimer}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startADIAssessment}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
          >
            {t.retakeAssessment}
          </button>
          <button
            onClick={switchToGeneralChat}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
          >
            {t.backToChat}
          </button>
        </div>
      </div>
    );
  };

  // Render ADI Question
  const renderADIQuestion = () => {
    if (currentQuestionIndex >= adiQuestions.length || currentQuestionIndex < 0) return null;

    const question = adiQuestions[currentQuestionIndex];
    const currentResponse = adiResponses.find((r) => r.questionId === question.id);
    const currentAnswer = currentResponse?.answer || "";

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Progress Bar */}
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              {t.questionProgress} {currentQuestionIndex + 1} {t.of} {adiQuestions.length}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {question.category}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / adiQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{question.question}</h3>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.answer_type === "single_choice" &&
              question.possible_answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleADIAnswer(answer)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    currentAnswer === answer
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {answer}
                </button>
              ))}

            {question.answer_type === "yes_no" &&
              question.possible_answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleADIAnswer(answer)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    currentAnswer === answer
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {answer}
                </button>
              ))}

            {question.answer_type === "text" && (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleADIAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 bg-white border-t flex items-center justify-between">
          <button
            onClick={prevADIQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            {t.previous}
          </button>

          <div className="flex gap-2">
            {currentQuestionIndex < adiQuestions.length - 1 ? (
              <button
                onClick={nextADIQuestion}
                disabled={!currentAnswer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {t.next}
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={submitADIAssessment}
                disabled={isSubmittingADI || adiResponses.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingADI ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {t.submit}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If not open, show floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
         className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 z-50 group"
        aria-label="Open Autism Assistant"
      >
        <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
        {backendConnected && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
    );
  }

  return (
    <div
       className="fixed bottom-6 right-6 w-[95vw] md:w-125 h-[80vh] md:h-175 bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
       <div className="bg-linear-to-br from-blue-600 via-blue-700 to-purple-600 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {chatMode === "adi_assessment" ? (
                <ClipboardList className="w-6 h-6" />
              ) : (
                <Bot className="w-6 h-6" />
              )}
            </div>
            {backendConnected && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600"></div>
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              {chatMode === "adi_assessment" ? "ADI Assessment" : "Autism Support Assistant"}
            </h1>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              {backendConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  {t.connected} • Groq AI
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  {t.offline} • Local Knowledge
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chatMode === "adi_assessment" && !adiResults && (
            <button
              onClick={switchToGeneralChat}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title={t.backToChat}
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title={t.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title={t.clearChat}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {/* Streaming toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t.streaming}</span>
            <button
              onClick={() => setStreamEnabled(!streamEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${streamEnabled ? "bg-blue-600" : "bg-gray-300"}`}
              aria-label={t.streaming}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${streamEnabled ? "translate-x-7" : "translate-x-1"}`}
                style={{ marginTop: "2px" }}
              />
            </button>
          </div>

          {/* Connection status */}
          <div className="text-xs text-gray-500">
            {backendConnected
              ? "Using Groq (Llama-3.1-8B for text, Llama-3.2-11B-Vision for images)"
              : "Groq API unreachable — no response available"}
          </div>

          {/* ViT Model Metrics — always visible when metrics loaded */}
          {vitMetrics && (
            <div className="text-xs space-y-1.5 pt-2 border-t border-gray-200">
              <p className="font-medium text-gray-700">📊 ViT Model Metrics</p>

              {(() => {
                const e = vitMetrics.vit_ensemble;
                if (!e) return <p className="text-gray-400 italic">No ensemble metrics available.</p>;
                return (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Architecture</span><span className="font-medium text-gray-800">{(e.models ?? []).join(" + ")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Training Images</span><span className="font-medium text-gray-800">{String(e.training_images ?? "—")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Split</span><span className="font-medium text-gray-800">Train {(e.train_split ?? "—")} · Val {(e.val_split ?? "—")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Accuracy</span><span className="font-medium text-green-600">{((e.accuracy ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Precision</span><span className="font-medium text-blue-600">{((e.precision ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Recall</span><span className="font-medium text-purple-600">{((e.recall ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">F1 Score</span><span className="font-medium text-orange-600">{((e.f1_score ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">AUC-ROC</span><span className="font-medium text-red-600">{((e.auc_roc ?? 0) * 100).toFixed(1)}%</span></div>
                    {(e.techniques?.length ?? 0) > 0 && (
                      <div className="pt-1 mt-1 border-t border-gray-200">
                        <span className="text-gray-500">Techniques: </span>
                        <span className="font-medium text-gray-800">{(e.techniques as string[]).join(", ")}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Text Model — Groq Llama 3.1 with live metrics */}
          {vitMetrics?.text_model && (
            <div className="text-xs space-y-1.5 pt-2 border-t border-gray-200">
              <p className="font-medium text-gray-700">📝 Text Model — Live Metrics</p>
              {(() => {
                const tm = vitMetrics.text_model;
                return (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="font-medium text-green-600">{tm.provider ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Model</span><span className="font-medium text-gray-800">{tm.model_id ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Context Window</span><span className="font-medium text-gray-800">{typeof tm.context_window === "number" ? (tm.context_window / 1024).toFixed(0) + "K" : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Max Tokens</span><span className="font-medium text-gray-800">{typeof tm.max_tokens === "number" ? String(tm.max_tokens) : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Temperature</span><span className="font-medium text-gray-800">{typeof tm.temperature === "number" ? String(tm.temperature) : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium text-gray-800">{tm.method ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Accuracy</span><span className="font-medium text-green-600">{((tm.accuracy ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Precision</span><span className="font-medium text-blue-600">{((tm.precision ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Recall</span><span className="font-medium text-purple-600">{((tm.recall ?? 0) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">F1 Score</span><span className="font-medium text-orange-600">{((tm.f1_score ?? 0) * 100).toFixed(1)}%</span></div>
                    {tm.benchmark_note && <p className="italic text-gray-400 mt-1">⚑ {tm.benchmark_note}</p>}
                  </>
                );
              })()}
            </div>
          )}

          {/* Dataset / training info */}
          {vitMetrics?.training_info && (
            <div className="text-xs space-y-1.5 pt-2 border-t border-gray-200">
              <p className="font-medium text-gray-700">🗄️ Dataset & Training</p>
              {(() => {
                const ti = vitMetrics.training_info;
                return (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Dataset</span><span className="font-medium text-gray-800">{ti.dataset ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Preprocessing</span><span className="font-medium text-gray-800">{ti.preprocessing ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Augmentation</span><span className="font-medium text-gray-800">{ti.augmentation ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Optimizer</span><span className="font-medium text-gray-800">{String(ti.optimizer ?? "—")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Learning Rate</span><span className="font-medium text-gray-800">{String(ti.learning_rate ?? "—")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Batch Size</span><span className="font-medium text-gray-800">{String(ti.batch_size ?? "—")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Epochs</span><span className="font-medium text-gray-800">{String(ti.epochs ?? "—")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Early Stopping</span><span className="font-medium text-gray-800">{ti.early_stopping ? "✓ Yes" : "✗ No"}</span></div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      {chatMode === "general" ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t.welcome}</h2>
                <p className="text-gray-600 max-w-xs mx-auto mb-6">{t.welcomeDesc}</p>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
                  <button
                    onClick={startADIAssessment}
                     className="p-3 bg-linear-to-br from-purple-100 to-blue-100 border border-purple-200 rounded-xl hover:from-purple-200 hover:to-blue-200 transition-all text-center"
                  >
                    <ClipboardList className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">{t.startADI}</span>
                  </button>
                  <button
                    onClick={() => {
                      setChatMode("general");
                      setInput(t.suggestions[0]);
                    }}
                     className="p-3 bg-linear-to-br from-blue-100 to-cyan-100 border border-blue-200 rounded-xl hover:from-blue-200 hover:to-cyan-200 transition-all text-center"
                  >
                    <FileText className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">{t.startChat}</span>
                  </button>
                </div>

                {/* Suggestions */}
                <div className="space-y-2 max-w-xs mx-auto">
                  {t.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div
                     className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ 
                      msg.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-purple-500 to-blue-500"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.image && <img src={msg.image} alt="Uploaded" className="max-h-48 rounded-xl mb-2" />}

                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content || (
                        <span className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          {t.thinking}...
                        </span>
                      )}
                    </div>

                    {msg.confidence && (
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Confidence: {(msg.confidence * 100).toFixed(0)}%
                      </div>
                    )}

                    <div className="mt-2 text-xs opacity-50">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="px-4 py-2 bg-gray-50 border-t flex items-center gap-3">
              <img src={uploadedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
              <div className="flex-1 text-sm text-gray-600">{t.imageReady}</div>
              <button
                onClick={() => setUploadedImage(null)}
                className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => setUploadedImage(e.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors border border-gray-300 flex items-center justify-center"
                title={t.uploadImage}
              >
                <ImagePlus className="w-5 h-5 text-gray-600" />
              </label>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() && !uploadedImage}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t.send}</span>
              </button>
            </div>

            {/* Disclaimer */}
            {messages.length === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 text-xs text-yellow-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Important:</strong> This assistant provides educational support only. It is not a substitute
                  for professional medical diagnosis or advice. For concerns about autism, please consult a qualified
                  healthcare provider.
                </p>
              </div>
            )}
          </div>
        </>
      ) : showADIIntro ? (
        renderADIIntro()
      ) : adiResults ? (
        renderADIResults()
      ) : (
        renderADIQuestion()
      )}
    </div>
  );
}