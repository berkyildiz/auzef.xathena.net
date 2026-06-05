import sys
import re
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

def parse_hybrid(filename):
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
        q_text = normalize(q_p.get_text(strip=True))
        
        img = b.find('img')
        img_url = process_image(img['src'] if img else None)
        
        opts = []
        correct = None
        for od in b.find_all('div', class_=re.compile(r'rounded-xl border p-4')):
            letter_span = od.find('span', class_=re.compile(r'flex h-10 w-10'))
            if not letter_span: continue
            letter = letter_span.get_text(strip=True)
            text_p = od.find('p', class_=re.compile(r'whitespace-pre-wrap'))
            opt_text = text_p.get_text(strip=True) if text_p else ""
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
        
        q_text = normalize(h3.get_text(strip=True))
        q_text = re.sub(r'^#\d+\.\s*', '', q_text)
        
        img = b.find('img')
        img_url = process_image(img['src'] if img else None)
        
        opts = []
        correct = None
        for r in b.find_all('div', class_='hdq_row'):
            label = r.find('span', class_='hdq_aria_label')
            if not label: continue
            opt_full = label.get_text(strip=True)
            match = re.match(r'^([A-E])\)\s*(.*)', opt_full)
            if match:
                letter, text = match.groups()
            else:
                letter = chr(65 + len(opts))
                text = opt_full
            
            is_correct = 'hdq_correct_not_selected' in r.get('class', []) or 'hdq_correct' in r.get('class', [])
            if is_correct: correct = letter
            opts.append({'letter': letter, 'text': text, 'isCorrect': is_correct})
            
        if len(opts) > 0:
            questions.append({'q': q_text, 'img': img_url, 'opts': opts, 'correct': correct})

    # FORMAT 3: <h4> Question Text \n <p> A) ... </p> ...
    for h4 in soup.find_all('h4'):
        q_text = normalize(h4.get_text(strip=True))
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
                # Stop if we hit another question block or heading
                break
                
            if node.name == 'p':
                text = node.get_text(strip=True)
                if text.startswith('Cevap :') or text.startswith('Cevap:'):
                    match = re.search(r'Cevap\s*:\s*([A-E])', text)
                    if match:
                        correct = match.group(1)
                    break # End of this question's options
                    
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    match = re.match(r'^([A-E])\)\s*(.*)', line)
                    if match:
                        opts.append({'letter': match.group(1), 'text': match.group(2), 'isCorrect': False})
            
            node = node.find_next_sibling()
            
        if len(opts) > 0 and correct:
            for o in opts:
                if o['letter'] == correct: o['isCorrect'] = True
            questions.append({'q': q_text, 'img': img_url, 'opts': opts, 'correct': correct})

    # Deduplication
    seen = set()
    dedup = []
    for q in questions:
        norm = re.sub(r'\s+', '', q['q'].lower())
        if norm not in seen and len(q['opts']) > 0 and q['correct']:
            seen.add(norm)
            dedup.append(q)
            
    print(f"File {filename}: Extracted {len(dedup)} complete & unique questions.")
    
    # Fix missing letters or options for robust UI
    for q in dedup:
        # ensure they have 5 options
        if len(q['opts']) < 5:
            # We don't care much, UI handles it, but let's log
            print(f" WARNING: '{q['q'][:40]}...' has {len(q['opts'])} options")
            
    return dedup

parse_hybrid('benzetimtxt.txt')
parse_hybrid('bilgisistemleriprojeyonetimi.txt')
