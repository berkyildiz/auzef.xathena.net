import json
import glob
import re

def normalize_turkish(text):
    if not text: return ""
    text = text.replace('I', 'ı').lower()
    text = text.replace('ç', 'c').replace('ğ', 'g').replace('ı', 'i').replace('ö', 'o').replace('ş', 's').replace('ü', 'u')
    text = re.sub(r'[^a-z0-9]', '', text)
    return text

def deduplicate():
    json_files = glob.glob('src/data/courses/*.json')
    for file_path in json_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except:
                print(f"Error reading {file_path}")
                continue
                
        seen_texts = set()
        new_data = []
        original_count = len(data)
        
        for q in data:
            q_text = q.get('questionText', '')
            norm_q = normalize_turkish(q_text)
            
            # Using exact match on normalized text
            if norm_q not in seen_texts:
                seen_texts.add(norm_q)
                # re-assign ID to be sequential
                q['id'] = len(new_data) + 1
                new_data.append(q)
                
        new_count = len(new_data)
        if new_count < original_count:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(new_data, f, ensure_ascii=False, indent=2)
            print(f"{file_path}: Removed {original_count - new_count} duplicates based on exact title match. New count: {new_count}")
        else:
            print(f"{file_path}: No exact title duplicates found. Count remains {new_count}")

if __name__ == '__main__':
    deduplicate()
