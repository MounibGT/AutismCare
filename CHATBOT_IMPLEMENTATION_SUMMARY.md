# Autism Support Chatbot - Implementation Summary

## What Was Built

A comprehensive AI-powered chatbot for the AutismCare platform that provides:

### 1. General Chat Support
- **Purpose**: Answer questions about autism spectrum disorder
- **Features**:
  - Multilingual support (English, French, Arabic)
  - RAG-based responses when FastAPI backend is connected
  - Local knowledge base fallback when offline
  - Real-time streaming responses

### 2. ADI Assessment System
- **Purpose**: Interactive Autism Diagnostic Interview screening
- **Features**:
  - Complete ADI questionnaire with 40+ questions
  - Multiple question types: single choice, yes/no, text input
  - Progress tracking with visual progress bar
  - Real-time scoring and risk level assessment
  - Detailed results with percentage and risk level (low/moderate/high)
  - Medical disclaimer included

### 3. Image Analysis
- **Purpose**: Upload and analyze images for autism trait screening
- **Features**:
  - Vision Transformer (ViT) ensemble model integration
  - Confidence scores and detailed analysis
  - Medical disclaimer for screening purposes

## Files Created/Modified

### New Files Created:
1. **`src/components/ADIChatbot.tsx`** - Main chatbot component (950+ lines)
   - Floating chat button
   - Chat interface with messages
   - ADI questionnaire UI
   - Results display
   - Image upload functionality

2. **`src/models/ChatSession.ts`** - MongoDB model for chat sessions
   - Stores chat history
   - Tracks ADI responses
   - Session management

3. **`CHATBOT_GUIDE.md`** - Comprehensive documentation
   - Setup instructions
   - API reference
   - Customization guide
   - Troubleshooting

### Modified Files:
1. **`src/app/layout.tsx`** - Added chatbot component to main layout
2. **`src/app/api/adi-questions/route.ts`** - Enhanced ADI API with scoring

## API Endpoints

### `/api/chatbot` (POST, GET)
- Handles general chat questions
- Proxies to FastAPI backend for AI responses
- Supports streaming responses

### `/api/adi-questions` (GET, POST, PUT)
- GET: Retrieve ADI questions (supports filtering by category and language)
- POST: Submit single answer and get score
- PUT: Submit complete assessment and get full results

### `/api/vit` (POST, GET)
- POST: Analyze uploaded images
- GET: Health check endpoint

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: RAG + GPT-4/Claude (via FastAPI backend)
- **Image Analysis**: Vision Transformer (ViT) ensemble

## Key Features

### User Interface
- Floating chat button in bottom-right corner
- Modern, responsive design with gradients
- Smooth animations and transitions
- Accessibility support (ARIA labels, keyboard navigation)

### Chat Modes
1. **General Chat**: Ask any autism-related question
2. **ADI Assessment**: Structured questionnaire with scoring
3. **Image Analysis**: Upload photos for screening

### Multilingual Support
- English (en)
- French (fr)
- Arabic (ar) with RTL support

### Medical Disclaimers
- Prominently displayed throughout the application
- Clear messaging that this is a screening tool, not diagnostic
- Encourages consultation with healthcare professionals

## How to Use

### For Website Visitors:
1. Click the floating chat button to open the chatbot
2. Choose between:
   - **General Chat**: Type any question about autism
   - **ADI Assessment**: Click "Start ADI Assessment" to begin screening
   - **Image Analysis**: Click the image icon to upload a photo

### For Developers:
1. The chatbot is automatically included via `src/app/layout.tsx`
2. API routes are available at `/api/chatbot`, `/api/adi-questions`, `/api/vit`
3. Customize questions by editing `IA-chatboot/adi_questions.json`
4. Modify styling in `src/components/ADIChatbot.tsx`

## Prerequisites

- Node.js 18+ and npm
- MongoDB connection (configured in `.env`)
- FastAPI backend on port 8000 (optional, for enhanced AI)
- ViT API on port 5001 (optional, for image analysis)

## Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
FASTAPI_URL=http://localhost:8000
VIT_API_URL=http://localhost:5001
```

## Integration Complete

The chatbot is now fully integrated into your AutismCare website. It will appear as a floating button on all pages and provide:

✅ General autism-related Q&A
✅ Complete ADI assessment with scoring
✅ Image upload and analysis
✅ Multilingual support (EN/FR/AR)
✅ MongoDB integration for session storage
✅ Medical disclaimers throughout

## Next Steps

1. **Start your MongoDB server**
2. **Configure your `.env` file** with the correct URLs
3. **Optional**: Start the FastAPI backend for enhanced AI responses
4. **Optional**: Start the ViT API for image analysis
5. **Run `npm run dev`** to start the development server

The chatbot will work in offline mode with basic functionality even without the backend services running.

---

**Built for AutismCare - Supporting families and healthcare professionals**