import json
import re
from bs4 import BeautifulSoup
import os
import sys
import difflib
import concurrent.futures
import time

def normalize_turkish(text):
    if not text: return ""
    text = text.replace('I', 'ı').lower()
    text = text.replace('ç', 'c').replace('ğ', 'g').replace('ı', 'i').replace('ö', 'o').replace('ş', 's').replace('ü', 'u')
    # Remove all non-alphanumeric characters
    text = re.sub(r'[^a-z0-9]', '', text)
    return text

def normalize(text):
    if not text: return ""
    # Clean up random invisible characters and extra whitespace
    text = re.sub(r'[\xa0\u200b]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def is_promotional_image(img_url):
    if not img_url: return True
    lower_url = img_url.lower()
    bad_keywords = ['telegram', 'banner', 'logo', 'premium', 'uye', 'sosyal', 'instagram', 'facebook', 'twitter', 'youtube', 'reklam', 'abone', 'ad-free']
    for kw in bad_keywords:
        if kw in lower_url:
            return True
    return False

def is_fake_explanation(text):
    if not text: return True
    lower_text = text.lower()
    bad_keywords = ['premium', 'üyelere özel', 'reklamsız üye', 'çözüm sadece', 'boş bırakılmış', 'bu soru boş']
    for kw in bad_keywords:
        if kw in lower_text:
            return True
    return False

def process_image(img_url):
    if not img_url or is_promotional_image(img_url): return None
    if img_url.startswith('/'): return "https://lolonolo.com" + img_url
    return img_url

def parse_html(html):
    soup = BeautifulSoup(html, 'html.parser')
    questions = []
    
    # Track parsed blocks to avoid double parsing the same text in different formats
    parsed_texts = set()

    def add_question(q_text, opts, correct, img_url, explanation):
        if not q_text or len(q_text) < 10 or len(q_text) > 1500 or not opts or not correct:
            return
            
        for o in opts:
            if not o['text'] or len(o['text']) < 1 or len(o['text']) > 400:
                return
                
        if is_fake_explanation(explanation):
            explanation = ""
            
        questions.append({
            'q': q_text,
            'img': img_url,
            'opts': opts,
            'correct': correct,
            'explanation': explanation
        })

    # FORMAT 1: Tailwind Web App (<div class="rounded-2xl bg-card">)
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
            
        add_question(q_text, opts, correct, img_url, "")

    # FORMAT 2: HDQ WordPress Plugin
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
            
            # Use title attribute or aria label
            input_tag = r.find('input', type='checkbox')
            opt_full = input_tag.get('title', '') if input_tag else ""
            if not opt_full:
                label = r.find('span', class_='hdq_aria_label')
                if label: opt_full = label.get_text(separator='\n', strip=True)
                
            if not opt_full: continue
                
            match = re.match(r'^([A-E])\)\s*(.*)', opt_full, re.DOTALL)
            if match:
                letter, text = match.groups()
            else:
                letter = chr(65 + len(opts))
                text = opt_full
            
            is_correct = 'hdq_correct_not_selected' in r.get('class', []) or 'hdq_correct' in r.get('class', [])
            if not is_correct and input_tag and input_tag.get('value') == '1':
                is_correct = True
                
            if is_correct: correct = letter
            opts.append({'letter': letter, 'text': text.strip(), 'isCorrect': is_correct})
            
        # Explanations are usually fake paywalls here, but let's extract them just in case they aren't
        explanation = ""
        after_text = b.find_next_sibling('div', class_='hdq_question_after_text')
        if after_text:
            explanation = after_text.get_text(separator='\n', strip=True)
            
        add_question(q_text, opts, correct, img_url, explanation)

    # FORMAT 3: Flat Table (<tr><td>)
    for td in soup.find_all('td'):
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
                not_match = re.search(r'(?:NOT|Açıklama)\s*:(.*)', h_text, re.IGNORECASE | re.DOTALL)
                if not_match:
                    explanation = not_match.group(1).strip()
                break
                
        if not correct:
            continue
            
        img = td.find('img')
        img_url = process_image(img['src'] if img else None)
        
        # Split by Cevap to avoid parsing options from the explanation
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
            
            add_question(q_text, opts, correct, img_url, explanation)

    # FORMAT 4: Sub-Header <h4>
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
        explanation = ""
        
        node = h4.find_next_sibling()
        while node:
            if node.name in ['h4', 'h3', 'div', 'table']:
                break
                
            if node.name == 'p':
                text = node.get_text(separator='\n', strip=True)
                if text.startswith('Cevap :') or text.startswith('Cevap:'):
                    match = re.search(r'Cevap\s*:\s*([A-E])', text, re.IGNORECASE)
                    if match:
                        correct = match.group(1).upper()
                    
                    not_match = re.search(r'(?:NOT|Açıklama)\s*:(.*)', text, re.IGNORECASE | re.DOTALL)
                    if not_match:
                        explanation = not_match.group(1).strip()
                    break
                    
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    match = re.match(r'^([A-E])\)\s*(.*)', line)
                    if match:
                        opts.append({'letter': match.group(1).upper(), 'text': match.group(2).strip(), 'isCorrect': False})
            
            node = node.find_next_sibling()
            
        if len(opts) > 0 and correct:
            for o in opts:
                if o['letter'] == correct: o['isCorrect'] = True
            
            # Try to grab explanation from the next sibling if it's there
            if not explanation and node and node.name == 'p':
                next_text = node.get_text(separator='\n', strip=True)
                if next_text.startswith('NOT') or next_text.startswith('Açıklama'):
                    explanation = next_text
            
            add_question(q_text, opts, correct, img_url, explanation)

    # FORMAT 5: PLAINTEXT FALLBACK
    plain_text = soup.get_text(separator='\n')
    blocks = re.split(r'\n\s*\n', plain_text)
    
    for block in blocks:
        block = block.strip()
        if not block: continue
        
        match = re.search(r'(?:Soru\s*\d+|\d+[\.\)])\s*(.*?)\n\s*A\)\s*(.*?)\n\s*B\)\s*(.*?)\n\s*C\)\s*(.*?)\n\s*D\)\s*(.*?)\n(?:E\)\s*(.*?)\n)?.*?Cevap\s*:\s*([A-E])(.*)', block, re.IGNORECASE | re.DOTALL)
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
            
            explanation = ""
            if match.group(8):
                tail = match.group(8).strip()
                if tail.startswith('NOT') or tail.startswith('Açıklama'):
                    explanation = tail
            
            add_question(q_text, opts, correct, None, explanation)

    return questions

def parse_file(filename, out_filename):
    print(f"[{filename}] Okunuyor...")
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
        
    questions = parse_html(html)
    
    # Advanced Fuzzy Deduplication & Merge
    final_questions = []
    duplicate_count = 0
    merged_explanations = 0
    
    for q in questions:
        norm_q = normalize_turkish(q['q'])
        
        is_duplicate = False
        duplicate_idx = -1
        
        for idx, fq in enumerate(final_questions):
            norm_fq = normalize_turkish(fq['questionText'])
            if abs(len(norm_q) - len(norm_fq)) <= 30:
                ratio = difflib.SequenceMatcher(None, norm_q, norm_fq).ratio()
                if ratio >= 0.90:
                    is_duplicate = True
                    duplicate_idx = idx
                    break
                
        if not is_duplicate:
            # Add new
            final_q = {
                'id': len(final_questions) + 1,
                'questionText': q['q'],
                'imageUrl': q['img'],
                'options': q['opts'],
                'correctAnswer': q['correct'],
                'explanation': q['explanation'] if q['explanation'] else ""
            }
            final_questions.append(final_q)
        else:
            duplicate_count += 1
            # MERGE LOGIC: If the duplicate has an explanation but the stored one doesn't, upgrade it!
            stored_q = final_questions[duplicate_idx]
            stored_has_real_expl = stored_q['explanation'] and len(stored_q['explanation']) > 0
            new_has_real_expl = q['explanation'] and len(q['explanation']) > 0
            
            if new_has_real_expl and not stored_has_real_expl:
                final_questions[duplicate_idx]['explanation'] = q['explanation']
                merged_explanations += 1
                
            # MERGE LOGIC: If the duplicate has an image but the stored one doesn't, upgrade it!
            if not stored_q['imageUrl'] and q['img']:
                final_questions[duplicate_idx]['imageUrl'] = q['img']
            
    out_path = os.path.join('src', 'data', 'courses', out_filename)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    return {
        'file': filename,
        'initial': len(questions),
        'duplicates': duplicate_count,
        'merged': merged_explanations,
        'final': len(final_questions)
    }

def main():
    if len(sys.argv) > 1:
        # Run specific files
        pairs = []
        # format: python parser.py file1.txt file1.json file2.txt file2.json
        for i in range(1, len(sys.argv), 2):
            if i+1 < len(sys.argv):
                pairs.append((sys.argv[i], sys.argv[i+1]))
    else:
        # Run all 7 files automatically
        pairs = [
            ('benzetimtxt.txt', 'benzetim.json'),
            ('bilgisistemleriprojeyonetimi.txt', 'bilgisistemleriprojeyonetimi.json'),
            ('hukukuntemelkavramlarifinal.txt', 'hukukuntemelkavramlarifinal.json'),
            ('hukukuntemelkavramlaributunleme.txt', 'hukukuntemelkavramlaributunleme.json'),
            ('veritabaniyonetimsistemleri.txt', 'veritabaniyonetimsistemleri.json'),
            ('bilgisayarorganizasyonu.txt', 'bilgisayarorganizasyonu.json'),
            ('bilimselarastirmateknikleri.txt', 'bilimselarastirmateknikleri.json'),
            ('buyukveri.txt', 'buyukveri.json')
        ]
        
    print(f"🚀 {len(pairs)} dosya üzerinde Eşzamanlı (Paralel) Evrensel Parser başlatılıyor...")
    start_time = time.time()
    
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = [executor.submit(parse_file, txt, json_out) for txt, json_out in pairs]
        
        for future in concurrent.futures.as_completed(futures):
            try:
                res = future.result()
                print(f"✅ [{res['file']}] Tamamlandı! İlk: {res['initial']} | Silinen Kopya: {res['duplicates']} | Birleştirilen Açıklama: {res['merged']} | SONUÇ: {res['final']}")
            except Exception as exc:
                print(f"❌ HATA: {exc}")
                
    print(f"⏱️ Toplam süre: {time.time() - start_time:.2f} saniye.")

if __name__ == '__main__':
    # Fix encoding issues for windows console
    sys.stdout.reconfigure(encoding='utf-8')
    main()
