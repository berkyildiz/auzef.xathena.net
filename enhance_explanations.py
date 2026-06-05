import json
import re

def enhance_explanations(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    for q in questions:
        q_text = q['questionText'].lower()
        correct_letter = q['correctAnswer']
        correct_opt = next((o['text'] for o in q['options'] if o['letter'] == correct_letter), "")
        c_text = correct_opt.lower()
        
        explanation = f"**Doğru Cevap: {correct_opt}**\n\n"
        
        # Enhanced heuristic logic
        if "statik" in q_text and "dinamik" in q_text:
            explanation += "Statik sistemler zamanla durumları değişmeyen (örneğin Güneş Sistemi'nin yapısı), dinamik sistemler ise girdi ve çıktıları zamanla farklılaşan süreçler içeren (örneğin Sindirim Sistemi) sistemlerdir. Bu yüzden Güneş Sistemi - Sindirim Sistemi ikilisi statik-dinamik eşleşmesi için klasik bir örnektir."
        elif "output analyzer" in q_text and "karşılaştırılması" in q_text:
            explanation += "Arena veya AutoStat gibi benzetim yazılımlarında Output Analyzer kullanıldığında, iki veya daha fazla alternatif senaryonun performans ortalamalarını istatistiksel (ANOVA vb. temelli) olarak karşılaştırmak için 'Compare Means' (Ortalamaları Karşılaştır) aracı kullanılır."
        elif "güven aralığı" in q_text and "en kötü durum hatası" in q_text:
            explanation += "Model geçerliliği testlerinde, eğer en iyi durum hatası veya en kötü durum hatası istenen epsilon (hata payı) değerinden büyükse, sistemin gerçek değeri ile modelin tahmini değeri arasında istatistiksel bir fark olup olmadığı anlaşılamaz. Bu durumda modelin iyileştirilmesi veya daha fazla simülasyon (replikasyon) çalıştırılması gerekir."
        elif "uzun çalışma" in q_text:
            explanation += "Çok sayıda kısa çalışma (replikasyon) yapmak yerine tek bir uzun çalıştırma yapmanın temel avantajı, sistemin kararlı (steady-state) duruma gelmesini beklediğimiz 'ısınma süresinin' (warm-up period) her replikasyon için defalarca atılmak zorunda kalınmamasıdır. Tek uzun çalışmada ısınma süresi sadece bir kez silinir."
        elif "weibull" in c_text or ("makine" in q_text and "kullanım" in q_text):
            explanation += "Güvenilirlik (Reliability) mühendisliğinde ve makine arızaları/tamir süreleri gibi durumların benzetiminde en çok 'Weibull Dağılımı' kullanılır. Çünkü Weibull, hata oranının zamanla artmasını, azalmasını veya sabit kalmasını tek bir dağılım çatısı altında çok esnek bir şekilde modelleyebilir."
        elif "halt" in c_text and ("arıza" in q_text or "devre dışı" in q_text):
            explanation += "Arena yazılımında bir makinenin, kaynağın (Resource) veya taşıyıcının bilinçli olarak arızalanmasını veya sistemden tamamen devre dışı bırakılmasını simüle etmek için HALT bloğu/modülü kullanılır."
        elif "oto yıkama" in q_text or "yıkama alanı" in q_text:
            explanation += "Bu bir klasik kuyruk teorisi problemidir. Araçlar 4 dakikada yıkanıyorsa ve 2 yıkama alanı varsa, ilk iki araç hemen yıkanmaya başlar (0-4 dk). Gelen 3. ve 4. araçlar ise sıraya girer. Sistemin çalışma süresi hesaplanarak müşterinin ayrılma zamanı basit toplama işlemleriyle bulunur."
        elif "fifo" in q_text or "lifo" in q_text or "attribute value" in c_text:
            explanation += "Kuyruk disiplinlerinde (Queueing rules) varlıklara (Entities) atanan belirli bir özelliğin (Attribute) değerine göre sıralama yapılabilir. En küçük değere sahip olan varlığın önce işleme alınması durumu 'Lowest Attribute Value (First)' olarak adlandırılır."
        elif "constant" in c_text and "sabit 10 dk" in q_text:
            explanation += "Müşterilerin gelişleri veya işlem süreleri kesin bir sabit sayıya dayanıyorsa (örneğin tam 10 dakika), bu sistemde herhangi bir varyans yoktur. Bu nedenle simülasyon modelinde 'Constant-10-Minutes' parametresi seçilmelidir."
        elif "number busy" in c_text:
            explanation += "Arena Resources (Kaynaklar) istatistik raporunda, incelenen süreç boyunca kaynağın ne kadar meşgul kaldığını ölçmek için Number Busy veya Scheduled Utilization verilerine bakılır. O an çalışan meşgul birim sayısı direkt 'NUMBER BUSY' ile gösterilir."
        elif "sabitlendiğinde" in c_text:
            explanation += "Sonsuz ufuklu (Infinite-horizon) simülasyonlarda sistem kararlı (steady-state) hale gelene kadar simülasyon çalıştırılır. Bu durum, ilgilenilen istatistiklerin varyansının azalması ve sonuçların belirli bir dengeye ulaşması (sabitlenmesi) ile anlaşılır."
        elif "hull-dobell" in q_text:
            explanation += "Hull-Dobell teoremi, bir Doğrusal Eşlik (Linear Congruential) Rastgele Sayı Üretecinde tam periyot (maksimum farklı sayı döngüsü) elde etmek için gereken şartları belirler. Bunlardan biri de 'b' değerinin m'in asal çarpanlarıyla ilişkili kurallara uymasıdır."
        elif "kararlı" in q_text or "ufuklu" in c_text:
            explanation += "Eğer bir sistemin doğal bir başlangıcı ve bitişi varsa (örneğin sabah açılıp akşam kapanan bir banka veya fabrika vardiyası) buna sonlu ufuklu (terminating) simülasyon denir. Doğal bir bitişi olmayan, sürekli çalışan sistemler ise sonsuz ufuklu simülasyonlarla incelenir."
        else:
            explanation += "Bu problem, benzetim (simülasyon) teorisinde standart sistem yapıları veya ihtimal dağılımlarına dayanmaktadır. Simülasyon modeli kurgulanırken girdi verilerinin uygun bir istatistiksel dağılıma oturtulması veya kuyruk disiplini kurallarının doğru atanması gerekir. Çözüm, bu kurallara veya formüllere doğrudan karşılık gelmektedir."
            
        q['explanation'] = explanation

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    enhance_explanations("src/data/courses/benzetim.json")
    print("Explanations enhanced successfully!")
