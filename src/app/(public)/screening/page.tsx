"use client";

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

type Question = {
  id: number;
  question_en: string;
  question_fr: string;
  question_ar: string;
  category: string;
  answer_type: 'multiple_choice' | 'numeric' | 'text';
  possible_answers?: string[];
  score_map?: Record<string, number>;
  description?: string;
};

type Answer = {
  question_id: number;
  value: string | number;
  score?: number;
};

export default function AutismScreeningQuestionnaire() {
  const locale = useLocale();
  const t = useTranslations('Questionnaire');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Extract questions from ADI dataset
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/adi-questions');
      const data = await response.json();
      // Filter for screening-relevant questions (simplified for demo)
      setQuestions(data.slice(0, 20)); // First 20 key questions
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const getQuestionText = (q: Question) => {
    switch (locale) {
      case 'fr':
        return q.question_fr;
      case 'ar':
        return q.question_ar;
      default:
        return q.question_en;
    }
  };

  const handleAnswer = (value: string | number) => {
    const question = questions[currentQuestion];
    const score = question.score_map?.[value.toString()] || 0;
    
    setAnswers(prev => ({
      ...prev,
      [question.id]: {
        question_id: question.id,
        value,
        score
      }
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScreeningResult = () => {
    const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
    const maxPossible = questions.reduce((sum, q) => {
      const maxScore = Math.max(...Object.values(q.score_map || {0: 0}));
      return sum + maxScore;
    }, 0);
    
    const percentage = (totalScore / maxPossible) * 100;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (percentage > 60) riskLevel = 'high';
    else if (percentage > 30) riskLevel = 'medium';
    
    return {
      totalScore,
      maxPossible,
      percentage,
      riskLevel,
      questionsAnswered: Object.keys(answers).length,
      totalQuestions: questions.length
    };
  };

  const generateReport = () => {
    const result = calculateScreeningResult();
    return {
      timestamp: new Date().toISOString(),
      language: locale,
      screeningResult: result,
      detailedAnswers: answers,
      recommendations: getRecommendations(result.riskLevel)
    };
  };

  const getRecommendations = (riskLevel: 'low' | 'medium' | 'high') => {
    const recommendations = {
      low: {
        en: "Your responses suggest a lower likelihood of autism traits. Continue monitoring development and consult a professional if concerns persist.",
        fr: " Vos réponses suggèrent une faible probabilité de traits autistiques. Continuez à surveiller le développement et consultez un professionnel si les inquiétudes persistent.",
        ar: "تشير إجاباتك إلى احتمال منخفض لسلوكيات التوحد. واصل مراقبة التطور واستشر متخصصاً إذا استمرت المخاوف."
      },
      medium: {
        en: "Some responses indicate potential autism-related traits. We recommend a professional developmental evaluation to better understand your child's needs.",
        fr: "Certaines réponses indiquent des traits potentiellement liés à l'autisme. Nous recommandons une évaluation développementale professionnelle.",
        ar: "تشير بعض الإجابات إلى احتمالية وجود سلوكيات مرتبطة بالتوحد. نوصي بإجراء تقييم تنموي متخصص."
      },
      high: {
        en: "Your responses suggest a higher likelihood of autism-related traits. Please consult a developmental pediatrician or child psychologist for a comprehensive assessment.",
        fr: "Vos réponses suggèrent une forte probabilité de traits autistiques. Veuillez consulter un pédiatre du développement ou un psychologue enfant.",
        ar: "تشير إجاباتك إلى احتمال مرتفع لسلوكيات مرتبطة بالتوحد. يرجى استشارة طبيب أطفال متخصص أو نفسي أطفال للتقييم الشامل."
      }
    };
    return recommendations[riskLevel][locale as 'en' | 'fr' | 'ar'];
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const result = calculateScreeningResult();
    const report = generateReport();
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">{t('results')}</h1>
            </div>
            
            {/* Risk Level Display */}
            <div className={`p-6 rounded-xl mb-6 ${
              result.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
              result.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.riskLevel === 'high' ? (
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
                <div>
                  <h2 className={`text-xl font-bold ${
                    result.riskLevel === 'high' ? 'text-red-700' :
                    result.riskLevel === 'medium' ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {result.riskLevel === 'high' ? t('highRisk') :
                     result.riskLevel === 'medium' ? t('mediumRisk') : t('lowRisk')}
                  </h2>
                  <p className="text-gray-600">{t('riskLevel')}: {(result.percentage).toFixed(1)}%</p>
                </div>
              </div>
              
              <p className="text-gray-700">{getRecommendations(result.riskLevel)}</p>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{result.questionsAnswered}</div>
                <div className="text-sm text-gray-600">{t('questionsAnswered')}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{result.totalScore}</div>
                <div className="text-sm text-gray-600">{t('totalScore')}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{result.percentage.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">{t('screeningScore')}</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {t('downloadReport')}
              </button>
              <button
                onClick={() => {
                  window.print();
                  // Generate PDF with jsPDF
                }}
                className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
              >
                {t('shareReport')}
              </button>
            </div>
            
            {/* Medical Disclaimer */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
              <p className="font-medium mb-1">{t('disclaimerTitle')}</p>
              <p>{t('disclaimer')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-4">
            <span className="text-sm text-blue-600 font-medium">
              {question.category}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {getQuestionText(question)}
          </h2>
          
          {question.description && (
            <p className="text-gray-600 text-sm mb-6">
              {question.description}
            </p>
          )}
          
          {/* Answer Options */}
          {question.answer_type === 'multiple_choice' && question.possible_answers && (
            <div className="space-y-3">
              {question.possible_answers.map((answer, idx) => {
                const selected = answers[question.id]?.value === answer;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(answer)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span>{answer}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Numeric Input */}
          {question.answer_type === 'numeric' && (
            <div>
              <input
                type="number"
                onChange={(e) => handleAnswer(parseInt(e.target.value))}
                placeholder="Enter value in months"
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
          
          {/* Text Input */}
          {question.answer_type === 'text' && (
            <div>
              <textarea
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={4}
              />
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('previous')}
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!answers[question.id]}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? t('submit') : t('next')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}