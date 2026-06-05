import json
import re

def enhance_bspy(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    for q in questions:
        q_text = q['questionText'].lower()
        correct_letter = q['correctAnswer']
        correct_opt = next((o['text'] for o in q['options'] if o['letter'] == correct_letter), "")
        c_text = correct_opt.lower()
        
        explanation = f"**Doğru Cevap: {correct_opt}**\n\n"
        
        # Heuristics for Bilgi Sistemleri Proje Yönetimi
        if "yaşam döngüsü" in c_text and "maliyet" in q_text:
            explanation += "Yaşam döngüsü maliyeti, bir sistemin veya ürünün baştan sona (tasarım, üretim, işletim, bakım vb.) tüm ömrü boyunca ortaya çıkardığı maliyetleri kapsar. En düşük sahip olma maliyeti bu kavramla ölçülür."
        elif "delphi" in c_text or "delphi" in q_text:
            explanation += "Delphi tekniği, uzmanların birbirlerinden bağımsız ve anonim olarak görüş bildirdikleri, bir moderatör eşliğinde ortak bir tahmine veya karara varılmaya çalışıldığı nitel bir yöntemdir."
        elif "üç nokta" in c_text or "tahmini" in q_text and "süre" in q_text:
            explanation += "Üç nokta (PERT) tahmini tekniği, iyimser, kötümser ve en olası tahminlerin bir araya getirilerek daha güvenilir bir ortalama veya süre tahmini yapılmasını sağlar."
        elif "çevik" in q_text or "agile" in q_text:
            explanation += "Çevik (Agile) proje yönetimi, değişen gereksinimlere hızlı uyum sağlamayı, müşteri memnuniyetini ve iteratif/artan ürün teslimatını ön planda tutan bir yaklaşımdır."
        elif "gantt" in c_text or "grafiği" in q_text:
            explanation += "Gantt grafiği, proje faaliyetlerinin zaman içindeki planlamasını ve ilerlemesini görselleştiren çubuk grafiklerdir."
        elif "kapsam" in q_text and ("sürünmesi" in q_text or "kayması" in q_text):
            explanation += "Kapsam sürünmesi (Scope creep), bir projenin zaman, bütçe veya kaynak kısıtlarına dikkat edilmeden sürekli yeni özellikler eklenerek kapsamının denetimsizce genişlemesidir."
        elif "şelale" in q_text or "waterfall" in q_text:
            explanation += "Şelale (Waterfall) modeli, proje yaşam döngüsünün birbirini izleyen ardışık fazlardan oluştuğu, önceki aşama bitmeden diğerine geçilemeyen geleneksel bir yaklaşımdır."
        else:
            explanation += "Bu soru, bilgi sistemleri proje yönetimi standartları, PMI (Project Management Institute) prensipleri veya genel IT süreç yönetimi kavramlarına dayanmaktadır. İlgili konunun teorik temel yapısına göre en uygun adım, yöntem veya tanım seçilmiştir."
            
        q['explanation'] = explanation

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    enhance_bspy("src/data/courses/bilgisistemleriprojeyonetimi.json")
    print("BS Proje Yonetimi explanations enhanced successfully!")
