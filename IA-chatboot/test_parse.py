import re
import json

with open('adi_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Find JSON objects with sections
pattern = r'\{[\s\S]*?"questions":\s*\[[\s\S]*?\]\s*\}'
matches = re.findall(pattern, content)
print(f'Found {len(matches)} JSON-like structures')

# Try to parse each
for i, m in enumerate(matches[:3]):
    try:
        data = json.loads(m)
        print(f'Match {i}: section={data.get("section")}, questions={len(data.get("questions", []))}')
    except Exception as e:
        print(f'Match {i}: parse error - {str(e)[:50]}')