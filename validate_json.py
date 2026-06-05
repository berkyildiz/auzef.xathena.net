import json
import glob
import sys

def run_validation():
    for f in glob.glob('src/data/courses/*.json'):
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            print(f'\n--- {f} ---')
            for q in data:
                if len(q['questionText']) > 400:
                    print(f'LONG Q ({len(q["questionText"])} chars) [ID {q["id"]}]: {q["questionText"][:100]}...')
                if len(q['questionText']) < 15:
                    print(f'SHORT Q ({len(q["questionText"])} chars) [ID {q["id"]}]: {q["questionText"]}')
                for o in q['options']:
                    if len(o['text']) > 200:
                        print(f'LONG OPT ({len(o["text"])} chars) [ID {q["id"]}]: {o["text"][:100]}...')
                    if len(o['text']) < 2:
                        print(f'SHORT OPT ({len(o["text"])} chars) [ID {q["id"]}]: {o["text"]}')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    run_validation()
