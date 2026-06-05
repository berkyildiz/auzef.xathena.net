import os
import sys
import json
import time
import google.generativeai as genai

# API Anahtarını Çek
api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_GENERATIVE_AI_API_KEY')
if not api_key:
    print("HATA: GEMINI_API_KEY environment variable bulunamadı!")
    sys.exit(1)

genai.configure(api_key=api_key)

# Modeli seç (hızlı ve maliyetsiz olan flash model)
model = genai.GenerativeModel('gemini-1.5-flash')

def enhance_with_ai(file_path):
    print(f"Reading file: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    total = len(questions)
    print(f"Total questions to process: {total}")
    
    modified = False

    for i, q in enumerate(questions):
        current_exp = q.get('explanation', '')
        if "Bu problem, benzetim (simülasyon) teorisinde" not in current_exp and len(current_exp) > 50 and "Bu problem," not in current_exp:
            continue
            
        q_text = q['questionText']
        correct_letter = q['correctAnswer']
        correct_opt = next((o['text'] for o in q['options'] if o['letter'] == correct_letter), "")
        
        options_text = "\n".join([f"{o['letter']}) {o['text']}" for o in q['options']])
        
        prompt = (
            f"Sen uzman bir üniversite profesörüsün.\n"
            f"Aşağıdaki soru için kısa, net ve anlaşılır bir çözüm/açıklama yaz.\n"
            f"Soru: {q_text}\n"
            f"Şıklar:\n{options_text}\n"
            f"Doğru Cevap: {correct_letter}) {correct_opt}\n\n"
            f"Görev: Öğrencinin bu soruyu anlaması için neden doğru cevabın '{correct_opt}' olduğunu açıklayan 2-3 cümlelik eğitici bir metin yaz.\n"
            f"Metnin en başına mutlaka '**Doğru Cevap: {correct_opt}**\\n\\n' ibaresini ekle. Gereksiz laf kalabalığı yapma, doğrudan odaklan."
        )

        for attempt in range(3):
            try:
                response = model.generate_content(prompt)
                if response.text:
                    q['explanation'] = response.text.strip()
                    modified = True
                    print(f"[{i+1}/{total}] Success: AI explanation created.")
                else:
                    print(f"[{i+1}/{total}] Warning: Empty response.")
                break
            except Exception as e:
                print(f"[{i+1}/{total}] ERROR on attempt {attempt+1}: {e}")
                if "429" in str(e) or "Quota exceeded" in str(e):
                    print("Rate limit hit. Sleeping for 10 seconds...")
                    time.sleep(10)
                else:
                    break
        
        time.sleep(4.5)
        
        if (i + 1) % 20 == 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print("Intermediate save completed.")

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"Done. File updated: {file_path}")
    else:
        print("No changes made. Explanations already exist.")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "src/data/courses/hukukuntemelkavramlari.json"
    enhance_with_ai(target_file)
