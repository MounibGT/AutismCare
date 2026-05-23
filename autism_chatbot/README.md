# Autism Chatbot System

## Overview
A comprehensive chatbot system for answering autism-related questions using text-based Q&A and image analysis for face recognition. The system combines neural language models (simulating LLaMA/Mistral architectures) with Vision Transformers for multi-modal analysis.

## Features

### Text Analysis
- **Q&A System**: Answers questions about autism, diagnosis, therapies, and support
- **Knowledge Base**: Integrated domain-specific information
- **Neural Language Model**: LSTM-based decoder simulating transformer architectures
- **Context Understanding**: Processes complex autism-related queries

### Image Analysis  
- **Face Analysis**: Analyzes facial images for autism indicators
- **Vision Transformer**: Transformer-based architecture with ResNet backbone
- **Classification**: Distinguishes between Autistic and Non-Autistic faces
- **Confidence Scoring**: Provides probability distributions

### Dataset
- **Text Data**: Autism assessment questionnaires and Q&A pairs
- **Image Data**: 
  - 1,470 images of autistic children
  - 1,440 images of non-autistic children
  - Total: 2,910 facial images

## Model Architecture

### Text Model (Simulating LLaMA/Mistral)
```
TextEncoder:
- Vocabulary Size: 10,000
- Embedding Dimension: 256
- LSTM-based processing

TextDecoder:
- Hidden Dimension: 512
- LSTM Layers: 2
- Cross-entropy loss with teacher forcing
```

### Image Model (Simulating Vision Transformer/Swin)
```
ImageEncoder:
- Backbone: ResNet18 (pretrained)
- Transformer Encoder:
  - Embed Dimension: 512
  - Attention Heads: 8
  - Layers: 6
- Classification Head: 2 classes (Autistic/Non-Autistic)
```

## Installation

```bash
# Clone or navigate to project directory
cd autism_chatbot

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Interactive Mode (Default)
```bash
python run_chatbot.py interactive
```

Start a conversation with the chatbot about autism-related topics.

### Training Mode
```bash
python run_chatbot.py train --epochs 100
```

Train the text model on autism Q&A pairs.

### Evaluation Mode
```bash
python run_chatbot.py evaluate
```

Evaluate model performance with metrics (accuracy, F1, precision, recall).

### All Modes
```bash
python run_chatbot.py all --epochs 100
```

Run training, evaluation, and interactive modes sequentially.

## Commands in Interactive Mode

- **Ask questions**: Type any autism-related question
- **Analyze images**: `analyze path/to/image.jpg`
- **Help**: `help` - Show available topics
- **Exit**: `quit`, `exit`, or `bye`

## Example Queries

```
You: What are early signs of autism?
Chatbot: Early signs include lack of eye contact, delayed speech 
development, repetitive behaviors, sensory sensitivities, and 
difficulty with social interactions.

You: analyze image_data/Autistic - Copy/0001.jpg
Chatbot: 📊 Analysis Results:
  ┌─ Prediction: Autistic
  ├─ Confidence: 92.34%
  ├─ Probabilities:
  │  ├─ Autistic: 92.34%
  │  └─ Non-Autistic: 7.66%
```

## Performance Metrics

The system reports:
- **Accuracy**: Word overlap and semantic similarity
- **F1 Score**: Balance of precision and recall
- **Precision**: Correct positive predictions
- **Recall**: Coverage of relevant answers
- **Training Loss**: Cross-entropy loss over epochs

## File Structure

```
autism_chatbot/
├── src/
│   └── chatbot.py          # Main chatbot implementation
├── tests/
│   └── test_chatbot.py     # Comprehensive test suite
├── models/                 # Saved model weights
├── data/                   # Processed data
├── config.json            # System configuration
├── requirements.txt        # Python dependencies
└── run_chatbot.py         # Main entry point
```

## Configuration

Edit `config.json` to adjust:
- Model hyperparameters
- Training settings
- Data paths
- Feature toggles

## Technical Details

### Text Processing
1. Tokenization and vocabulary building
2. Sequence encoding with special tokens (SOS, EOS, PAD)
3. LSTM-based sequence generation
4. Knowledge base retrieval for common queries

### Image Processing
1. Image resizing to 224×224
2. Normalization with ImageNet statistics
3. ResNet feature extraction
4. Transformer encoding
5. Classification with softmax

### Training
- Optimizer: Adam (lr=0.001)
- Loss: Cross-entropy (ignore padding)
- Batch size: 8
- Epochs: 100 (configurable)

## Limitations

1. **Educational Use Only**: Not for clinical diagnosis
2. **Dataset Size**: Limited training samples for robust generalization
3. **Image Analysis**: Requires diverse, labeled datasets for production use
4. **Language**: Primarily English-based queries

## Ethical Considerations

- Respects neurodiversity paradigm
- Emphasizes support over "cure"
- Promotes understanding and acceptance
- Provides resources, not medical advice

## Future Enhancements

- Integration with LLaMA-3 or Mistral-7B via APIs
- Fine-tuned vision-language models
- Multi-turn conversation memory
- Personalized user profiles
- Expanded language support

## License

Educational and research purposes.

## Citation

If you use this system, please cite:
```
Autism Chatbot System - Text and Image Analysis
for Autism-Related Queries
```

## Support

For questions or issues, please refer to:
- Autism Speaks: https://www.autismspeaks.org
- CDC Autism Resources: https://www.cdc.gov/autism
- National Autistic Society: https://www.autism.org.uk
