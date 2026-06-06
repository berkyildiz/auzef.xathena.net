import json
import random
import re
from bs4 import BeautifulSoup
import uuid

def create_special_json():
    input_file = "buyukveri2022-2023final.txt"
    output_file = "src/data/courses/buyukveri2022-2023final.json"
    
    with open(input_file, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    soup = BeautifulSoup(html_content, 'html.parser')
    
    qa_pairs = []
    
    for h4 in soup.find_all('h4'):
        # Extract question text and remove the numbering "1- "
        q_text = h4.get_text(separator='\n', strip=True)
        q_text = re.sub(r'^\d+[\.\-]\s*', '', q_text)
        
        # Find the next paragraph for the answer
        node = h4.find_next_sibling()
        ans_text = ""
        while node:
            if node.name == 'p' and (node.get_text().startswith('Cevap :') or node.get_text().startswith('Cevap:')):
                text = node.get_text(separator='\n', strip=True)
                match = re.search(r'Cevap\s*:\s*(.*)', text, re.IGNORECASE)
                if match:
                    ans_text = match.group(1).strip()
                break
            node = node.find_next_sibling()
            
        if q_text and ans_text:
            qa_pairs.append({
                "q": q_text,
                "a": ans_text
            })
            
    print(f"Extracted {len(qa_pairs)} question-answer pairs.")
    
    all_answers = [pair["a"] for pair in qa_pairs]
    
    final_questions = []
    
    for idx, pair in enumerate(qa_pairs):
        q = pair["q"]
        correct_ans = pair["a"]
        
        # Select 4 random distractors from other answers
        pool = [a for a in all_answers if a != correct_ans]
        random.shuffle(pool)
        distractors = pool[:4]
        
        # In case we don't have enough distractors
        while len(distractors) < 4:
            distractors.append(f"Çeldirici Yanıt {len(distractors)+1}")
            
        options_texts = [correct_ans] + distractors
        random.shuffle(options_texts)
        
        letters = ['A', 'B', 'C', 'D', 'E']
        opts = []
        correct_letter = 'A'
        
        for i, text in enumerate(options_texts):
            is_correct = (text == correct_ans)
            if is_correct:
                correct_letter = letters[i]
            opts.append({
                "letter": letters[i],
                "text": text,
                "isCorrect": is_correct
            })
            
        final_questions.append({
            "id": str(uuid.uuid4()),
            "questionText": q,
            "options": opts,
            "correctAnswer": correct_letter,
            "imageUrl": None,
            "explanation": f"**Doğru Cevap: {correct_ans}**\n\nBu sorunun şıkları orijinal kaynakta verilmediği için, diğer soruların cevapları kullanılarak Yapay Zeka tarafından akıllıca üretilmiştir."
        })
        
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {output_file} with {len(final_questions)} questions!")

if __name__ == "__main__":
    create_special_json()
