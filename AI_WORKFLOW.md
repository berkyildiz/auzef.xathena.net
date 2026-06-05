# 🚀 AI Yeni Ders Ekleme Otomasyonu (AI Workflow)

Bu belge, sisteme yeni bir çıkmış soru/ders `.txt` dosyası yüklendiğinde, AI asistanının manuel hiçbir prompt'a ihtiyaç duymadan **otomatik** olarak hangi adımları izlemesi gerektiğini tanımlar.

Eğer kullanıcı projeye `[ders_id].txt` adında yeni bir dosya yüklerse (veya doğrudan sürükleyip bırakırsa), AI Asistanı aşağıdaki adımları sırasıyla, **sormadan ve otonom bir şekilde** uygulamakla yükümlüdür:

## 🔄 Standart İşlem Adımları

### Adım 1: Veri Ayrıştırma (Parsing)
Yeni gelen `[ders_id].txt` dosyası için güncel ve hatasız `parser.py` script'ini kullanarak ham HTML kodlarını temiz bir JSON formatına dönüştür.
- **Çalıştırılacak Komut:** 
  `python parser.py [ders_id].txt [ders_id].json`
- *Not: Bu script, bozuk HTML etiketlerini ve tek şıklı çöpleri otomatik filtreler, JSON dosyasını doğrudan `src/data/courses/` içine kaydeder.*

### Adım 2: Çözüm Zenginleştirme (Enhancement)
Oluşturulan json dosyasının içine yapay zeka aracılığıyla dersin anahtar kelimelerine uygun çözümler ekle. Eklenecek çözümler için `enhance_explanations.py` veya ilgili derse ait bir enhancer script yazıp/çalıştırabilirsin.
- *İpucu: JSON formatında her sorunun `explanation` alanına mantıklı ve açıklayıcı metinler doldurulmalı.*

### Adım 3: Arayüze Ekleme (UI Update)
Kullanıcının ana sayfada bu dersi görüp seçebilmesi için React arayüzünü güncelle.
- **Hedef Dosya:** `src/components/CourseSelector.jsx`
- **İşlem:** Dosyayı oku ve `COURSES` dizisinin sonuna yeni dersin konfigürasyonunu ekle. Renk (color) olarak uygulamanın genel temasına uygun, rastgele ancak şık bir HEX kodu belirle.
- **Örnek Obje:**
  ```javascript
  {
    id: '[ders_id]',
    title: '[Dersin Okunabilir Adı]',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: [Adım 1'de parser'dan çıkan soru sayısı],
    color: '#3b82f6'
  }
  ```

### Adım 4: Build, Commit & Push
Değişikliklerin canlı web sitesine (Coolify vb.) yansıması için standart dağıtım adımlarını tamamla.
- **Komut 1:** `npm run build` (Sözdizimi hatası veya React hatası var mı kontrol et)
- **Komut 2:** `git add .`
- **Komut 3:** `git commit -m "feat: add [ders_id] course with parsed questions"`
- **Komut 4:** `git push origin main`

### Adım 5: Kullanıcıya Rapor Verme
Tüm bu işlemler başarıyla bittiğinde, kullanıcıya ne kadar soru çıkarıldığını, hatalı/eksik şıklı kaç çöpe atılan soru olduğunu (parser çıktılarına bakarak) ve işlemin bittiğini kısa bir Türkçe özetle bildir. Ekstra uzun prompt'lara veya onaylara gerek yoktur.
