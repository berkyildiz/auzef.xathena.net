import json
import re
from bs4 import BeautifulSoup
import os
import sys

def parse_file(filename, out_filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
        
    soup = BeautifulSoup(html, 'html.parser')
    questions = []
    
    def normalize(text):
        if not text: return ""
        return re.sub(r'\s+', ' ', text).strip()

    def process_image(img_url):
        if not img_url: return None
        if img_url.startswith('/'): return "https://lolonolo.com" + img_url
        return img_url

    # FORMAT 1: <div class="rounded-2xl bg-card">
    for b in soup.find_all('div', class_=re.compile(r'rounded-2xl.*bg-card')):
        q_p = b.find('p', class_=re.compile(r'whitespace-pre-wrap.*text-foreground'))
        if not q_p: continue
        q_text = normalize(q_p.get_text(separator='\n', strip=True))
        
        img = b.find('img')
        img_url = process_image(img['src'] if img else None)
        
        opts = []
        correct = None
        for od in b.find_all('div', class_=re.compile(r'rounded-xl border p-4')):
            # Prevent leaking from unclosed parents
            if od.find_parent('div', class_=re.compile(r'rounded-2xl.*bg-card')) != b:
                continue
                
            letter_span = od.find('span', class_=re.compile(r'flex h-10 w-10'))
            if not letter_span: continue
            letter = letter_span.get_text(strip=True)
            text_p = od.find('p', class_=re.compile(r'whitespace-pre-wrap'))
            opt_text = text_p.get_text(separator='\n', strip=True) if text_p else ""
            is_correct = "Doğru cevap" in od.get_text()
            if is_correct: correct = letter
            opts.append({'letter': letter, 'text': opt_text, 'isCorrect': is_correct})
            
        if len(opts) > 0:
            questions.append({'q': q_text, 'img': img_url, 'opts': opts, 'correct': correct})

    # FORMAT 2: <div class="hdq_question">
    for b in soup.find_all('div', class_='hdq_question'):
        h3 = b.find('h3', class_='hdq_question_heading')
        if not h3: continue
        
        num_span = h3.find('span', class_='hdq_question_number')
        if num_span: num_span.extract()
        
        q_text = normalize(h3.get_text(separator='\n', strip=True))
        q_text = re.sub(r'^#\d+\.\s*', '', q_text)
        
        img = b.find('img')
        img_url = process_image(img['src'] if img else None)
        
        opts = []
        correct = None
        for r in b.find_all('div', class_='hdq_row'):
            # Extremely important: Prevent leaking due to unclosed HTML tags!
            if r.find_parent('div', class_='hdq_question') != b:
                continue
                
            label = r.find('span', class_='hdq_aria_label')
            if not label: continue
            opt_full = label.get_text(separator='\n', strip=True)
            match = re.match(r'^([A-E])\)\s*(.*)', opt_full, re.DOTALL)
            if match:
                letter, text = match.groups()
            else:
                letter = chr(65 + len(opts))
                text = opt_full
            
            is_correct = 'hdq_correct_not_selected' in r.get('class', []) or 'hdq_correct' in r.get('class', [])
            if is_correct: correct = letter
            opts.append({'letter': letter, 'text': text.strip(), 'isCorrect': is_correct})
            
        if len(opts) > 0:
            questions.append({'q': q_text, 'img': img_url, 'opts': opts, 'correct': correct})

    # FORMAT 3: <h4> Question Text \n <p> A) ... </p> ...
    for h4 in soup.find_all('h4'):
        q_text = normalize(h4.get_text(separator='\n', strip=True))
        q_text = re.sub(r'^\d+[\.\-]\s*', '', q_text)
        
        img = h4.find('img')
        img_url = None
        if not img:
            prev = h4.find_previous_sibling('img')
            if prev: img_url = prev['src']
        else:
            img_url = img['src']
        img_url = process_image(img_url)
        
        opts = []
        correct = None
        
        node = h4.find_next_sibling()
        while node:
            if node.name in ['h4', 'h3', 'div']:
                break
                
            if node.name == 'p':
                text = node.get_text(separator='\n', strip=True) # SEPARATOR IS VITAL
                if text.startswith('Cevap :') or text.startswith('Cevap:'):
                    match = re.search(r'Cevap\s*:\s*([A-E])', text)
                    if match:
                        correct = match.group(1)
                    break
                    
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    match = re.match(r'^([A-E])\)\s*(.*)', line)
                    if match:
                        opts.append({'letter': match.group(1), 'text': match.group(2).strip(), 'isCorrect': False})
            
            node = node.find_next_sibling()
            
        if len(opts) > 0 and correct:
            for o in opts:
                if o['letter'] == correct: o['isCorrect'] = True
            questions.append({'q': q_text, 'img': img_url, 'opts': opts, 'correct': correct})

    # Deduplication and mapping to final structure
    seen = set()
    final_questions = []
    
    for i, q in enumerate(questions):
        norm = re.sub(r'\s+', '', q['q'].lower())
        # Filter logic: must have correct answer, exactly 5 options, must be unique
        if norm not in seen and len(q['opts']) == 5 and q['correct']:
            seen.add(norm)
            
            # Map to final format
            final_q = {
                'id': len(final_questions) + 1,
                'questionText': q['q'],
                'imageUrl': q['img'],
                'options': q['opts'],
                'correctAnswer': q['correct'],
                'explanation': f"Bu sorunun çözümü sistem tarafından analiz edilmektedir. Doğru cevap {q['correct']} şıkkıdır."
            }
            final_questions.append(final_q)
            
    out_path = os.path.join('src', 'data', 'courses', out_filename)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Total unique flawless questions parsed and saved to {out_filename}: {len(final_questions)}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python parser.py <input_txt> <output_json_name>")
    else:
        parse_file(sys.argv[1], sys.argv[2])
