"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  Send, ImagePlus, Trash2, Bot, User, Settings, 
  Menu, X, AlertTriangle, CheckCircle, Wifi, WifiOff
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
  confidence?: number;
  sources?: string[];
};

interface TypingState {
  isStreaming: boolean;
  isAnalyzingImage: boolean;
}

export default function AutismChatbot() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [showSettings, setShowSettings] = useState(false);
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingStateRef = useRef<TypingState>({ isStreaming: false, isAnalyzingImage: false });

  // Check backend connection on mount
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch('/api/chatbot');
      setBackendConnected(res.ok);
    } catch {
      setBackendConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createMessage = (role: 'user' | 'assistant', content: string, extras?: Partial<Message>) => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
    ...extras
  });

  const handleSend = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage = input.trim();
    const imageData = uploadedImage;

    // Optimistically add user message
    const userMsg = createMessage('user', userMessage || '📸 Image uploaded', { 
      image: imageData || undefined 
    });
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add placeholder for streaming response
    const assistantMsg = createMessage('assistant', '');
    setMessages(prev => [...prev, assistantMsg]);

    try {
      if (imageData) {
        // Image analysis
        typingStateRef.current.isAnalyzingImage = true;
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

        const response = await fetch('/api/vit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, text: userMessage })
        });
        const data = await response.json();
        
        const resultText = data.success 
          ? `📊 **Image Analysis**\n\n${data.analysis}\n\n⚠️ **Important:** This is a screening tool, not a diagnosis. Please consult a healthcare professional for proper assessment. The model shows ${data.confidence.toFixed(1)}% confidence that this image exhibits traits associated with autism spectrum.`
          : "❌ Image analysis failed. Please try again.";
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsg.id 
            ? { ...msg, content: resultText, confidence: data.confidence }
            : msg
        ));
      } else if (userMessage) {
        // Text chat
        typingStateRef.current.isStreaming = true;
        
        if (streamEnabled && backendConnected) {
          // Streaming response
          const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              question: userMessage, 
              lang: locale, 
              session_id: sessionId,
              stream: true
            })
          });

          if (response.ok) {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;
                    
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.delta) {
                        fullText += parsed.delta;
                        setMessages(prev => prev.map(msg =>
                          msg.id === assistantMsg.id
                            ? { ...msg, content: fullText }
                            : msg
                        ));
                      }
                    } catch {
                      // Skip invalid JSON
                    }
                  }
                }
              }
            }

            setMessages(prev => prev.map(msg =>
              msg.id === assistantMsg.id
                ? { ...msg, content: fullText, confidence: 0.9 }
                : msg
            ));
          } else {
            // Fallback to non-streaming
            const fallbackRes = await fetch('/api/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question: userMessage, lang: locale, session_id: sessionId })
            });
            const data = await fallbackRes.json();
            
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMsg.id
                ? { ...msg, content: data.response || 'Error processing request', confidence: data.confidence }
                : msg
            ));
          }
        } else {
          // Non-streaming or backend not connected
          const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userMessage, lang: locale, session_id: sessionId })
          });
          const data = await response.json();
          
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMsg.id
              ? { ...msg, content: data.response || 'Error processing request', confidence: data.confidence }
              : msg
          ));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMsg.id
          ? { ...msg, content: "❌ An error occurred. Please check your connection and try again." }
          : msg
      ));
    } finally {
      typingStateRef.current.isStreaming = false;
      typingStateRef.current.isAnalyzingImage = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 z-50 group"
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
    <div className="fixed bottom-6 right-6 w-[95vw] md:w-[500px] h-[80vh] md:h-[700px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-600 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            {backendConnected && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600"></div>
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Autism Support Assistant</h1>
            <p className="text-xs text-green-100 flex items-center gap-1">
              {backendConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  Connected • RAG + GPT-4/Claude
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Offline Mode • Local Knowledge
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Clear chat"
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
        <div className="bg-gray-50 border-b p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Streaming Responses</span>
            <button
              onClick={() => setStreamEnabled(!streamEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${streamEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${streamEnabled ? 'translate-x-7' : 'translate-x-1'}`} style={{ marginTop: '2px' }} />
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {backendConnected ? 'Using GPT-4/Claude API via FastAPI backend' : 'Running in offline mode with local knowledge base'}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Autism Assistant</h2>
            <p className="text-gray-600 max-w-xs mx-auto">
              I'm here to help with autism-related questions. Try asking about screening, therapies, or support strategies.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 max-w-xs mx-auto">
              {['What are early signs of autism?', 'How is autism diagnosed?', 'What therapies help?', 'Support for parents?'].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="text-xs p-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all text-left"
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-green-600' : 'bg-gradient-to-br from-emerald-500 to-green-500'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`
                rounded-2xl p-4 shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-br-md' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                }
              `}>
                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="max-h-48 rounded-xl mb-2" />
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content || (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      Thinking...
                    </span>
                  )}
                </div>

                {msg.confidence && (
                  <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Confidence: {(msg.confidence * 100).toFixed(0)}%
                  </div>
                )}

                <div className="mt-2 text-xs opacity-50">
                  {formatTime(msg.timestamp)}
                </div>
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
          <div className="flex-1 text-sm text-gray-600">Image ready for analysis</div>
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
            title="Upload image for analysis"
          >
            <ImagePlus className="w-5 h-5 text-gray-600" />
          </label>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about autism or describe the image..."
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() && !uploadedImage}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Disclaimer */}
        {messages.length === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 text-xs text-yellow-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important:</strong> This assistant provides educational support only. 
              It is not a substitute for professional medical diagnosis or advice.
              For concerns about autism, please consult a qualified healthcare provider.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}