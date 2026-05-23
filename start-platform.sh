#!/bin/bash
# Mac/Linux startup script

echo "🚀 Starting AI Autism Assistant Platform..."

# Start FastAPI Backend
echo "1. Starting FastAPI Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Check health
curl -s http://localhost:8000/health > /dev/null && echo "✓ Backend healthy" || echo "⚠ Backend starting..."

# Start Frontend
echo "2. Starting Next.js Frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Platform started!"
echo ""
echo "🌐 URLs:"
echo "   Main Chat:    http://localhost:3000/assistant"
echo "   Screening:    http://localhost:3000/screening"
echo "   Parent Guide: http://localhost:3000/parent-guidance"
echo ""
echo "📊 API:"
echo "   Health:  http://localhost:8000/health"
echo "   Metrics: http://localhost:8000/model-metrics"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait
wait $BACKEND_PID $FRONTEND_PID