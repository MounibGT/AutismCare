# AutismCare Chatbot Setup Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AutismCare AI Chatbot Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv-2\Scripts\Activate.ps1"

Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Green
Write-Host "1. Train LLaMA 3 RAG model on ADI data (Recommended)" -ForegroundColor White
Write-Host "2. Start FastAPI backend only" -ForegroundColor White
Write-Host "3. Train ViT image model" -ForegroundColor White
Write-Host "4. Start everything (Backend + ViT server)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Training LLaMA 3 RAG model..." -ForegroundColor Yellow
        Set-Location "IA-chatboot"
        python train_llama_adi.py
        Set-Location ".."
        Write-Host ""
        Write-Host "Training complete! Model saved as llama_adi_rag_model.joblib" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "Starting FastAPI backend..." -ForegroundColor Yellow
        Set-Location "backend"
        python main.py
        Set-Location ".."
    }
    "3" {
        Write-Host ""
        Write-Host "Training ViT image model..." -ForegroundColor Yellow
        Write-Host "Note: This requires GPU and may take several hours." -ForegroundColor Red
        Set-Location "IA-chatboot"
        python train_vit_autism.py
        Set-Location ".."
    }
    "4" {
        Write-Host ""
        Write-Host "Starting FastAPI backend in background..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'backend'; python main.py"
        
        Write-Host "Starting ViT server in background..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'IA-chatboot'; python vit_api.py"
        
        Write-Host ""
        Write-Host "Both servers are starting in new windows..." -ForegroundColor Green
        Write-Host "FastAPI backend: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "ViT server: http://localhost:5001" -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "For more information, see TRAINING_GUIDE.md" -ForegroundColor Cyan