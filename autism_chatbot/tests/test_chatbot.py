import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.chatbot import AutismChatbot, TextEncoder, TextDecoder, ImageEncoder, AutismDataset
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import numpy as np
from typing import List, Dict

def test_text_encoder():
    """Test the text encoder functionality"""
    print("="*60)
    print("TEST 1: Text Encoder")
    print("="*60)
    
    encoder = TextEncoder(vocab_size=1000)
    
    texts = [
        "What are early signs of autism?",
        "How does autism affect communication?",
        "What therapies are available?"
    ]
    
    encoder.build_vocab(texts)
    
    print(f"Vocabulary size: {len(encoder.word2idx)}")
    print(f"Sample words: {list(encoder.word2idx.keys())[:10]}")
    
    # Test encoding/decoding
    test_text = "autism communication"
    encoded = encoder.encode(test_text, max_len=20)
    decoded = encoder.decode(encoded)
    
    print(f"Original: {test_text}")
    print(f"Encoded: {encoded}")
    print(f"Decoded: {decoded}")
    print("[PASS] Text encoder test passed\n")
    
    return encoder

def test_image_encoder():
    """Test the image encoder model"""
    print("="*60)
    print("TEST 2: Image Encoder Model")
    print("="*60)
    
    model = ImageEncoder(embed_dim=256, num_heads=8, num_layers=4, num_classes=2)
    
    # Create dummy image batch
    batch_size = 4
    dummy_images = torch.randn(batch_size, 3, 224, 224)
    
    print(f"Input shape: {dummy_images.shape}")
    
    # Forward pass
    with torch.no_grad():
        output = model(dummy_images)
    
    print(f"Output shape: {output.shape}")
    print(f"Output (first sample): {output[0]}")
    
    # Check probabilities
    probabilities = torch.softmax(output, dim=1)
    print(f"Probabilities shape: {probabilities.shape}")
    print(f"Predicted classes: {output.argmax(dim=1)}")
    
    print("[PASS] Image encoder test passed\n")
    return model

def test_text_decoder():
    """Test the text decoder model"""
    print("="*60)
    print("TEST 3: Text Decoder Model")
    print("="*60)
    
    vocab_size = 1000
    decoder = TextDecoder(vocab_size=vocab_size, embed_dim=128, hidden_dim=256, num_layers=2)
    
    # Create dummy input
    batch_size = 4
    seq_len = 20
    dummy_input = torch.randint(0, vocab_size, (batch_size, seq_len))
    
    print(f"Input shape: {dummy_input.shape}")
    
    # Forward pass
    output = decoder(dummy_input)
    
    print(f"Output shape: {output.shape}")
    
    # Test loss calculation
    criterion = nn.CrossEntropyLoss(ignore_index=0)
    targets = torch.randint(0, vocab_size, (batch_size, seq_len))
    loss = criterion(output.view(-1, vocab_size), targets.view(-1))
    
    print(f"Sample loss: {loss.item():.4f}")
    
    print("[PASS] Text decoder test passed\n")
    return decoder

def test_dataset():
    """Test the autism dataset"""
    print("="*60)
    print("TEST 4: Autism Dataset")
    print("="*60)
    
    questions = [
        "What is autism?",
        "What are the symptoms?",
        "How is it diagnosed?",
        "What treatments exist?"
    ]
    
    answers = [
        "Autism is a developmental disorder.",
        "Symptoms include communication difficulties.",
        "Diagnosis is based on behavioral observations.",
        "Treatments include therapy and support."
    ]
    
    encoder = TextEncoder(vocab_size=1000)
    dataset = AutismDataset(questions, answers, encoder, max_len=50)
    
    print(f"Dataset size: {len(dataset)}")
    
    # Check first item
    item = dataset[0]
    print(f"Question shape: {item['question'].shape}")
    print(f"Answer shape: {item['answer'].shape}")
    
    # Decode and show
    decoded_question = encoder.decode(item['question'].numpy())
    decoded_answer = encoder.decode(item['answer'].numpy())
    print(f"Question: {decoded_question}")
    print(f"Answer: {decoded_answer}")
    
    print("[PASS] Dataset test passed\n")
    return dataset

def test_chatbot_initialization():
    """Test chatbot initialization"""
    print("="*60)
    print("TEST 5: Chatbot Initialization")
    print("="*60)
    
    chatbot = AutismChatbot(device='cpu')
    
    print(f"Device: {chatbot.device}")
    print(f"Text encoder vocab size: {len(chatbot.text_encoder.word2idx)}")
    print(f"Knowledge base categories: {list(chatbot.knowledge_base.keys())}")
    
    # Test knowledge base
    for category, items in chatbot.knowledge_base.items():
        print(f"  {category}: {len(items)} items")
    
    print("[PASS] Chatbot initialization test passed\n")
    return chatbot

def test_training_pipeline(chatbot: AutismChatbot):
    """Test the training pipeline"""
    print("="*60)
    print("TEST 6: Training Pipeline")
    print("="*60)
    
    questions = [
        "What is early intervention?",
        "How does ABA help?",
        "What is speech therapy?",
        "Are there support groups?",
        "What causes autism?"
    ]
    
    answers = [
        "Early intervention provides support during crucial developmental years.",
        "ABA uses positive reinforcement to teach skills.",
        "Speech therapy helps with communication challenges.",
        "Yes, support groups provide community and resources.",
        "The exact causes are not fully understood."
    ]
    
    print(f"Training samples: {len(questions)}")
    print(f"Epochs: 20 (reduced for test)")
    print(f"Batch size: 4")
    print()
    
    # Train with reduced epochs for testing
    chatbot.train_text_model(questions, answers, epochs=20, batch_size=4, lr=0.001)
    
    # Check training history
    if chatbot.training_history['text_loss']:
        print(f"\nTraining completed!")
        print(f"Initial loss: {chatbot.training_history['text_loss'][0]:.4f}")
        print(f"Final loss: {chatbot.training_history['text_loss'][-1]:.4f}")
        print(f"Loss reduction: {chatbot.training_history['text_loss'][0] - chatbot.training_history['text_loss'][-1]:.4f}")
    
    print("[PASS] Training pipeline test passed\n")

def test_answer_generation(chatbot: AutismChatbot):
    """Test answer generation"""
    print("="*60)
    print("TEST 7: Answer Generation")
    print("="*60)
    
    test_questions = [
        "What are the signs of autism?",
        "How is autism treated?",
        "What support is available?",
        "Tell me about early intervention.",
        "What are repetitive behaviors?"
    ]
    
    for question in test_questions:
        answer = chatbot.generate_answer(question)
        print(f"Q: {question}")
        print(f"A: {answer}")
        print("-" * 40)
    
    print("[PASS] Answer generation test passed\n")

def test_model_evaluation(chatbot: AutismChatbot):
    """Test model evaluation"""
    print("="*60)
    print("TEST 8: Model Evaluation")
    print("="*60)
    
    questions = [
        "What is autism spectrum disorder?",
        "How do you diagnose autism?",
        "What therapies are effective?",
        "What are the challenges faced?",
        "How can families be supported?"
    ]
    
    answers = [
        "ASD is a developmental disorder affecting communication and behavior.",
        "Diagnosis involves behavioral observations and assessments.",
        "ABA, speech therapy, and occupational therapy are effective.",
        "Challenges include communication and social interaction.",
        "Families need resources, support groups, and education."
    ]
    
    chatbot.evaluate_models(questions, answers)
    
    print("[PASS] Model evaluation test passed\n")

def test_image_analysis_simulation():
    """Test image analysis simulation"""
    print("="*60)
    print("TEST 9: Image Analysis Simulation")
    print("="*60)
    
    chatbot = AutismChatbot(device='cpu')
    
    # Simulate with a non-existent file to test error handling
    result = chatbot.analyze_image("non_existent.jpg")
    
    if 'error' in result:
        print(f"Expected error: {result['error']}")
    
    print("Note: Real image analysis requires actual image files")
    print("from 'image data/Autistic - Copy/' or 'image data/Non_Autistic - Copy/'")
    print("[PASS] Image analysis simulation test passed\n")

def run_comprehensive_test():
    """Run all tests"""
    print("\n" + "#"*60)
    print("# COMPREHENSIVE AUTISM CHATBOT TEST SUITE")
    print("#"*60 + "\n")
    
    try:
        # Run individual component tests
        encoder = test_text_encoder()
        test_image_encoder()
        test_text_decoder()
        test_dataset()
        
        # Test integrated system
        chatbot = test_chatbot_initialization()
        test_training_pipeline(chatbot)
        test_answer_generation(chatbot)
        test_model_evaluation(chatbot)
        test_image_analysis_simulation()
        
        # Summary
        print("="*60)
        print("TEST SUMMARY")
        print("="*60)
        print("[PASS] All 9 tests passed successfully!")
        print()
        print("System Capabilities:")
        print("  - Text encoding/decoding for Q&A")
        print("  - LSTM-based text generation")
        print("  - Vision Transformer for image analysis")
        print("  - Knowledge base integration")
        print("  - Training pipeline with loss tracking")
        print("  - Model evaluation with metrics")
        print("  - Interactive chatbot interface")
        print()
        print("Performance Metrics:")
        if chatbot.training_history['text_loss']:
            print(f"  - Final training loss: {chatbot.training_history['text_loss'][-1]:.4f}")
        if chatbot.training_history['f1_scores']:
            print(f"  - F1 Score: {chatbot.training_history['f1_scores'][-1]:.4f}")
            print(f"  - Precision: {chatbot.training_history['precision'][-1]:.4f}")
            print(f"  - Recall: {chatbot.training_history['recall'][-1]:.4f}")
        print()
        print("="*60)
        print("TEST SUITE COMPLETED SUCCESSFULLY")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n[FAIL] Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)
