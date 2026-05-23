#!/usr/bin/env python3
"""
Autism Chatbot System
Text and Image Analysis for Autism-Related Queries

This system combines:
- Text-based Q&A using neural language models (simulating LLaMA/Mistral)
- Image-based face analysis using Vision Transformers
- Interactive chatbot interface
- Comprehensive evaluation metrics
"""

import sys
import os
import json
import argparse

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.chatbot import AutismChatbot

def load_config(config_path: str = "config.json") -> dict:
    """Load configuration from JSON file"""
    with open(config_path, 'r') as f:
        return json.load(f)

def print_system_info(config: dict):
    """Print system configuration and information"""
    print("="*70)
    print("AUTISM CHATBOT SYSTEM")
    print("Text & Image Analysis for Autism-Related Queries")
    print("="*70)
    print()
    print("System Configuration:")
    print(f"  Project: {config['project']}")
    print(f"  Description: {config['description']}")
    print()
    print("Models:")
    print(f"  Text Model: {config['models']['text_model']['type']}")
    print(f"    - Vocab Size: {config['models']['text_model']['vocab_size']}")
    print(f"    - Embed Dim: {config['models']['text_model']['embed_dim']}")
    print(f"    - Hidden Dim: {config['models']['text_model']['hidden_dim']}")
    print(f"    - Layers: {config['models']['text_model']['num_layers']}")
    print()
    print(f"  Image Model: {config['models']['image_model']['type']}")
    print(f"    - Embed Dim: {config['models']['image_model']['embed_dim']}")
    print(f"    - Attention Heads: {config['models']['image_model']['num_heads']}")
    print(f"    - Transformer Layers: {config['models']['image_model']['num_layers']}")
    print(f"    - Classes: {config['models']['image_model']['num_classes']}")
    print()
    print("Data:")
    print(f"  Text Samples: From formatted dataset")
    print(f"  Image Samples: {config['data']['autistic_images']} Autistic + {config['data']['non_autistic_images']} Non-autistic")
    print(f"  Total Images: {config['data']['total_images']}")
    print()
    print("Features:")
    for feature, enabled in config['features'].items():
        status = "✓" if enabled else "✗"
        print(f"  {status} {feature.replace('_', ' ').title()}")
    print()
    print("="*70)
    print()

def run_training_mode(chatbot: AutismChatbot, epochs: int = 100):
    """Run training mode"""
    print("="*70)
    print("TRAINING MODE")
    print("="*70)
    print()
    
    # Comprehensive training dataset
    questions = [
        "What are the early signs of autism in children?",
        "How is autism spectrum disorder diagnosed?",
        "What interventions are available for autism?",
        "What are the main characteristics of autism?",
        "What support is available for families with autistic children?",
        "What are developmental delays and how do they relate to autism?",
        "How does autism affect communication abilities?",
        "What are repetitive behaviors commonly seen in autism?",
        "How can I help a child with autism in daily activities?",
        "What is the importance of early intervention for autism?",
        "What are sensory sensitivities in autism?",
        "How does autism affect social interactions and relationships?",
        "What therapies are most effective for autism treatment?",
        "What is Applied Behavior Analysis and how does it work?",
        "How to support communication development in autism?",
        "What are Individualized Education Programs (IEPs)?",
        "How does autism affect behavior and emotional regulation?",
        "What are common co-occurring conditions with autism?",
        "How to prepare an autistic child for school?",
        "What resources are available for adults with autism?",
    ]
    
    answers = [
        "Early signs include lack of eye contact, delayed speech development, repetitive behaviors, sensory sensitivities, difficulty with social interactions, and unusual responses to sensory input.",
        "Autism is diagnosed through comprehensive behavioral observations, developmental history assessment, standardized testing tools, and evaluation by qualified professionals.",
        "Interventions include Applied Behavior Analysis (ABA), speech therapy, occupational therapy, social skills training, early intervention programs, and specialized educational support.",
        "Characteristics include communication challenges, social interaction difficulties, restricted and repetitive behaviors, sensory processing differences, and unique strengths and abilities.",
        "Support includes Individualized Education Programs (IEP), family support services, community resources, therapeutic interventions, respite care, and parent training programs.",
        "Developmental delays refer to slower progress in reaching milestones such as walking, talking, or social skills compared to typically developing children, which may indicate autism or other conditions.",
        "Autism affects communication through challenges in verbal and non-verbal communication, difficulty understanding social cues, atypical language development, and differences in conversational skills.",
        "Repetitive behaviors include hand-flapping, rocking, repeating phrases or sounds, insistence on routines, restricted interests in specific topics, and repetitive play patterns.",
        "Help includes providing structure and routine, using visual supports, practicing patience, learning about autism, connecting with support services, and creating accommodating environments.",
        "Early intervention is crucial for maximizing developmental outcomes, building foundational skills, improving long-term prognosis, and supporting family adaptation during critical developmental periods.",
        "Sensory sensitivities involve heightened or reduced responses to sensory input such as sounds, lights, textures, smells, or tastes, which can affect daily functioning and comfort.",
        "Autism affects social interactions through difficulty understanding social norms, maintaining eye contact, reading facial expressions, developing peer relationships, and understanding social expectations.",
        "Effective therapies include ABA, speech therapy, occupational therapy, play therapy, cognitive behavioral therapy, social skills groups, and family therapy approaches.",
        "Applied Behavior Analysis is a therapeutic approach that uses positive reinforcement to teach new skills, increase adaptive behaviors, and reduce challenging behaviors systematically.",
        "Support communication by using visual aids, allowing extra processing time, using clear and simple language, validating all forms of communication, and providing alternative communication methods.",
        "Individualized Education Programs are legally binding documents that outline specialized educational goals, services, accommodations, and supports for students with disabilities in school settings.",
        "Autism can affect behavior through difficulty with emotional regulation, sensory overload, communication challenges, need for routine, and difficulty understanding social situations.",
        "Common co-occurring conditions include ADHD, anxiety disorders, depression, epilepsy, gastrointestinal issues, sleep disorders, and intellectual disability.",
        "Prepare by establishing routines, visiting the school beforehand, meeting teachers, creating visual schedules, practicing self-help skills, and gradually increasing independence.",
        "Resources include vocational training programs, supported employment services, independent living programs, social groups for adults, continuing education opportunities, and advocacy organizations.",
    ]
    
    print(f"Training dataset: {len(questions)} Q&A pairs")
    print(f"Epochs: {epochs}")
    print(f"Batch size: 8")
    print(f"Learning rate: 0.001")
    print()
    
    # Train text model
    print("Training text-based Q&A model...")
    print("-"*70)
    chatbot.train_text_model(questions, answers, epochs=epochs, batch_size=8, lr=0.001)
    
    print()
    print("Text model training completed!")
    print()

def run_evaluation_mode(chatbot: AutismChatbot):
    """Run evaluation mode"""
    print("="*70)
    print("EVALUATION MODE")
    print("="*70)
    print()
    
    # Test questions and reference answers
    test_questions = [
        "What are the signs of autism in young children?",
        "How is autism diagnosed by professionals?",
        "What therapies help with autism?",
        "How does autism affect learning?",
        "What support exists for autistic adults?",
        "What causes repetitive behaviors in autism?",
        "How to improve communication with autistic individuals?",
        "What are sensory processing issues in autism?",
        "How does early intervention help?",
        "What challenges do families face with autism?",
    ]
    
    test_answers = [
        "Signs include limited eye contact, delayed speech, repetitive movements, sensory sensitivities, and social interaction difficulties.",
        "Professionals diagnose autism through behavioral observations, developmental history, standardized assessments, and multidisciplinary evaluation.",
        "Helpful therapies include ABA, speech therapy, occupational therapy, social skills training, and cognitive behavioral therapy.",
        "Autism affects learning through differences in information processing, attention, executive function, and need for specialized teaching methods.",
        "Support includes vocational training, employment assistance, independent living programs, social groups, and advocacy services for adults.",
        "Repetitive behaviors may help with self-regulation, sensory processing, anxiety reduction, and creating predictability.",
        "Improve communication by using visual supports, allowing processing time, being clear and direct, and respecting communication preferences.",
        "Sensory processing issues involve atypical responses to sensory input, which can affect comfort, attention, and participation in activities.",
        "Early intervention builds foundational skills, maximizes developmental potential, improves outcomes, and supports family adjustment.",
        "Families face challenges with diagnosis, accessing services, financial costs, balancing family needs, and navigating complex systems.",
    ]
    
    # Run evaluation
    chatbot.evaluate_models(test_questions, test_answers)
    
    print()
    print("Evaluation completed!")
    print()

def run_interactive_mode(chatbot: AutismChatbot):
    """Run interactive chatbot mode"""
    print("="*70)
    print("INTERACTIVE CHATBOT MODE")
    print("="*70)
    print()
    print("Welcome to the Autism Chatbot!")
    print("I can answer questions about autism, ASD, and related topics.")
    print("I can also analyze images if you'd like to upload a picture.")
    print()
    print("Commands:")
    print("  - Type your question about autism")
    print("  - 'analyze <image_path>' to analyze an image")
    print("  - 'help' to see available topics")
    print("  - 'quit' or 'exit' to end the conversation")
    print()
    print("-"*70)
    
    help_topics = [
        "early signs and symptoms",
        "diagnosis and assessment",
        "therapies and interventions",
        "communication strategies",
        "behavior management",
        "educational support",
        "family resources",
        "sensory processing",
        "social skills",
        "adult autism support"
    ]
    
    conversation_count = 0
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            
            if not user_input:
                continue
            
            conversation_count += 1
            
            # Handle commands
            if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye']:
                print("\nChatbot: Thank you for chatting with me!")
                print(f"Chatbot: We had {conversation_count} exchanges. Have a great day! ✓")
                break
            
            elif user_input.lower() == 'help':
                print("\nChatbot: I can help you with topics like:")
                for i, topic in enumerate(help_topics, 1):
                    print(f"  {i}. {topic}")
                print("\nJust ask me a question about any of these topics!")
                continue
            
            elif user_input.lower().startswith('analyze'):
                parts = user_input.split(' ', 1)
                if len(parts) > 1:
                    image_path = parts[1].strip()
                    print(f"\nChatbot: Analyzing image: {image_path}")
                    print("Chatbot: Processing through Vision Transformer model...")
                    
                    try:
                        result = chatbot.analyze_image(image_path)
                        
                        if 'error' in result:
                            print(f"Chatbot: ⚠️  {result['error']}")
                            print("Chatbot: Please check the image path and try again.")
                        else:
                            print(f"\nChatbot: 📊 Analysis Results:")
                            print(f"  ┌─ Prediction: {result['prediction']}")
                            print(f"  ├─ Confidence: {result['confidence']:.2%}")
                            print(f"  ├─ Probabilities:")
                            print(f"  │  ├─ Autistic: {result['probabilities']['autistic']:.2%}")
                            print(f"  │  └─ Non-Autistic: {result['probabilities']['non_autistic']:.2%}")
                            print(f"  └─ Note: This analysis is for educational purposes only.")
                            print(f"        Professional diagnosis is required for clinical assessment.")
                            
                    except FileNotFoundError:
                        print("Chatbot: ❌ Image file not found. Please check the path.")
                    except Exception as e:
                        print(f"Chatbot: ❌ Error analyzing image: {e}")
                else:
                    print("Chatbot: Please provide an image path (e.g., 'analyze image.jpg')")
                continue
            
            # Check if question is about autism
            autism_keywords = [
                'autism', 'autistic', 'asd', 'spectrum', 'developmental',
                'behavior', 'therapy', 'intervention', 'child', 'diagnosis',
                'communication', 'social', 'sensory', 'special needs',
                'neurodiverse', 'stimming', 'meltdown', 'routine'
            ]
            
            is_autism_related = any(
                keyword in user_input.lower() 
                for keyword in autism_keywords
            )
            
            if is_autism_related or conversation_count <= 2:
                answer = chatbot.generate_answer(user_input)
                print(f"\nChatbot: {answer}")
            else:
                print("\nChatbot: I'm specialized in autism-related topics.")
                print("Chatbot: I can help with questions about:")
                print("  • Autism spectrum disorder (ASD)")
                print("  • Diagnosis and assessment")
                print("  • Therapies and interventions")
                print("  • Support strategies")
                print("  • And more!")
                print("\nTry asking me something about autism!")
        
        except KeyboardInterrupt:
            print("\n\nChatbot: Goodbye! Take care! ✓\n")
            break
        except EOFError:
            print("\nChatbot: Goodbye! ✓\n")
            break

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Autism Chatbot - Text and Image Analysis System'
    )
    parser.add_argument(
        'mode',
        nargs='?',
        default='interactive',
        choices=['train', 'evaluate', 'interactive', 'all'],
        help='Operation mode: train, evaluate, interactive, or all'
    )
    parser.add_argument(
        '--epochs',
        type=int,
        default=100,
        help='Number of training epochs (default: 100)'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='config.json',
        help='Path to configuration file'
    )
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Print system info
    print_system_info(config)
    
    # Initialize chatbot
    print("Initializing Autism Chatbot...")
    device = 'cpu'  # Use CPU for compatibility
    chatbot = AutismChatbot(device=device)
    print(f"✓ Chatbot initialized on {device}\n")
    
    # Run based on mode
    if args.mode in ['train', 'all']:
        run_training_mode(chatbot, epochs=args.epochs)
    
    if args.mode in ['evaluate', 'all']:
        run_evaluation_mode(chatbot)
    
    if args.mode in ['interactive', 'all']:
        run_interactive_mode(chatbot)
    
    print("="*70)
    print("System execution completed successfully!")
    print("="*70)

if __name__ == '__main__':
    main()
