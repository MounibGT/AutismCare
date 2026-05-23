"use client";

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import EnhancedAutismChatbot from '@/components/EnhancedAutismChatbot';
import { MessageCircle, Image as ImageIcon, ClipboardList, BookOpen, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

type Tab = 'chat' | 'image' | 'questionnaire' | 'guidance';

export default function AIAssistantPlatform() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const tabs = [
    { id: 'chat', label: 'Chat Assistant', icon: MessageCircle },
    { id: 'image', label: 'Image Analysis', icon: ImageIcon },
    { id: 'questionnaire', label: 'Screening', icon: ClipboardList },
    { id: 'guidance', label: 'Parent Guidance', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Autism Assistant Platform
              </h1>
              <p className="text-gray-600 text-sm">
                Comprehensive autism screening and support system
              </p>
            </div>
            
            {/* Feature Quick Links */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/screening" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                <ClipboardList className="w-4 h-4" />
                Screening
              </Link>
              <Link href="/parent-guidance" className="flex items-center gap-1 text-purple-600 hover:text-purple-700">
                <BookOpen className="w-4 h-4" />
                Guidance
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Feature Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Autism Chatbot</h3>
            <p className="text-sm text-gray-600">
              Get evidence-based answers about autism
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <ImageIcon className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Image Analysis</h3>
            <p className="text-sm text-gray-600">
              Facial analysis using Vision Transformer
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <ClipboardList className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Screening Questionnaire</h3>
            <p className="text-sm text-gray-600">
              ADI-R based screening tool
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Users className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-semibold mb-2">Parent Guidance</h3>
            <p className="text-sm text-gray-600">
              Support resources and recommendations
            </p>
          </div>
        </div>
        
        {/* Main Chatbot Component */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <EnhancedAutismChatbot />
        </div>
        
        {/* Medical Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important Medical Notice:</strong> This platform provides screening support and educational information. 
              It is NOT a substitute for professional medical diagnosis. Face image analysis alone cannot diagnose autism. 
              Please consult qualified healthcare professionals for proper assessment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}