import json
import re
from bs4 import BeautifulSoup
import os
import sys
import difflib

def normalize_turkish(text):
    if not text: return ""
    text = text.replace('I', 'ı').lower()
    text = text.replace('ç', 'c').replace('ğ', 'g').replace('ı', 'i').replace('ö', 'o').replace('ş', 's').replace('ü', 'u')
    # Remove all non-alphanumeric characters
    text = re.sub(r'[^a-z0-9]', '', text)
    return text

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

    # FORMAT 5: Table-based questions (<tr><td>) with hidden NOT: explanations and images
    for td in soup.find_all('td'):
        # Only process if there's a Cevap text inside
        td_text = td.get_text(separator='\n', strip=True)
        if 'Cevap :' not in td_text and 'Cevap:' not in td_text:
            continue
            
        correct = None
        explanation = ""
        # Find the node that has the answer
        h_nodes = td.find_all(['h4', 'strong', 'p', 'span'])
        for h in h_nodes:
            h_text = h.get_text(separator=' ', strip=True)
            match = re.search(r'Cevap\s*:\s*([A-E])', h_text, re.IGNORECASE)
            if match:
                correct = match.group(1).upper()
                not_match = re.search(r'NOT\s*:(.*)', h_text, re.IGNORECASE | re.DOTALL)
                if not_match:
                    explanation = not_match.group(1).strip()
                break
                
        if not correct:
            continue
            
        img = td.find('img')
        img_url = process_image(img['src'] if img else None)
        
        # Extract options and question text
        # Usually it looks like: Q text ... \n A) ... \n B) ... \n Cevap : ...
        # We split by Cevap to avoid parsing options from the explanation
        td_text_split = re.split(r'Cevap\s*:', td_text, flags=re.IGNORECASE)[0]
        
        match_q = re.search(r'(?:^\d+[\.\)]\s*)?(.*?)\n\s*A\)\s*(.*?)\n\s*B\)\s*(.*?)\n\s*C\)\s*(.*?)\n\s*D\)\s*(.*?)(?:\n\s*E\)\s*(.*))?$', td_text_split, re.IGNORECASE | re.DOTALL)
        
        if match_q:
            q_text = normalize(match_q.group(1))
            opts = [
                {'letter': 'A', 'text': normalize(match_q.group(2)), 'isCorrect': correct == 'A'},
                {'letter': 'B', 'text': normalize(match_q.group(3)), 'isCorrect': correct == 'B'},
                {'letter': 'C', 'text': normalize(match_q.group(4)), 'isCorrect': correct == 'C'},
                {'letter': 'D', 'text': normalize(match_q.group(5)), 'isCorrect': correct == 'D'},
            ]
            if match_q.group(6):
                opts.append({'letter': 'E', 'text': normalize(match_q.group(6)), 'isCorrect': correct == 'E'})
            
            questions.append({'q': q_text, 'img': img_url, 'opts': opts, 'correct': correct, 'explanation': explanation})

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
                text = node.get_text(separator='\n', strip=True)
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

    # FORMAT 4: PLAINTEXT FALLBACK
    plain_text = soup.get_text(separator='\n')
    blocks = re.split(r'\n\s*\n', plain_text)
    
    for block in blocks:
        block = block.strip()
        if not block: continue
        
        match = re.search(r'(?:Soru\s*\d+|\d+[\.\)])\s*(.*?)\n\s*A\)\s*(.*?)\n\s*B\)\s*(.*?)\n\s*C\)\s*(.*?)\n\s*D\)\s*(.*?)\n(?:E\)\s*(.*?)\n)?.*?Cevap\s*:\s*([A-E])', block, re.IGNORECASE | re.DOTALL)
        if match:
            q_text = normalize(match.group(1))
            opts = [
                {'letter': 'A', 'text': normalize(match.group(2)), 'isCorrect': False},
                {'letter': 'B', 'text': normalize(match.group(3)), 'isCorrect': False},
                {'letter': 'C', 'text': normalize(match.group(4)), 'isCorrect': False},
                {'letter': 'D', 'text': normalize(match.group(5)), 'isCorrect': False},
            ]
            if match.group(6):
                opts.append({'letter': 'E', 'text': normalize(match.group(6)), 'isCorrect': False})
            
            correct = match.group(7).upper()
            for o in opts:
                if o['letter'] == correct:
                    o['isCorrect'] = True
            
            questions.append({'q': q_text, 'img': None, 'opts': opts, 'correct': correct})

    # Fuzzy Deduplication
    final_questions = []
    duplicate_count = 0
    
    for i, q in enumerate(questions):
        if not q['opts'] or not q['correct']:
            continue
            
        norm_q = normalize_turkish(q['q'])
        if len(norm_q) < 5: continue
        
        is_duplicate = False
        for fq in final_questions:
            norm_fq = normalize_turkish(fq['questionText'])
            ratio = difflib.SequenceMatcher(None, norm_q, norm_fq).ratio()
            if ratio > 0.85:
                is_duplicate = True
                break
                
        if not is_duplicate:
            final_q = {
                'id': len(final_questions) + 1,
                'questionText': q['q'],
                'imageUrl': q['img'],
                'options': q['opts'],
                'correctAnswer': q['correct'],
                'explanation': q.get('explanation') or f"Bu sorunun çözümü sistem tarafından analiz edilmektedir. Doğru cevap {q['correct']} şıkkıdır."
            }
            final_questions.append(final_q)
        else:
            duplicate_count += 1
            
    out_path = os.path.join('src', 'data', 'courses', out_filename)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Parsed {len(questions)} initial raw questions.")
    print(f"Removed {duplicate_count} duplicate questions using fuzzy matching.")
    print(f"Total unique flawless questions saved to {out_filename}: {len(final_questions)}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python parser.py <input_txt> <output_json_name>")
    else:
        parse_file(sys.argv[1], sys.argv[2])
