import docx

doc = docx.Document('ADI.docx')
qa_pairs = []
current_q = None

for para in doc.paragraphs:
    text = para.text.strip()
    if not text:
        continue
    # Simple heuristic: question contains ? or starts with question words
    if '?' in text or text.lower().startswith(('what', 'how', 'when', 'why', 'describe', 'does', 'is ', 'are ', 'do ')):
        if current_q:
            qa_pairs[-1]['answer'] = current_q
        current_q = text
        qa_pairs.append({'question': text, 'answer': ''})
    elif current_q and len(qa_pairs) > 0 and qa_pairs[-1]['answer'] == '':
        # First non-empty line after question is answer
        qa_pairs[-1]['answer'] = text
        current_q = None

print(f'Total Q&A pairs extracted: {len(qa_pairs)}')
print('\nFirst 5 pairs:')
for i, qa in enumerate(qa_pairs[:5]):
    q = qa['question'][:80]
    a = qa['answer'][:80] if qa['answer'] else '(no answer)'
    print(f'{i+1}. Q: {q}')
    print(f'   A: {a}')
