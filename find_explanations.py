from bs4 import BeautifulSoup

def explore(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    
    # Check Format 1 extra divs
    count = 0
    for b in soup.find_all('div', class_=lambda c: c and 'rounded-2xl' in c and 'bg-card' in c):
        # The last div inside usually contains "Bu soru boş bırakılmış." or an explanation
        divs = b.find_all('div', class_=lambda c: c and 'mt-4' in c and 'rounded-xl' in c)
        for d in divs:
            text = d.get_text(strip=True)
            if "Bu soru boş bırakılmış" not in text and "işaretlediğiniz" not in text.lower():
                print(f"[{filename}] Found potential explanation: {text}")
                count += 1
                if count > 5: break
        if count > 5: break

import glob
for f in glob.glob('*.txt'):
    explore(f)
