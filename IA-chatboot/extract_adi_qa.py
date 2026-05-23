import docx
import json
import re

def extract_all_qa_from_adi():
    doc = docx.Document('ADI.docx')
    full_text = ''
    for para in doc.paragraphs:
        full_text += para.text + '\n'
    
    json_objects = []
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
                    json_text = full_text[start_idx:i+1]
                    try:
                        data = json.loads(json_text)
                        json_objects.append(data)
                    except:
                        pass
                    in_object = False
    
    all_qa = []
    
    for obj in json_objects:
        section = obj.get('section', 'Unknown')
        description = obj.get('description', '')
        risk_levels = obj.get('risk_levels', {})
        questions = obj.get('questions', [])
        
        for q in questions:
            q_en = q.get('question_en', '')
            q_fr = q.get('question_fr', '')
            q_ar = q.get('question_ar', '')
            category = q.get('category', '')
            answer_type = q.get('answer_type', '')
            possible_answers = q.get('possible_answers', [])
            score_map = q.get('score_map', {})
            weight = q.get('weight', 1)
            
            answer_text = generate_detailed_answer(q_en, category, answer_type, possible_answers, score_map, section)
            
            if q_en:
                all_qa.append({
                    'question_en': q_en,
                    'question_fr': q_fr,
                    'question_ar': q_ar,
                    'answer': answer_text,
                    'category': category,
                    'section': section,
                    'answer_type': answer_type,
                    'possible_answers': possible_answers,
                    'score_map': score_map,
                    'weight': weight
                })
    
    return all_qa

def generate_detailed_answer(question, category, answer_type, possible_answers, score_map, section):
    knowledge_base = {
        'family_history': {
            'family structure': "Family structure refers to the composition of the household where the child lives. This includes nuclear families (two parents and children), single-parent households, extended families (including grandparents, aunts/uncles), or other arrangements. Understanding family structure helps clinicians interpret the child's social environment and available support systems. Scoring: Normal nuclear family = 0 (lower risk), Single parent/Separated parents/Other = 1 (slightly higher risk due to potential reduced support).",
            'brothers or sisters': "This question assesses whether the child has siblings. Having siblings provides natural opportunities for social interaction, sharing, and learning social skills. Being an only child may mean fewer peer-like interactions at home. Scoring: Yes = 0 (siblings present, normal social opportunities), No = 1 (only child, may have fewer social learning opportunities).",
            'names and ages': "Knowing sibling names and ages helps understand the family dynamics and developmental context. Age gaps between siblings affect interaction patterns - closer ages may mean more peer-like play, while larger gaps may mean more caretaking dynamics. This information helps assess the child's social learning environment.",
            'biological parents': "This determines whether all children in the family share the same biological parents. Full siblings share approximately 50% of their genes, while half-siblings share about 25%. This information is important for understanding genetic factors that may contribute to developmental patterns. Scoring: Yes = 0 (same biological parents), No = 1 (different biological parents, may indicate family complexity).",
            'adopted or fostered': "Adoption or foster care history is crucial for understanding the child's early life experiences. Children who were adopted or fostered may have experienced early life disruptions, changes in caregivers, or limited access to biological family medical history. Early adverse experiences can impact development. Scoring: Yes = 1 (potential early life disruptions), No = 0.",
            'previous marriage': "Children from previous marriages may have experienced family transitions, changes in primary caregivers, or different early environments. These transitions can impact a child's sense of security and attachment patterns. Scoring: Yes = 1 (family transitions present), No = 0.",
            'others living at home': "Extended family members living in the household (grandparents, aunts, uncles, etc.) can provide additional support, different interaction models, and increased environmental complexity. This can be both beneficial (more social interaction) and challenging (less privacy, more noise). Scoring: Yes = 0 (additional support available), No = 1 (smaller household).",
            'developmental delays': "Developmental delays in siblings significantly increase concern for similar issues in the child being assessed. Many developmental conditions have genetic components, so delays in siblings may indicate hereditary factors. Scoring: Yes = 2 (strong risk factor), No = 0.",
            'developmental problems': "Known developmental disorders in siblings (such as autism spectrum disorder, ADHD, language disorders, intellectual disability) significantly increase the risk for the child being assessed. This information helps clinicians know what specific signs to look for. Scoring: Yes = 2 (strong risk factor), No = 0.",
            'parent difficulties': "Parental history of developmental difficulties (such as delayed walking, late speech, learning problems) suggests possible genetic factors that may influence the child's development. Even if parents received no formal diagnosis, a history of difficulties can indicate hereditary patterns. Scoring: Yes = 2 (genetic risk factor), No = 0.",
            'parent problems': "Parental history of diagnosed developmental disorders requiring treatment indicates higher genetic loading. Parents who needed intervention for developmental issues are more likely to have children with similar challenges. Scoring: Yes = 2 (strong genetic risk factor), No = 0.",
            'similar difficulties': "The presence of similar difficulties in other family members (extended family) suggests possible hereditary or shared environmental factors contributing to the child's presentation. This helps build a complete family profile. Scoring: Yes = 2 (familial pattern present), No = 0."
        },
        'educational_medical_history': {
            'default': "This question relates to the child's educational and medical background. Understanding the child's school performance, any special education services, medical history, and previous assessments helps clinicians understand the full context of the child's development and any previous concerns raised by educators or healthcare providers."
        },
        'behavioral_overview': {
            'default': "This question assesses the child's current behavioral patterns. Understanding how the child typically behaves in various situations helps identify strengths and areas of difficulty. This includes social interactions, communication patterns, play behaviors, and any unusual behaviors."
        },
        'current_concerns': {
            'default': "This question addresses the specific concerns that led to the current assessment. Understanding what worries parents or caregivers helps focus the evaluation on the most pressing issues and provides context for interpreting other findings."
        },
        'early_development': {
            'default': "This question explores the child's early developmental milestones. Understanding when the child reached key milestones (sitting, walking, first words, etc.) helps identify any early signs of developmental differences that may have been present from infancy."
        },
        'motor_development': {
            'default': "This question assesses the child's motor development, including both gross motor skills (running, jumping, balance) and fine motor skills (grasping, drawing, using utensils). Motor delays or unusual motor patterns can be associated with developmental conditions."
        },
        'toilet_training': {
            'default': "Toilet training status provides information about the child's self-care abilities and body awareness. Delays in toilet training can be associated with developmental conditions, though many factors influence this milestone including physical readiness, cognitive understanding, and behavioral factors."
        },
        'language': {
            'default': "This question assesses the child's language development, including both understanding (receptive language) and expression (expressive language). Language development is a key area of concern in autism spectrum disorders and other developmental conditions."
        },
        'social_communication': {
            'default': "This question evaluates the child's social communication skills, including how they interact with others, use gestures, maintain eye contact, and engage in social exchanges. Social communication difficulties are a core feature of autism spectrum disorders."
        },
        'restricted_repetitive': {
            'default': "This question assesses restricted and repetitive behaviors, which are a core feature of autism spectrum disorders. This includes repetitive movements, insistence on sameness, highly restricted interests, and unusual sensory responses."
        },
        'sensory': {
            'default': "This question explores sensory processing patterns. Many children with autism spectrum disorders have unusual responses to sensory input, such as being overly sensitive to sounds, textures, or lights, or seeking out certain sensory experiences."
        },
        'rigidity': {
            'default': "This question assesses the child's tolerance for change and flexibility in routines. Difficulty with transitions, insistence on sameness, and distress when routines are disrupted are common in autism spectrum disorders."
        },
        'aggression': {
            'default': "This question assesses aggressive behaviors, which can be present in some children with developmental conditions. Understanding the frequency, triggers, and targets of aggression helps in developing appropriate support strategies."
        },
        'self_injury': {
            'default': "This question assesses self-injurious behaviors, which can occur in some individuals with developmental conditions. Understanding these behaviors is important for safety planning and developing appropriate interventions."
        },
        'seizures': {
            'default': "This question screens for seizure activity, which has a higher prevalence in individuals with autism spectrum disorders and other developmental conditions. Seizures can impact development and behavior."
        },
        'special_skills': {
            'default': "This question assesses any special skills or exceptional abilities the child may have. Some individuals with autism spectrum disorders have areas of exceptional ability (sometimes called savant skills) in areas like memory, music, art, or mathematics."
        }
    }
    
    q_lower = question.lower()
    
    if 'family structure' in q_lower:
        return knowledge_base['family_history']['family structure']
    elif 'brother' in q_lower or 'sister' in q_lower:
        if 'name' in q_lower or 'age' in q_lower:
            return knowledge_base['family_history']['names and ages']
        else:
            return knowledge_base['family_history']['brothers or sisters']
    elif 'biological parent' in q_lower:
        return knowledge_base['family_history']['biological parents']
    elif 'adopted' in q_lower or 'fostered' in q_lower:
        return knowledge_base['family_history']['adopted or fostered']
    elif 'previous marriage' in q_lower:
        return knowledge_base['family_history']['previous marriage']
    elif 'living with' in q_lower or 'live at home' in q_lower or 'others' in q_lower:
        return knowledge_base['family_history']['others living at home']
    elif 'sibling' in q_lower and ('delay' in q_lower or 'problem' in q_lower):
        if 'delay' in q_lower:
            return knowledge_base['family_history']['developmental delays']
        else:
            return knowledge_base['family_history']['developmental problems']
    elif 'parent' in q_lower and ('difficult' in q_lower or 'problem' in q_lower):
        if 'treatment' in q_lower:
            return knowledge_base['family_history']['parent problems']
        else:
            return knowledge_base['family_history']['parent difficulties']
    elif 'family' in q_lower and 'similar' in q_lower:
        return knowledge_base['family_history']['similar difficulties']
    
    for cat_key, cat_data in knowledge_base.items():
        if cat_key in category.lower().replace(' ', '_'):
            if 'default' in cat_data:
                return cat_data['default']
    
    if possible_answers:
        answers_text = ', '.join(possible_answers)
        score_info = '; '.join(['{} = {}'.format(k, v) for k, v in score_map.items()])
        return "This is a {} question. Possible answers: {}. Scoring: {}".format(answer_type.replace('_', ' '), answers_text, score_info)
    
    return "This question is part of the {} section of the ADI-R (Autism Diagnostic Interview-Revised), a standardized diagnostic assessment for autism spectrum disorders.".format(section)

qa_data = extract_all_qa_from_adi()
print('Extracted {} Q&A pairs from ADI.docx'.format(len(qa_data)))

with open('adi_qa_database.json', 'w', encoding='utf-8') as f:
    json.dump(qa_data, f, ensure_ascii=False, indent=2)

print('Saved to adi_qa_database.json')

if qa_data:
    print('\nFirst Q&A pair:')
    print('EN: {}'.format(qa_data[0]['question_en']))
    print('FR: {}'.format(qa_data[0]['question_fr']))
    print('AR: {}'.format(qa_data[0]['question_ar']))
    print('Category: {}'.format(qa_data[0]['category']))
    print('Answer (first 200 chars): {}...'.format(qa_data[0]['answer'][:200]))