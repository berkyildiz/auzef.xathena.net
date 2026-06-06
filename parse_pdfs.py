import os
import fitz  # PyMuPDF
import re
import json
import uuid
from difflib import SequenceMatcher

def is_duplicate(q1, q2, threshold=0.90):
    return SequenceMatcher(None, q1.lower(), q2.lower()).ratio() > threshold

def parse_all_pdfs():
    folder_path = "bilimselarastirmateknikleri"
    output_file = "src/data/courses/bilimselarastirmateknikleri.json"
    
    if not os.path.exists(folder_path):
        print(f"Directory {folder_path} does not exist.")
        return
        
    pdf_files = [f for f in os.listdir(folder_path) if f.endswith('.pdf')]
    
    all_raw_questions = []
    
    for pdf_file in pdf_files:
        filepath = os.path.join(folder_path, pdf_file)
        doc = fitz.open(filepath)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        
        lines = text.split('\n')
        curr_q = ""
        curr_opts = []
        curr_opt_letter = None
        curr_opt_text = ""
        state = "SEARCH"

        for line in lines:
            line = line.strip()
            if not line: continue
            
            # Check for question start
            m = re.match(r'^(\d+)\)\s*(.*)', line)
            if m and state in ["SEARCH", "DONE"]:
                state = "IN_Q"
                curr_q = m.group(2)
                curr_opts = []
                curr_opt_letter = None
                curr_opt_text = ""
                continue
                
            if state == "IN_Q":
                m_opt = re.match(r'^([A-E]):\s*(.*)', line)
                if m_opt:
                    state = "IN_OPTS"
                    curr_opt_letter = m_opt.group(1)
                    curr_opt_text = m_opt.group(2)
                else:
                    curr_q += " " + line
                    
            elif state == "IN_OPTS":
                m_ans = re.match(r'^Doğru Cevap:\s*([A-E])', line)
                if m_ans:
                    if curr_opt_letter:
                        curr_opts.append({'letter': curr_opt_letter, 'text': curr_opt_text.strip(), 'isCorrect': False})
                        
                    # Set the correct option
                    correct_ans = m_ans.group(1)
                    for opt in curr_opts:
                        if opt['letter'] == correct_ans:
                            opt['isCorrect'] = True
                            
                    # Clean question text
                    clean_q = curr_q.strip()
                    if clean_q and len(curr_opts) > 0:
                        all_raw_questions.append({
                            "questionText": clean_q,
                            "options": curr_opts,
                            "correctAnswer": correct_ans,
                            "imageUrl": None
                        })
                    state = "SEARCH"
                else:
                    m_opt = re.match(r'^([A-E]):\s*(.*)', line)
                    if m_opt:
                        if curr_opt_letter:
                            curr_opts.append({'letter': curr_opt_letter, 'text': curr_opt_text.strip(), 'isCorrect': False})
                        curr_opt_letter = m_opt.group(1)
                        curr_opt_text = m_opt.group(2)
                    else:
                        curr_opt_text += " " + line
                        
    print(f"Extracted {len(all_raw_questions)} raw questions from {len(pdf_files)} PDFs.")
    
    # Deduplicate
    unique_questions = []
    duplicates_removed = 0
    
    for rq in all_raw_questions:
        is_dup = False
        for uq in unique_questions:
            if is_duplicate(rq["questionText"], uq["questionText"]):
                is_dup = True
                duplicates_removed += 1
                break
        if not is_dup:
            rq["id"] = str(uuid.uuid4())
            unique_questions.append(rq)
            
    print(f"Duplicates removed: {duplicates_removed}")
    print(f"Final unique questions: {len(unique_questions)}")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(unique_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    parse_all_pdfs()
