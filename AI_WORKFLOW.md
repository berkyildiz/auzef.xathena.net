# 🚀 AI Kusursuz Ders Ekleme Otomasyonu (AI Workflow)

Bu belge, sisteme yeni bir çıkmış soru/ders `.txt` dosyası yüklendiğinde, AI asistanının manuel hiçbir prompt'a ihtiyaç duymadan **otomatik** olarak hangi adımları izlemesi gerektiğini tanımlar.

Eğer kullanıcı sadece `[ders_id].txt` ve `@[AI_WORKFLOW.md]` yazarsa, AI Asistanı aşağıdaki adımları sırasıyla, **sormadan ve otonom bir şekilde** uygulamakla yükümlüdür:

## 🔄 Standart İşlem Adımları

### Adım 1: Kayıpsız Ayrıştırma ve Fuzzy Deduplication (Parsing)
Yeni gelen `[ders_id].txt` dosyası için en gelişmiş `parser.py` script'ini çalıştır. Bu parser hem bozuk HTML etiketlerini, hem de düz metinleri (Regex Fallback) kayıpsız tarar. Ayrıca **%90 Fuzzy Deduplication** kullanarak ufak harf/noktalama hatası olan tüm kopyaları çöpe atar.
- **Çalıştırılacak Komut:** 
  `python parser.py [ders_id].txt [ders_id].json`
- *Not: JSON dosyası doğrudan `src/data/courses/` içine kaydedilecektir.*

### Adım 2: Yapay Zeka ile Çözüm Zenginleştirme (AI Enhancement)
Orijinal soru kaynaklarındaki çözümler genelde gizli ("Premium üyelere özel") olduğu için, oluşturulan json dosyasındaki sorulara doğrudan **Yapay Zeka (Gemini)** ile kusursuz açıklamalar üretilmelidir.
- **Çalıştırılacak Komut:**
  `python enhance_explanations.py src/data/courses/[ders_id].json`
- *Not: Bu script asenkron çalışarak tüm soruların `explanation` alanlarını saniyeler içinde mükemmel çözümlerle doldurur.*

### Adım 3: Arayüze Ekleme (UI Update)
Kullanıcının ana sayfada bu dersi görüp seçebilmesi için React arayüzünü (CourseSelector) güncelle.
- **Hedef Dosya:** `src/components/CourseSelector.jsx`
- **İşlem:** Dosyayı oku ve `COURSES` dizisinin sonuna yeni dersin konfigürasyonunu ekle.
- **Soru Sayısı:** `questionCount` değerine kesinlikle **Adım 1'de parser'ın çıktı verdiği nihai, eşsiz ve kusursuz soru sayısını** yaz! (Raw sayıyı veya duplicate sayısını değil).
- **Örnek Obje:**
  ```javascript
  {
    id: '[ders_id]',
    title: '[Dersin Okunabilir Adı]',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: [Nihai Kusursuz Soru Sayısı],
    color: '#ec4899' // Diğerlerine benzemeyen şık bir HEX kodu
  }
  ```

### Adım 4: Build, Commit & Push (Deployment)
Değişikliklerin canlı web sitesine (Coolify vb.) yansıması için standart dağıtım adımlarını tamamla. Tüm bu komutları tek bir satırda çalıştırabilirsin.
- **Komut:** 
  `npm run build ; git add . ; git commit -m "feat: parse [ders_id] flawlessly with fuzzy deduplication and AI explanations" ; git push origin main`

### Adım 5: Kullanıcıya Gururla Rapor Verme
Tüm bu işlemler başarıyla bittiğinde, kullanıcıya bir özet geç. Özette şunlar mutlaka bulunsun:
1. Dosyadan çıkan **Ham Soru Sayısı**
2. Fuzzy eşleştirme ile çöpe atılan **Kopya (Duplicate) Soru Sayısı**
3. Sisteme eklenen nihai **Kusursuz/Eşsiz Soru Sayısı**
4. AI çözümlerinin eklendiği ve sitenin canlıya (deploy) gönderildiği bilgisi.

Sadece bu belgeyi referans alıp işlemi baştan sona eksiksiz tamamla!
