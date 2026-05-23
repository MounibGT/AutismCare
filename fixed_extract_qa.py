import docx
import json

doc = docx.Document('ADI.docx')
full_text = ''
for para in doc.paragraphs:
    full_text += para.text + '\n'

# Find all JSON objects by tracking braces
json_objects = []
start_positions = []
brace_count = 0
in_object = False
start_idx = 0

for i, char in enumerate(full_text):
    if char == '{' and not in_object:
        in_object = True
        start_idx = i
        brace_count = 1
    elif in_object:
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                # Found complete JSON object
                json_text = full_text[start_idx:i+1]
                try:
                    data = json.loads(json_text)
                    json_objects.append(data)
                except:
                    pass  # Invalid JSON, skip
                in_object = False

print('Found {} JSON objects'.format(len(json_objects)))

all_questions = []
for obj in json_objects:
    if 'questions' in obj and isinstance(obj['questions'], list):
        all_questions.extend(obj['questions'])
        print('Section "{}" has {} questions'.format(obj.get("section", "Unknown"), len(obj['questions'])))

print('Total questions found: {}'.format(len(all_questions)))

# Generate Q&A pairs
knowledge = {
    'family structure': 'Family structure refers to who lives in the household and their relationships (nuclear, single-parent, extended family, etc.), which helps contextualize the child\'s environment.',
    'brothers or sisters': 'Having siblings affects social development opportunities and family dynamics. Both having and not having siblings are normal variations.',
    'names and ages': 'Knowing sibling ages helps understand developmental context and interaction patterns within the family.',
    'biological parents': 'Whether children share both biological parents helps assess genetic relatedness and familial patterns that may be relevant to development.',
    'adopted or fostered': 'Adoption or foster care history is important for understanding early life experiences, potential attachment disruptions, and access to biological family history.',
    'previous marriage': 'Children from previous marriages may have experienced family transitions that could impact their development and adjustment.',
    'others living at home': 'Extended family members in the household can provide additional support, different caregiving models, or increased environmental complexity.',
    'developmental delays': 'Developmental delays in family members increase concern for similar issues in the child due to shared genetic and environmental factors.',
    'developmental problems': 'Known developmental disorders in relatives significantly increase risk for the child and inform what to look for during assessment.',
    'parent difficulties': 'Parental history of developmental challenges suggests possible genetic factors that may influence the child\'s development.',
    'parent problems': 'Parental history of diagnosed developmental disorders indicates higher genetic loading and may warrant more comprehensive evaluation.',
    'similar difficulties': 'Presence of similar challenges in other family members suggests possible hereditary or shared environmental contributions.'
}

qa_pairs = []
for qitem in all_questions:
    question_en = ''
    if isinstance(qitem, dict):
        question_en = qitem.get('question_en', '')
    elif isinstance(qitem, str):
        # If it's already a string, use it as the question
        question_en = qitem
    
    if question_en:
        # Clean up the question
        question = ' '.join(question_en.split()).strip()
        if len(question) > 10:
            # Generate answer
            q_lower = question.lower()
            answer = 'This question helps gather important developmental and family history information for assessment.'
            
            if 'family structure' in q_lower:
                answer = knowledge['family structure']
            elif 'brother' in q_lower or 'sister' in q_lower:
                if 'name' in q_lower or 'age' in q_lower:
                    answer = knowledge['names and ages']
                else:
                    answer = knowledge['brothers or sisters']
            elif 'biological parent' in q_lower:
                answer = knowledge['biological parents']
            elif 'adopted' in q_lower or 'fostered' in q_lower:
                answer = knowledge['adopted or fostered']
            elif 'previous marriage' in q_lower:
                answer = knowledge['previous marriage']
            elif 'living with' in q_lower or 'live at home' in q_lower or 'others' in q_lower:
                answer = knowledge['others living at home']
            elif 'sibling' in q_lower and ('delay' in q_lower or 'problem' in q_lower):
                if 'delay' in q_lower:
                    answer = knowledge['developmental delays']
                else:
                    answer = knowledge['developmental problems']
            elif 'parent' in q_lower:
                if 'problem' in q_lower or 'difficult' in q_lower:
                    if 'treatment' in q_lower:
                        answer = knowledge['parent problems']
                    else:
                        answer = knowledge['parent difficulties']
            elif 'family' in q_lower and 'similar' in q_lower:
                answer = knowledge['similar difficulties']
                
            qa_pairs.append((question, answer))

print('Generated {} Q&A pairs'.format(len(qa_pairs)))

# Save to file
with open('autism_question_bot_data.txt', 'w', encoding='utf-8') as f:
    for q, a in qa_pairs:
        f.write('Q: {}\n'.format(q))
        f.write('A: {}\n\n'.format(a))

print('Saved Q&A pairs to autism_question_bot_data.txt')

# Show samples
print('\nFirst 3 Q&A pairs:')
for i in range(min(3, len(qa_pairs))):
    print('Q: {}'.format(qa_pairs[i][0]))
    print('A: {}'.format(qa_pairs[i][1]))
    print()