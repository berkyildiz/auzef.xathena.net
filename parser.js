const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'benzetimtxt.txt');
const outputFile = path.join(__dirname, 'benzetim.json');

try {
  const content = fs.readFileSync(inputFile, 'utf-8');
  
  // Her sorunun bulunduğu ana div bloklarını regex ile yakalayalım
  // Başlangıç: <div class="rounded-2xl border p-4 sm:p-5 border-border bg-card">
  // Bitiş: Sonraki sorunun başlangıcına kadar veya benzeri bir mantık.
  // Daha basit bir yol: "Soru \d+" patterninden faydalanmak.
  
  const questionBlocks = content.split('<p class="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Soru ');
  
  // İlk eleman boş veya gereksiz (1. sorudan öncesi)
  questionBlocks.shift();

  const questions = [];
  const seenQuestionTexts = new Set();
  
  questionBlocks.forEach((block, index) => {
    try {
      // 1. Soru metnini bul (p etiketinde class="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-foreground sm:text-base")
      const questionTextMatch = block.match(/<p class="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-foreground sm:text-base">([\s\S]*?)<\/p>/);
      if (!questionTextMatch) return; // Soru metni yoksa atla
      
      let questionText = questionTextMatch[1].trim();
      
      // 2. Görsel varsa bul
      let imageUrl = null;
      const imgMatch = block.match(/<img[^>]*src="([^"]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
      
      // 3. Şıkları bul
      // Şıklar <div class="space-y-3"> içinde
      const optionsBlockMatch = block.match(/<div class="space-y-3">([\s\S]*?)<\/div>\s*<div class="mt-4/);
      let optionsStr = "";
      if (optionsBlockMatch) {
         optionsStr = optionsBlockMatch[1];
      } else {
         // Belki farklı bitiyordur, sadece space-y-3 altını arayalım
         const optStart = block.indexOf('<div class="space-y-3">');
         if (optStart !== -1) {
             optionsStr = block.substring(optStart);
         }
      }
      
      const optionMatches = [...optionsStr.matchAll(/<span class="flex h-10 w-10[^>]*>([A-E])<\/span>[\s\S]*?<p class="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">([\s\S]*?)<\/p>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)];
      
      const options = [];
      let correctAnswer = null;
      
      optionMatches.forEach(opt => {
        const letter = opt[1].trim();
        const text = opt[2].trim();
        const extraHtml = opt[3]; // Doğru cevap kontrolü için
        
        const isCorrect = extraHtml.includes('Doğru cevap');
        
        options.push({
          letter,
          text,
          isCorrect
        });
        
        if (isCorrect) {
          correctAnswer = letter;
        }
      });
      
      // Kopya kontrolü (Sorunun metni birebir aynı ise)
      const normalizedQuestion = questionText.replace(/\s+/g, ' ').toLowerCase();
      if (seenQuestionTexts.has(normalizedQuestion)) {
        return; // Bu soruyu atla, zaten eklendi
      }
      seenQuestionTexts.add(normalizedQuestion);
      
      // Veriyi kaydet
      questions.push({
        id: questions.length + 1,
        questionText,
        imageUrl,
        options,
        correctAnswer
      });
      
    } catch (e) {
      console.error("Hata oluştu Soru index:", index, e);
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`Tamamlandı. Toplam bulunan tekil (unique) soru sayısı: ${questions.length}`);
  
} catch (err) {
  console.error("Dosya okunurken hata oluştu:", err);
}
