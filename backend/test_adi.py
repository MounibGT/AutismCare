import os
base = r'D:\Telegram Desktop\cheminement-main\cheminement-main'
f = open(os.path.join(base, 'autism_question_bot_data.txt'), 'r', encoding='utf-8')
content = f.read()
f.close()

# Split on double newlines and then on single newlines
chunks = [p.strip() for p in content.split('\n\n') if p.strip()]
print(f'Total Q&A blocks: {len(chunks)}')

# Count boilerplate
boilerplate = 0
unique_q = set()
for block in chunks:
    # Get the first line as question, rest as answer
    lines = [l for l in block.split('\n') if l.strip()]
    if len(lines) >= 2:
        q = lines[0].replace('Q:', '').strip()
        a = lines[1].replace('A:', '').strip()
        unique_q.add(q)
        if 'assessment' in a.lower() or 'This question helps' in a:
            boilerplate += 1

print(f'Boilerplate answers: {boilerplate}/{len(chunks)}')
print(f'Unique questions: {len(unique_q)}')
print()
print('=== FIRST 10 FULL BLOCKS ===')
for block in chunks[:10]:
    print(block[:300])
    print()
