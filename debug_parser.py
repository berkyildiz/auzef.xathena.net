import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

def debug(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for i, q in enumerate(data):
        opts_len = len(q.get('options', []))
        if opts_len != 5:
            print(f"Question {i+1} has {opts_len} options: {q['questionText'][:50]}...")

if __name__ == '__main__':
    debug('src/data/courses/bilgisistemleriprojeyonetimi.json')
    debug('src/data/courses/benzetim.json')
