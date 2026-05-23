"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, X, ImagePlus, AlertTriangle } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Hello! I'm your Autism Support Assistant.",
    placeholder: "Ask about autism...",
    send: "Send",
    close: "Close",
    disclaimer: "This is for educational support only, not medical advice.",
  },
  fr: {
    welcome: "Bonjour! Je suis votre Assistant Soutien Autisme.",
    placeholder: "Posez une question sur l'autisme...",
    send: "Envoyer",
    close: "Fermer",
    disclaimer: "Ceci est un support éducatif uniquement, pas un avis médical.",
  },
  ar: {
    welcome: "مرحباً! أنا مساعد دعم التوحد الخاص بك.",
    placeholder: "اسأل عن التوحد...",
    send: "إرسال",
    close: "إغلاق",
    disclaimer: "هذا للدعم التعليمي فقط، وليس نصيحة طبية.",
  },
};

const knowledgeBase: Record<string, Record<string, string>> = {
  en: {
    "early sign": "Early signs of autism include limited eye contact, delayed speech, repetitive movements, sensory sensitivities, and difficulty with social interactions. These typically appear before age 3.",
    "diagnos": "Autism diagnosis involves developmental screening (M-CHAT), evaluation by specialists, ADI-R interview, and ADOS observation following DSM-5 criteria.",
    "therap": "Evidence-based therapies include ABA, Speech Therapy, Occupational Therapy, Social Skills Training, and Early Intervention services.",
    "support": "Support includes IEPs, special education, parent training, support groups, community resources, and financial assistance programs.",
    default: "I can help with questions about autism signs, diagnosis, therapies, and support. What would you like to know?",
  },
  fr: {
    "early sign": "Signes précoces: contact visuel limité, retard de parole, mouvements répétitifs, sensibilités sensorielles.",
    "diagnos": "Diagnostic implique dépistage développemental, évaluation par spécialistes, ADI-R et ADOS.",
    "therap": "Thérapies: ABA, orthophonie, ergothérapie, formation aux compétences sociales.",
    "support": "Soutien: IEP, éducation spécialisée, groupes de soutien, ressources communautaires.",
    default: "Je peux aider avec questions sur signes, diagnostic, thérapies de l'autisme.",
  },
  ar: {
    "early sign": "علامات مبكرة: تواصل بصري محدود، تأخر كلام，حركات متكررة، حساسيات حسية.",
    "diagnos": "التشخيص يشمل فحص النمو، تقييم المتخصصين، ADI-R و ADOS.",
    "therap": "العلاجات: ABA، علاج النطق، العلاج الوظيفي، التدريب على المهارات.",
    "support": "الدعم: IEP، تعليم خاص، مجموعات دعم، موارد مجتمعية.",
    default: "يمكنني المساعدة في أسئلة عن علامات، تشخيص، علاجات التوحد.",
  },
};

function getResponse(question: string, lang: string): string {
  const kb = knowledgeBase[lang] || knowledgeBase.en;
  const lower = question.toLowerCase();
  
  for (const [key, value] of Object.entries(kb)) {
    if (key !== "default" && lower.includes(key)) {
      return value;
    }
  }
  return kb.default;
}

export default function SimpleChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [locale, setLocale] = useState("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocale(document.documentElement.lang || "en");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const t = translations[locale] || translations.en;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Add typing indicator
    const typingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, typingMsg]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, lang: locale }),
      });
      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingMsg.id
            ? { ...msg, content: data.response || t.default }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingMsg.id ? { ...msg, content: t.default } : msg
        )
      );
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
        aria-label="Open Chat"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-green-600 text-white p-3 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-medium text-sm">Autism Support</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-green-700 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Bot className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p>{t.welcome}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t.placeholder}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {t.send}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-2 bg-green-50 border-t border-green-200">
        <div className="flex items-start gap-1 text-xs text-green-700">
          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <p>{t.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}