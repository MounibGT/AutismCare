# AI Autism Assistant Platform

A comprehensive AI-powered platform for autism screening and support, featuring:
- Autism-specialized chatbot with RAG (Retrieval Augmented Generation)
- Face image analysis using Vision Transformer (ViT)
- ADI-R based screening questionnaire
- Parent guidance system
- Multilingual support (English/French/Arabic)

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + Shadcn/UI components
- **Internationalization**: next-intl (EN/FR/AR)
- **Authentication**: NextAuth.js with MongoDB

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **AI Models**:
  - **Chat**: GPT-4/Claude with RAG (ChromaDB + ADI dataset)
  - **Vision**: Vision Transformer (ViT-B/16) for face analysis
- **Deployment**: Docker-ready for Railway/Vercel

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── rag_system.py       # ChromaDB RAG system
│   ├── gpt_client.py       # GPT/Claude API client
│   ├── vit_analyzer.py     # ViT image analysis
│   └── requirements.txt
├── src/
│   ├── app/
│   │   ├── api/            # Next.js API routes
│   │   │   ├── chatbot/
│   │   │   ├── vit/
│   │   │   └── adi-questions/
│   │   ├── (public)/
│   │   │   ├── assistant/  # Main AI assistant page
│   │   │   ├── screening/  # Questionnaire page
│   │   │   └── parent-guidance/
│   │   └── components/
│   │       └── AutismChatbot.tsx
│   └── i18n/
├── messages/
│   ├── en_fixed.json
│   ├── fr.json
│   └── ar.json             # Arabic translations
├── image data/             # Autism face dataset (2,940 images)
├── autism_question_bot_data.txt  # ADI Q&A dataset
└── docker-compose.yml
```

## Quick Start

### Development (Local)

1. **Start FastAPI Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

2. **Start Next.js Frontend**:
```bash
npm install
npm run dev
```

3. **Navigate to**: http://localhost:3000/assistant

### Production (Docker)

```bash
docker-compose up -d
```

## Environment Variables

```env
# Backend
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Frontend (.env.local)
FASTAPI_URL=http://localhost:8000
NEXTAUTH_SECRET=your_secret
MONGODB_URI=your_mongodb_uri
```

## Key Features

### 1. Autism Chatbot (RAG + GPT/Claude)
- Uses ADI dataset as knowledge base via ChromaDB
- Multilingual support with context-aware responses
- Medical disclaimer integrated

### 2. Face Image Analysis (ViT)
- Vision Transformer (ViT-B/16) ensemble model
- 2,940 training images (1,470 autistic + 1,470 non-autistic)
- **Important**: Not a medical diagnosis tool

### 3. Screening Questionnaire
- ADI-R based questions
- Scoring system with risk assessment
- PDF report generation

### 4. Parent Guidance
- Evidence-based recommendations
- Resource links and support information
- Cultural adaptations for Arabic/French

## API Endpoints

### FastAPI (Port 8000)
- `GET /health` - Check system status
- `POST /chat` - Chat with RAG + GPT
- `POST /analyze-image` - Analyze face image
- `POST /questionnaire/answer` - Submit questionnaire answer

### Next.js API (Port 3000)
- `POST /api/chatbot` - Proxy to FastAPI chat
- `POST /api/vit` - Proxy to FastAPI image analysis
- `GET /api/adi-questions` - Get screening questions

## Medical Disclaimer

This platform provides screening support and educational information only. It is NOT a substitute for professional medical diagnosis. Face image analysis alone cannot diagnose autism. Please consult qualified healthcare professionals for proper assessment and diagnosis.

## Deployment

### Vercel (Frontend)
```bash
vercel --prod
```

### Railway (Backend)
```bash
railway up
```

## License

This project is for educational and research purposes. Medical use should always involve qualified professionals.