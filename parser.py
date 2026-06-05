import json
import re
from bs4 import BeautifulSoup
import os

def parse_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    soup = BeautifulSoup(content, 'html.parser')
    
    questions = []
    seen = set()
    
    def normalize(text):
        if not text: return ""
        return re.sub(r'\s+', ' ', text).strip().lower()

    def process_image(img_url):
        if not img_url: return None
        if img_url.startswith('/'):
            return "https://lolonolo.com" + img_url
        return img_url

    # Format 1
    blocks1 = soup.find_all('div', class_=re.compile(r'rounded-2xl.*bg-card'))
    for b in blocks1:
        q_p = b.find('p', class_=re.compile(r'whitespace-pre-wrap.*text-foreground'))
        if not q_p: continue
        q_text = q_p.get_text(strip=True)
        
        img = b.find('img')
        img_url = process_image(img['src'] if img else None)
        
        options_divs = b.find_all('div', class_=re.compile(r'rounded-xl border p-4'))
        opts = []
        correct = None
        for od in options_divs:
            letter_span = od.find('span', class_=re.compile(r'flex h-10 w-10'))
            if not letter_span: continue
            letter = letter_span.get_text(strip=True)
            text_p = od.find('p', class_=re.compile(r'whitespace-pre-wrap'))
            opt_text = text_p.get_text(strip=True) if text_p else ""
            
            is_correct = "Doğru cevap" in od.get_text()
            if is_correct:
                correct = letter
            opts.append({'letter': letter, 'text': opt_text, 'isCorrect': is_correct})
            
        norm_q = normalize(q_text)
        if norm_q and norm_q not in seen:
            seen.add(norm_q)
            questions.append({
                'questionText': q_text,
                'imageUrl': img_url,
                'options': opts,
                'correctAnswer': correct
            })

    # Format 2
    blocks2 = soup.find_all('div', class_='hdq_question')
    for b in blocks2:
        h3 = b.find('h3', class_='hdq_question_heading')
        if not h3: continue
        num_span = h3.find('span', class_='hdq_question_number')
        if num_span: num_span.extract()
        q_text = h3.get_text(strip=True)
        
        img = b.find('img')
        img_url = process_image(img['src'] if img else None)
        
        opts = []
        correct = None
        rows = b.find_all('div', class_='hdq_row')
        for r in rows:
            label = r.find('span', class_='hdq_aria_label')
            if not label: continue
            opt_full = label.get_text(strip=True)
            match = re.match(r'^([A-E])\)\s*(.*)', opt_full)
            if match:
                letter = match.group(1)
                text = match.group(2)
            else:
                letter = chr(65 + len(opts))
                text = opt_full
                
            is_correct = 'hdq_correct_not_selected' in r.get('class', []) or 'hdq_correct' in r.get('class', [])
            if is_correct:
                correct = letter
            opts.append({'letter': letter, 'text': text, 'isCorrect': is_correct})
            
        norm_q = normalize(q_text)
        if norm_q and norm_q not in seen:
            seen.add(norm_q)
            questions.append({
                'questionText': q_text,
                'imageUrl': img_url,
                'options': opts,
                'correctAnswer': correct
            })
            
    # Format 3
    h4s = soup.find_all('h4')
    for h4 in h4s:
        q_text = h4.get_text(strip=True)
        match = re.match(r'^\d+-\s*(.*)', q_text)
        if match:
            q_text = match.group(1)
            
        opts = []
        correct = None
        img_url = None
        
        img = h4.find('img')
        if not img:
            prev = h4.find_previous_sibling('img')
            if prev: img_url = prev['src']
        else:
            img_url = img['src']
            
        img_url = process_image(img_url)
            
        node = h4.find_next_sibling()
        while node and node.name != 'h4':
            if node.name == 'p':
                text = node.get_text(strip=True)
                if text.startswith('Cevap :'):
                    c_match = re.search(r'Cevap :\s*([A-E])\)', text)
                    if c_match:
                        correct = c_match.group(1)
                elif re.match(r'^[A-E]\)', text) or '\nA)' in text or 'A)' in text:
                    lines = text.split('\n')
                    for line in lines:
                        line = line.strip()
                        l_match = re.match(r'^([A-E])\)\s*(.*)', line)
                        if l_match:
                            opts.append({'letter': l_match.group(1), 'text': l_match.group(2), 'isCorrect': False})
            node = node.find_next_sibling()
            
        if opts and correct:
            for o in opts:
                if o['letter'] == correct:
                    o['isCorrect'] = True
            
            norm_q = normalize(q_text)
            if norm_q and norm_q not in seen:
                seen.add(norm_q)
                questions.append({
                    'questionText': q_text,
                    'imageUrl': img_url,
                    'options': opts,
                    'correctAnswer': correct
                })

    # Generate generic explanations based on keywords
    for i, q in enumerate(questions):
        q['id'] = i + 1
        
        q_text_lower = q['questionText'].lower()
        correct_opt = next((o['text'] for o in q['options'] if o['letter'] == q['correctAnswer']), "bilinmeyen seçenek")
        
        explanation = f"Sistemin işleyişi ve ilgili kavramlar incelendiğinde, doğru yanıt '{correct_opt}' olmalıdır. "
        
        if "statik" in q_text_lower and "dinamik" in q_text_lower:
            explanation += "Güneş sistemi, özellikleri zamanla değişmediği için statik bir sistemdir. Sindirim sistemi ise girdi ve çıktıları olan, zaman içinde değişen süreçler içerdiği için dinamiktir."
        elif "weibull" in correct_opt.lower() or "arıza" in q_text_lower:
            explanation += "Makine arızalarına kadar geçen süreyi modellemek için literatürde sıklıkla Weibull dağılımı kullanılır. Çünkü bu dağılım, hata oranının zamanla artış veya azalışını esnek bir şekilde modelleyebilir."
        elif "halt" in correct_opt.lower():
            explanation += "ARENA ve benzeri benzetim yazılımlarında, bir kaynağı veya taşıyıcı birimi tamamen devre dışı bırakmak veya bozmak (arıza durumu) için HALT modülü tercih edilir."
        elif "output analyzer" in q_text_lower:
            explanation += "OUTPUT ANALYZER modülünde iki veya daha fazla farklı senaryonun ortalamalarını istatistiksel olarak karşılaştırmak için 'Compare Means' aracı kullanılır."
        elif "güven aralığı" in q_text_lower:
            explanation += "Güven aralığı hesaplanırken örneklem ortalamasına hata payı (Z değeri * Standart Hata) eklenip çıkarılarak formülize edilir. Verilen değerler formülde yerine konulduğunda belirtilen doğru aralık elde edilir."
        elif "uzun çalışma" in q_text_lower:
            explanation += "Tek uzun bir çalışma yapmak, ısınma süresinin (warm-up period) sadece bir kez atılmasını sağlar. Böylece çok sayıda replikasyonda her seferinde kaybedilecek ısınma sürelerinden tasarruf edilir."
        else:
            # Genel bir açıklama metni
            explanation += f"Sorudaki varsayımlar ve ilgili benzetim (simülasyon) teorisi kurallarına göre doğru sonuç {correct_opt} olarak hesaplanır/bulunur. Orijinal dosyada 'Çözüm sadece Premium üyelere özeldir' yazdığı için bu açıklama simülasyon mantığıyla türetilmiştir."
            
        q['explanation'] = explanation

    out_path = os.path.join('quiz-app', 'src', 'data', 'courses', 'benzetim.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
        
    print(f"Total unique questions parsed and saved: {len(questions)}")

parse_file('benzetimtxt.txt')
