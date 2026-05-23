import json
import re
import docx

def extract_json_from_docx(docx_path):
    doc = docx.Document(docx_path)
    pages = []
    current_page = None
    current_json = None
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        
        if text.startswith('Page ') and ':' in text:
            if current_json:
                pages.append({'page': current_page, 'data': current_json})
            try:
                page_num = text.split('Page ')[1].split(':')[0]
                current_page = int(page_num)
            except:
                current_page = len(pages) + 1
            current_json = None
        elif text.startswith('{'):
            try:
                json_text = text
                json_obj = json.loads(json_text)
                current_json = json_obj
            except json.JSONDecodeError:
                pass
    
    if current_json:
        pages.append({'page': current_page, 'data': current_json})
    
    return pages

def flatten_questions(pages):
    all_questions = []
    for page in pages:
        if 'data' in page and 'questions' in page['data']:
            for q in page['data']['questions']:
                q['section'] = page['data'].get('section', '')
                q['description'] = page['data'].get('description', '')
                all_questions.append(q)
    return all_questions

def main():
    pages = extract_json_from_docx('ADI.docx')
    print(f"Extracted {len(pages)} pages")
    
    questions = flatten_questions(pages)
    print(f"Total questions: {len(questions)}")
    
    with open('adi_questions.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print("Saved to adi_questions.json")
    
    categories = set(q['category'] for q in questions)
    print(f"Categories: {categories}")
    
    return questions

if __name__ == '__main__':
    main()