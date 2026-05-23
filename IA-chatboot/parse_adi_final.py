import json
import re

with open('adi_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace newlines that are part of JSON formatting
content = content.replace('\\n', '\n')

# Find all JSON objects by looking for patterns
all_questions = []

# Split by Page markers and process each
pages = re.split(r'Page \d+\s*:\s*\n?', content)

for page_content in pages:
    page_content = page_content.strip()
    if not page_content:
        continue
    
    # Find section name
    section_match = re.search(r'"section":\s*"([^"]+)"', page_content)
    section = section_match.group(1) if section_match else 'unknown'
    
    # Find description
    desc_match = re.search(r'"description":\s*"([^"]+)"', page_content)
    description = desc_match.group(1) if desc_match else ''
    
    # Find all question objects
    question_pattern = r'\{\s*"id":\s*(\d+),\s*"question_en":\s*"([^"]+)",\s*"question_fr":\s*"([^"]+)",\s*"question_ar":\s*"([^"]+)",\s*"category":\s*"([^"]+)",\s*"answer_type":\s*"([^"]+)",\s*"possible_answers":\s*\[([^\]]*)\],\s*"score_map":\s*\{([^}]*)\}'
    
    matches = re.findall(question_pattern, page_content, re.DOTALL)
    
    for m in matches:
        qid, qen, qfr, qar, category, ans_type, poss_ans, score_map = m
        
        # Parse possible answers
        poss_ans_list = re.findall(r'"([^"]+)"', poss_ans)
        
        # Parse score map
        score_map_dict = {}
        for sm in re.findall(r'"([^"]+)":\s*(\d+)', score_map):
            score_map_dict[sm[0]] = int(sm[1])
        
        question = {
            'id': int(qid),
            'question_en': qen,
            'question_fr': qfr,
            'question_ar': qar,
            'category': category,
            'answer_type': ans_type,
            'possible_answers': poss_ans_list,
            'score_map': score_map_dict,
            'section': section,
            'description': description
        }
        all_questions.append(question)

print(f'Total questions extracted: {len(all_questions)}')

with open('adi_questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print('Saved to adi_questions.json')

# Show categories
categories = set(q['category'] for q in all_questions)
print(f'Categories: {categories}')