import json
import re

with open('adi_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Split by Page markers
pages = re.split(r'Page \d+\s*:', content)
print(f'Split into {len(pages)} parts')

all_questions = []
for i, page_content in enumerate(pages):
    if not page_content.strip():
        continue
    
    # Try to find JSON objects
    try:
        # Find the start of JSON
        start = page_content.find('{')
        if start == -1:
            continue
            
        # Find matching end brace
        brace_count = 0
        end = start
        for j, char in enumerate(page_content[start:], start):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = j + 1
                    break
        
        json_str = page_content[start:end]
        data = json.loads(json_str)
        
        if 'questions' in data:
            for q in data['questions']:
                q['section'] = data.get('section', '')
                q['description'] = data.get('description', '')
                all_questions.append(q)
            print(f'Page {i}: Found {len(data["questions"])} questions in section: {data.get("section", "unknown")}')
    except Exception as e:
        pass

print(f'\nTotal questions extracted: {len(all_questions)}')

with open('adi_questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print('Saved to adi_questions.json')