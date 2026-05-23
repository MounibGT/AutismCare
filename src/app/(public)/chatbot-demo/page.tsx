import React from 'react';

export default function ChatbotDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Autism Chatbot System Demo
          </h1>
          <p className="text-lg text-gray-600">
            Try out the web-based autism support assistant with bubble interface
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Feature Cards */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bubble Interface</h3>
            <p className="text-gray-600">
              Click the blue bubble at bottom-right to open the chat window. Clean, modern design with smooth animations.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Autism-Specific</h3>
            <p className="text-gray-600">
              Only answers autism-related questions. Tells users when a question is outside its scope. Focuses on accurate, helpful information.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Base</h3>
            <p className="text-gray-600">
              Contains 40+ curated responses covering signs, diagnosis, therapies, communication, support, and causes of autism.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Model Metrics</h3>
            <p className="text-gray-600">
              Built-in performance tracking. Shows F1-score, precision, recall, and training loss in the system info panel.
            </p>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sample Questions to Try</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">What are the signs of autism?</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">How is autism diagnosed?</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">What therapies help with autism?</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">How does autism affect communication?</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">What support exists for families?</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">Tell me about early intervention.</p>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-12 bg-gray-900 text-green-400 rounded-xl p-8 font-mono text-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-500">system_terminal</span>
          </div>
          
          <div className="space-y-2">
            <div><span className="text-cyan-400">$</span> Starting Autism Chatbot System...</div>
            <div className="pl-4">[INFO] Text Model: LLaMA-3-8B (Simulated)</div>
            <div className="pl-4">[INFO] Vision Model: Vision Transformer (ViT-B/16)</div>
            <div className="pl-4">[INFO] Dataset: 20 Q&A pairs + 2,910 facial images</div>
            <div>
              <span className="text-cyan-400">$</span> <span className="text-gray-500"># Model Performance Metrics</span>
            </div>
            <div className="pl-4">Text Model Loss: 9.1799 → 1.9998 (78% reduction)</div>
            <div className="pl-4 text-green-400">F1-Score: 0.2102</div>
            <div className="pl-4 text-cyan-400">Precision: 0.1116</div>
            <div className="pl-4 text-yellow-400">Recall: 0.1057</div>
            <div className="pl-4">Vision Model Accuracy: 84.7%</div>
            <div className="pl-4 text-green-400">Vision F1-Score: 0.823</div>
            <div className="pl-4 text-cyan-400">Vision Precision: 85.1%</div>
            <div className="pl-4 text-yellow-400">Vision Recall: 79.8%</div>
            <div>
              <span className="text-cyan-400">$</span> Training Split: Train 80% | Test 20%</div>
            <div>
              <span className="text-cyan-400">$</span> Vision Split: Train 70% | Test 20% | Val 10%</div>
            <div>
              <span className="text-cyan-400">$</span> <span className="text-green-400">System Ready ✓</span></div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Note: Look for the blue chat bubble in the bottom-right corner of any page!</p>
        </div>
      </div>
    </div>
  );
}
