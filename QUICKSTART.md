# AI Autism Assistant Platform

A comprehensive AI-powered platform for autism screening and support, featuring:
- Autism-specialized chatbot with RAG (Retrieval Augmented Generation)
- Face image analysis using Vision Transformer (ViT)
- ADI-R based screening questionnaire  
- Parent guidance system
- Multilingual support (English/French/Arabic)

## Quick Start

### 1. Start FastAPI Backend (Python)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
# On Windows:
venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --port 8000
```

Backend will run at: http://localhost:8000

**Optional**: Set API keys for GPT/Claude integration:
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your_key"
$env:ANTHROPIC_API_KEY="your_key"

# Or add to a .env file in backend/ directory
```

### 2. Start Next.js Frontend (Node.js)

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

Frontend will run at: http://localhost:3000

### 3. Access the Platform

- **Main Assistant Page**: http://localhost:3000/assistant
- **Screening Questionnaire**: http://localhost:3000/screening  
- **Parent Guidance**: http://localhost:3000/parent-guidance

## What Each Component Does

### 🗣️ Chatbot (Page: /assistant)
- **Without backend**: Uses local knowledge base with 40+ autism facts
- **With backend**: Full GPT/Claude integration + RAG from ADI dataset
- Can upload images for analysis (requires backend)

### 📸 Image Analysis (Page: /assistant)
- **Requires**: FastAPI backend running on port 8000
- Uses trained ViT model on 2,940 face images
- Provides confidence score and classification
- **Important**: Only screening support, NOT medical diagnosis

### 📋 Screening Questionnaire (Page: /screening)
- ADI-R based questions from 582 Q&A dataset
- Interactive scoring with risk assessment (low/medium/high)
- Generates downloadable reports

### 📚 Parent Guidance (Page: /parent-guidance)
- Evidence-based strategies in English/French/Arabic
- Resource links and recommendations
- Cultural adaptations

## Arabic Language (RTL) Support

Arabic is fully supported with right-to-left text direction. The chatbot will:
- Detect Arabic words ("توحد", "autisme", etc.)
- Display UI in Arabic on /ar locale
- Show proper RTL layout

## Medical Disclaimer ⚠️

This platform provides **screening support and educational information only**.
- NOT a substitute for professional medical diagnosis
- Face image analysis alone cannot diagnose autism  
- Always consult qualified healthcare professionals

## Troubleshooting

### "fetch failed" or "API unavailable" errors
→ FastAPI backend is not running. Follow Step 1 above to start it.

### Image analysis returns error
→ Ensure FastAPI backend is running and can access the ViT model files in `image data/` directory.

### Arabic text not displaying properly
→ Ensure you have `messages/ar.json` file in the project root.

### Model loading errors in backend
→ The system includes fallback simulation mode if trained models aren't available.

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── rag_system.py        # ChromaDB RAG integration
│   ├── gpt_client.py        # GPT/Claude API client
│   ├── vit_analyzer.py      # Vision Transformer image analysis
│   └── requirements.txt
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── assistant/page.tsx   # Main AI assistant
│   │   │   ├── screening/page.tsx   # ADI questionnaire
│   │   │   └── parent-guidance/page.tsx
│   │   ├── api/
│   │   │   ├── chatbot/route.ts     # Chat proxy
│   │   │   ├── vit/route.ts         # Image analysis proxy
│   │   │   └── adi-questions/route.ts
│   │   └── components/
│   │       └── AutismChatbot.tsx    # Chat UI component
│   └── i18n/request.ts
├── messages/
│   ├── en_fixed.json
│   ├── fr.json
│   └── ar.json
├── autism_question_bot_data.txt     # ADI dataset (582 Q&As)
└── image data/                        # Face images (2,940 images)
```

## Deployment

### Production Build

```bash
# Build frontend
npm run build

# Backend with Docker
cd backend
docker build -t autism-ai-backend .
docker run -p 8000:8000 autism-ai-backend
```

### Environment Variables

**Backend (.env in backend/)**:
```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Frontend (.env.local)**:
```env
FASTAPI_URL=http://localhost:8000
```

## Technical Details

### AI Models Used
- **Text**: GPT-4-turbo or Claude-3-Sonnet (with fallback to local knowledge base)
- **Vision**: ViT-B/16 ensemble (Swin + ViT + ConvNeXt)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2
- **Vector DB**: ChromaDB for RAG

### Datasets
- **ADI Questions**: 582 Q&A pairs from Autism Diagnostic Interview
- **Face Images**: 1,470 autistic + 1,470 non-autistc children images

### Key Features Implemented
✅ RAG system with ChromaDB  
✅ GPT/Claude API integration  
✅ ViT image analysis  
✅ ADI-R screening questionnaire  
✅ Parent guidance system  
✅ Multilingual (EN/FR/AR) with RTL  
✅ Medical disclaimers integrated  
✅ Offline fallback mode
