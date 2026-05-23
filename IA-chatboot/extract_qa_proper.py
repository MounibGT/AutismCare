import docx
import json
import re

doc = docx.Document('ADI.docx')
text = '\n'.join([p.text for p in doc.paragraphs])

# Find JSON objects in the text
# The document appears to have embedded JSON
json_matches = []
brace_count = 0
start = -1

for i, char in enumerate(text):
    if char == '{':
        if brace_count == 0:
            start = i
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0 and start >= 0:
            json_str = text[start:i+1]
            try:
                obj = json.loads(json_str)
                json_matches.append(obj)
            except:
                pass
            start = -1

print(f'Found {len(json_matches)} JSON objects')

# Extract Q&A from JSON structure
qa_pairs = []
for obj in json_matches:
    if not isinstance(obj, dict):
        continue
    if 'questions' in obj:
        section = obj.get('section', 'Unknown')
        for q in obj['questions']:
            if not isinstance(q, dict):
                continue
            # Get English question and answer if available
            question = q.get('question_en', '')
            answer = q.get('answer_en', q.get('description', ''))
            if question and answer:
                qa_pairs.append({
                    'question': question.strip(),
                    'answer': answer.strip(),
                    'section': section
                })

print(f'Extracted {len(qa_pairs)} proper Q&A pairs')
print('\nSample Q&A:')
for i, qa in enumerate(qa_pairs[:10]):
    sec = qa.get('section', 'Unknown')
    q = qa['question'][:70]
    a = qa['answer'][:70]
    print(f'{i+1}. [{sec}]')
    print(f'   Q: {q}')
    print(f'   A: {a}')

# Save as text format for easy use
with open('autism_question_bot_data.txt', 'w', encoding='utf-8') as f:
    for qa in qa_pairs:
        f.write(f"Q: {qa['question']}\n")
        f.write(f"A: {qa['answer']}\n\n")

print(f'\nSaved {len(qa_pairs)} Q&A pairs to autism_question_bot_data.txt')
