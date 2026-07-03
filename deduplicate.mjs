import fs from 'fs';

function removeDuplicates() {
    console.log("Reading input.html...");
    let inputHTML;
    try {
        inputHTML = fs.readFileSync('input.html', 'utf-8');
    } catch (e) {
        console.error("HATA: 'input.html' dosyası bulunamadı. Lütfen soruları bu dosyaya kopyalayın.");
        process.exit(1);
    }

    const parts = inputHTML.split('<div class="hdq_question"');
    
    if (parts.length <= 1) {
        console.log("Hiç soru bulunamadı. Lütfen input.html dosyasının içeriğini kontrol edin.");
        return;
    }

    let outputHTML = parts[0]; 
    const seenQuestions = new Set();
    let removedCount = 0;

    for (let i = 1; i < parts.length; i++) {
        const chunk = '<div class="hdq_question"' + parts[i];
        
        // Soru metnini yakalamak için Regex (Örn: #1. 'den sonraki kısım)
        const match = chunk.match(/<h3 class="hdq_question_heading">.*?<\/span>(.*?)<\/h3>/s);
        
        if (match) {
            // Soru metnini boşlukları normalize ederek al
            const questionText = match[1].trim().replace(/\s+/g, ' ');
            
            if (seenQuestions.has(questionText)) {
                // Kopya bulundu, atla
                removedCount++;
                console.log(`Kopya silindi: ${questionText.substring(0, 50)}...`);
                continue;
            } else {
                // Yeni soru, listeye ekle ve çıktıya yaz
                seenQuestions.add(questionText);
                outputHTML += chunk;
            }
        } else {
            // Beklenen yapıda değilse (hata olmaması için) doğrudan ekle
            outputHTML += chunk;
        }
    }

    fs.writeFileSync('output.html', outputHTML, 'utf-8');
    console.log(`\nİŞLEM TAMAMLANDI!`);
    console.log(`Toplam eşsiz soru sayısı: ${seenQuestions.size}`);
    console.log(`Silinen kopya soru sayısı: ${removedCount}`);
    console.log(`Sonuçlar 'output.html' dosyasına kaydedildi.`);
}

removeDuplicates();
