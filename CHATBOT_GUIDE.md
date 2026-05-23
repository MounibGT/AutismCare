# Autism Support Chatbot - Complete Implementation Guide

## Overview

This chatbot is a comprehensive AI assistant for the AutismCare platform, designed to help families of autistic children and healthcare professionals. It provides:

1. **General Chat Support** - Answer questions about autism, diagnosis, therapies, and support strategies
2. **ADI Assessment** - Interactive Autism Diagnostic Interview questionnaire with scoring
3. **Image Analysis** - Upload and analyze images using Vision Transformer (ViT) models
4. **Multilingual Support** - English, French, and Arabic

## Features

### 1. General Chat Mode
- Answers questions about autism spectrum disorder
- Provides information about early signs, diagnosis, therapies, and support
- Uses RAG (Retrieval-Augmented Generation) with GPT-4/Claude when backend is connected
- Falls back to local knowledge base when offline

### 2. ADI Assessment Mode
- Complete ADI (Autism Diagnostic Interview) questionnaire
- Interactive question-by-question navigation
- Real-time scoring and risk level assessment
- Results with detailed breakdown and recommendations
- Supports multiple question types: single choice, yes/no, and text input

### 3. Image Analysis
- Upload images for autism trait analysis
- Uses Vision Transformer (ViT) ensemble models
- Provides confidence scores and detailed analysis
- Medical disclaimer included

## Architecture

### Frontend Components

```
src/components/ADIChatbot.tsx    # Main chatbot component with all UI
src/models/ChatSession.ts        # MongoDB model for chat sessions
```

### API Routes

```
/api/chatbot          # General chat endpoint (proxies to FastAPI backend)
/api/adi-questions    # ADI questionnaire endpoints (GET, POST, PUT)
/api/vit              # Image analysis endpoint (proxies to ViT API)
```

### Data Files

```
IA-chatboot/adi_questions.json    # ADI questions in JSON format
```

## Setup Instructions

### Prerequisites

1. Node.js 18+ and npm
2. MongoDB connection (configured in `.env`)
3. FastAPI backend running on port 8000 (for enhanced AI responses)
4. ViT API running on port 5001 (for image analysis)

### Environment Variables

Add these to your `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/autismcare

# FastAPI Backend (for AI chat)
FASTAPI_URL=http://localhost:8000

# ViT API (for image analysis)
VIT_API_URL=http://localhost:5001

# NextAuth (if using authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The chatbot will appear as a floating button in the bottom-right corner of your website.

## Usage

### For Families

1. **Ask Questions**: Click the chat button and type any question about autism
2. **Take ADI Assessment**: Click "Start ADI Assessment" to begin the screening questionnaire
3. **Upload Images**: Click the image icon to upload a photo for analysis

### For Healthcare Professionals

The chatbot can be used as a screening tool and information resource:
- ADI assessments provide preliminary screening data
- Image analysis offers additional insights (not diagnostic)
- General chat provides evidence-based information

## API Reference

### Chat API

**POST /api/chatbot**
```json
{
  "question": "What are early signs of autism?",
  "lang": "en",
  "session_id": "session_123"
}
```

Response:
```json
{
  "success": true,
  "response": "Early signs of autism include...",
  "confidence": 0.92
}
```

### ADI Questions API

**GET /api/adi-questions**
```
?lang=en&category=family_history
```

Response:
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "Can you describe the child's family structure?",
      "category": "family_history",
      "answer_type": "single_choice",
      "possible_answers": ["Normal nuclear family", "Single parent", ...]
    }
  ]
}
```

**POST /api/adi-questions**
```json
{
  "question_id": 1,
  "answer": "Normal nuclear family",
  "lang": "en"
}
```

**PUT /api/adi-questions**
```json
{
  "responses": [
    { "questionId": 1, "answer": "Normal nuclear family" },
    { "questionId": 2, "answer": "Yes" }
  ]
}
```

Response:
```json
{
  "success": true,
  "totalScore": 15,
  "maxPossibleScore": 50,
  "percentage": 30.0,
  "riskLevel": "moderate",
  "totalQuestions": 10,
  "detailedResults": [...]
}
```

### Image Analysis API

**POST /api/vit**
```json
{
  "image": "base64_encoded_image_data",
  "text": "Optional description or question"
}
```

Response:
```json
{
  "success": true,
  "analysis": "Based on the facial analysis...",
  "confidence": 0.85,
  "class": "Autistic",
  "model": "Improved Ensemble (Swin+ViT+ConvNeXt) with TTA"
}
```

## Customization

### Adding New Questions

Edit `IA-chatboot/adi_questions.json`:

```json
{
  "id": 100,
  "question_en": "Your question in English",
  "question_fr": "Votre question en français",
  "question_ar": "سؤالك بالعربية",
  "category": "your_category",
  "answer_type": "single_choice",
  "possible_answers": ["Option 1", "Option 2", "Option 3"],
  "score_map": {
    "Option 1": 0,
    "Option 2": 1,
    "Option 3": 2
  },
  "section": "Section Name",
  "description": "Additional context for the question"
}
```

### Styling

The chatbot uses Tailwind CSS classes. Customize colors by modifying the gradient classes in `ADIChatbot.tsx`:

```tsx
// Change the main gradient
className="bg-gradient-to-br from-blue-600 to-purple-600"

// Change button colors
className="bg-blue-600 hover:bg-blue-700"
```

### Translations

Add new languages by extending the `translations` object in `ADIChatbot.tsx`:

```tsx
const translations = {
  // ... existing translations
  es: {
    welcome: "Bienvenido al Asistente de Apoyo para el Autismo",
    // ... other translations
  }
};
```

## Medical Disclaimer

⚠️ **Important**: This chatbot is for educational and screening purposes only. It is NOT a diagnostic tool. Always consult qualified healthcare professionals for:
- Proper autism diagnosis
- Treatment recommendations
- Medical advice

The image analysis feature is experimental and should not be used as the sole basis for any medical decisions.

## Troubleshooting

### Chatbot not appearing
- Ensure `ADIChatbot` is imported in `src/app/layout.tsx`
- Check browser console for errors
- Verify the component is not hidden by other elements (z-index)

### API errors
- Verify FastAPI backend is running on port 8000
- Verify ViT API is running on port 5001
- Check `.env` file for correct URLs

### ADI questions not loading
- Ensure `IA-chatboot/adi_questions.json` exists and is valid JSON
- Check file permissions

## Contributing

When adding new features:
1. Maintain multilingual support (EN/FR/AR)
2. Include appropriate medical disclaimers
3. Test with different screen sizes
4. Ensure accessibility (ARIA labels, keyboard navigation)

## License

This project is part of the AutismCare platform. See main project license for details.

## Support

For technical support or questions about the chatbot implementation, please contact the development team.

---

**Built with Next.js, TypeScript, Tailwind CSS, and MongoDB**