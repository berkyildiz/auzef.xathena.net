from bs4 import BeautifulSoup
import re

def test(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    
    q_count = 0
    for b in soup.find_all('div', class_='hdq_question'):
        q_count += 1
        opts = []
        for r in b.find_all('div', class_='hdq_row'):
            # Only count rows that belong to this specific question block directly
            if r.find_parent('div', class_='hdq_question') == b:
                opts.append(r)
        print(f"Question {q_count}: {len(opts)} options")

test('bilgisistemleriprojeyonetimi.txt')
