import docx
import json

doc = docx.Document('ADI.docx')
text = '\n'.join([p.text for p in doc.paragraphs])

# Find first few JSON objects to understand structure
import re
# Find something that looks like {"section":
matches = re.findall(r'\{[^}]*"section":[^}]*\}', text[:5000])
print(f'Found {len(matches)} section objects')
if matches:
    print('First match:')
    print(matches[0][:500])

# Also find questions array
q_matches = re.findall(r'\{[^}]*"questions":[^}]*\}', text[:10000])
print(f'\nFound {len(q_matches)} question arrays')
if q_matches:
    print('First question array:')
    print(q_matches[0][:500])

# Try to parse first complete JSON block
brace_count = 0
start = -1
for i, char in enumerate(text[:5000]):
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
                print(f'\n--- Parsed JSON object ---')
                print(f'Keys: {list(obj.keys())}')
                if 'questions' in obj:
                    print(f'Questions type: {type(obj["questions"])}')
                    if isinstance(obj["questions"], list) and len(obj["questions"]) > 0:
                        print(f'First question item: {obj["questions"][0]}')
                        print(f'First question keys: {list(obj["questions"][0].keys()) if isinstance(obj["questions"][0], dict) else "not a dict"}')
                break
            except Exception as e:
                pass
            start = -1
