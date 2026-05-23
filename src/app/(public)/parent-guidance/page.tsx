"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { BookOpen, Users, Heart, ExternalLink, Calendar, MessageCircle } from 'lucide-react';

type GuidanceTopic = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  resources: { title: string; url: string }[];
};

export default function ParentGuidanceSystem() {
  const t = useTranslations('ParentGuidance');
  const locale = useLocale();
  const [activeTopic, setActiveTopic] = useState('understanding');

  const topics: GuidanceTopic[] = [
    {
      id: 'understanding',
      title: t('sections.understanding'),
      icon: <BookOpen className="w-6 h-6" />,
      content: "Understanding autism means recognizing it as a neurodevelopmental difference, not a disorder. Children with autism perceive and interact with the world differently, with unique strengths and challenges.",
      resources: [
        { title: "Autism Speaks - Guide for Parents", url: "https://www.autismspeaks.org" },
        { title: "CDC - Developmental Milestones", url: "https://cdc.gov/ncbddd/actearly" }
      ]
    },
    {
      id: 'communication',
      title: t('sections.communication'),
      icon: <MessageCircle className="w-6 h-6" />,
      content: "Effective communication with autistic children involves using clear, concrete language; visual supports like PECS or social stories; allowing extra processing time; and accepting all forms of communication.",
      resources: [
        { title: "PECS Resources", url: "https://pecs.com" },
        { title: "Social Stories Creator", url: "https://socialstories.org" }
      ]
    },
    {
      id: 'support',
      title: t('sections.support'),
      icon: <Heart className="w-6 h-6" />,
      content: "Building a support network includes connecting with local autism organizations, joining parent support groups (both online and in-person), understanding your rights under IDEA and ADA, and knowing when to ask for respite care.",
      resources: [
        { title: "Autism Society", url: "https://autismsociety.org" },
        { title: "The Arc", url: "https://thearc.org" }
      ]
    },
    {
      id: 'resources',
      title: t('sections.resources'),
      icon: <ExternalLink className="w-6 h-6" />,
      content: "Key resources include: Early Intervention services (birth-3 years), school IEP teams, speech and occupational therapists, mental health professionals experienced in autism, and financial assistance programs.",
      resources: [
        { title: "Early Intervention Finder", url: "https://earlyintervention.org" },
        { title: "Medicaid Waiver Info", url: "https://cms.gov" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive guidance and resources for parents supporting children with autism spectrum differences.
          </p>
        </div>
        
        {/* Topic Navigation */}
        <div className="grid md:grid-cols-4 gap-3 mb-8">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={`p-4 rounded-xl transition-all text-right ${
                activeTopic === topic.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                activeTopic === topic.id ? 'bg-white/20' : 'bg-purple-100'
              }`}>
                {topic.icon}
              </div>
              <div className="font-medium text-sm">{topic.title}</div>
            </button>
          ))}
        </div>
        
        {/* Active Topic Content */}
        {topics.filter(t => t.id === activeTopic).map(topic => (
          <div key={topic.id} className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                {topic.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {topic.content}
            </p>
            
            {/* Resources */}
            {topic.resources.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Helpful Resources</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {topic.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-700 font-medium">{res.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all">
            <Calendar className="w-8 h-8 mb-3" />
            <div className="font-semibold">Book Professional Consultation</div>
          </button>
          <button className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all">
            <MessageCircle className="w-8 h-8 mb-3" />
            <div className="font-semibold">Join Support Group</div>
          </button>
          <button className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all">
            <BookOpen className="w-8 h-8 mb-3" />
            <div className="font-semibold">Download Resource Guide</div>
          </button>
        </div>
      </div>
    </div>
  );
}