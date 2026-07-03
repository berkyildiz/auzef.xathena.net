import fs from 'fs';
import path from 'path';

// Tüm .txt dosyalarını oku (çıktı dosyası hariç)
function readAllTxtFiles() {
    const files = fs.readdirSync(process.cwd());
    const txtFiles = files.filter(f => f.endsWith('.txt') && f !== 'temizlenmis_sorular.txt');
    
    if (txtFiles.length === 0) {
        console.log("HATA: Bulunulan klasörde hiç .txt dosyası bulunamadı.");
        console.log("Lütfen soruları kaydettiğiniz .txt dosyalarını bu klasöre koyun.");
        process.exit(1);
    }

    let combinedHTML = '';
    for (const file of txtFiles) {
        console.log(`Okunuyor: ${file}`);
        combinedHTML += fs.readFileSync(file, 'utf-8') + '\n';
    }
    return combinedHTML;
}

function parseAndClean() {
    const inputHTML = readAllTxtFiles();
    const parts = inputHTML.split('<div class="hdq_question"');
    
    if (parts.length <= 1) {
        console.log("Hiç soru bulunamadı. Lütfen .txt dosyalarının içeriğini kontrol edin.");
        return;
    }

    const seenQuestions = new Set();
    const cleanQuestions = [];
    let removedCount = 0;

    for (let i = 1; i < parts.length; i++) {
        const chunk = parts[i];
        
        // Soru metnini yakala
        // <h3> içindeki <span> (örn: #1.) kısmını atlayıp asıl soruyu alıyoruz
        const qMatch = chunk.match(/<h3 class="hdq_question_heading">(?:.*?<\/span>)?\s*(.*?)<\/h3>/s);
        if (!qMatch) continue;
        
        // Soru metnini temizle (HTML etiketlerini kaldır ve boşlukları düzenle)
        let questionText = qMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        
        // Kopya kontrolü
        if (seenQuestions.has(questionText)) {
            removedCount++;
            continue;
        }
        seenQuestions.add(questionText);

        // Şıkları yakala
        // <input ... title="A) ROM RAM" ... value="0" ...>
        const options = [];
        const inputRegex = /<input[^>]+class="[^"]*hdq_option[^"]*"[^>]+>/gs;
        let inputMatch;
        
        while ((inputMatch = inputRegex.exec(chunk)) !== null) {
            const inputTag = inputMatch[0];
            
            const titleMatch = inputTag.match(/title="([^"]+)"/);
            const valueMatch = inputTag.match(/value="([^"]+)"/);
            
            if (titleMatch) {
                const optionText = titleMatch[1].trim();
                const isCorrect = valueMatch && valueMatch[1] === "1";
                options.push({ text: optionText, isCorrect });
            }
        }

        // Eğer şık bulunamadıysa bile soruyu ekleyelim, formata uymayan istisnalar olabilir
        cleanQuestions.push({
            question: questionText,
            options: options
        });
    }

    // Temizlenmiş veriyi metin (TXT) formatında oluştur
    let outputText = "=== TEMİZLENMİŞ VE BİRLEŞTİRİLMİŞ SINAV SORULARI ===\n\n";
    let qIndex = 1;
    
    for (const item of cleanQuestions) {
        outputText += `Soru ${qIndex}: ${item.question}\n`;
        
        for (const opt of item.options) {
            if (opt.isCorrect) {
                outputText += `${opt.text}  <--- [DOĞRU CEVAP]\n`;
            } else {
                outputText += `${opt.text}\n`;
            }
        }
        outputText += `--------------------------------------------------\n\n`;
        qIndex++;
    }

    fs.writeFileSync('temizlenmis_sorular.txt', outputText, 'utf-8');
    
    console.log(`\nİşlem Başarıyla Tamamlandı!`);
    console.log(`Toplam Eşsiz Soru: ${cleanQuestions.length}`);
    console.log(`Silinen Kopya Soru: ${removedCount}`);
    console.log(`\nSonuçlar reklamsız, temiz ve net bir şekilde 'temizlenmis_sorular.txt' dosyasına kaydedildi.`);
}

parseAndClean();
