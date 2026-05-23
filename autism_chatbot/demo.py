#!/usr/bin/env python3
"""
Quick Demo Script for Autism Chatbot System
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.chatbot import AutismChatbot

def main():
    print("\n" + "="*70)
    print("AUTISM CHATBOT - DEMO")
    print("="*70 + "\n")
    
    # Initialize chatbot
    print("Initializing Autism Chatbot...")
    chatbot = AutismChatbot(device='cpu')
    print("[OK] Chatbot initialized\n")
    
    # Demo questions
    demo_questions = [
        "What are the early signs of autism?",
        "How can autism be treated?",
        "What support is available for families?",
        "Tell me about repetitive behaviors in autism."
    ]
    
    print("="*70)
    print("DEMO QUESTIONS & ANSWERS")
    print("="*70 + "\n")
    
    for i, question in enumerate(demo_questions, 1):
        answer = chatbot.generate_answer(question)
        print(f"Q{i}: {question}")
        print(f"A{i}: {answer}")
        print("-"*70)
    
    # Sample image analysis (note: will fail without actual images)
    print("\n" + "="*70)
    print("IMAGE ANALYSIS DEMO")
    print("="*70 + "\n")
    print("Note: To analyze images, use 'analyze <path>' command")
    print("in interactive mode with actual image files.")
    print("\nSample images available:")
    print("  - image data/Autistic - Copy/0001.jpg")
    print("  - image data/Non_Autistic - Copy/0001.jpg")
    
    print("\n" + "="*70)
    print("DEMO COMPLETE")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
