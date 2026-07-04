const fs = require('fs');
const cheerio = require('cheerio');

const txtPath = 'bilimselarastirmateknikleri.txt';
const jsonPath = 'src/data/courses/bilimselarastirmateknikleriyeni.json';

const htmlContent = fs.readFileSync(txtPath, 'utf8');
const $ = cheerio.load(htmlContent);

let existingQuestions = [];
if (fs.existsSync(jsonPath)) {
    existingQuestions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

let newQuestions = [];

$('.hdq_question').each((i, el) => {
    const questionHeading = $(el).find('.hdq_question_heading');
    // Remove the span containing the question number
    questionHeading.find('.hdq_question_number').remove();
    let questionText = questionHeading.text().trim();
    
    // Clean up text
    questionText = questionText.replace(/\s+/g, ' ');
    if (questionText.startsWith('&nbsp;')) {
        questionText = questionText.replace(/^&nbsp;\s*/, '');
    }
    
    let optionsArray = [];
    let correctAnswerLetter = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];
    
    $(el).find('.hdq_row').each((j, rowEl) => {
        if (j >= 5) return;
        const optionLabel = $(rowEl).find('.hdq_aria_label').text().trim().replace(/\s+/g, ' ');
        const isCorrect = $(rowEl).hasClass('hdq_correct_not_selected') || $(rowEl).find('input[type="checkbox"]').attr('value') === '1';
        
        optionsArray.push({
            letter: letters[j],
            text: optionLabel,
            isCorrect: isCorrect
        });
        
        if (isCorrect) {
            correctAnswerLetter = letters[j];
        }
    });
    
    if (questionText && optionsArray.length > 0) {
        newQuestions.push({
            questionText: questionText,
            options: optionsArray,
            correctAnswer: correctAnswerLetter,
            imageUrl: null,
            explanation: `**Doğru Cevap: ${optionsArray.find(o => o.isCorrect)?.text}**`
        });
    }
});

console.log(`Extracted ${newQuestions.length} questions from txt file.`);

const allQuestions = [...existingQuestions, ...newQuestions];

// Deduplicate
const seen = new Set();
const uniqueQuestions = [];

for (const q of allQuestions) {
    let normalizedText = q.questionText.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, '');
    if (!seen.has(normalizedText)) {
        seen.add(normalizedText);
        uniqueQuestions.push(q);
    }
}

console.log(`Unique questions after deduplication: ${uniqueQuestions.length} (was ${existingQuestions.length} originally)`);

// Re-index IDs
uniqueQuestions.forEach((q, idx) => {
    q.id = idx + 1;
});

fs.writeFileSync(jsonPath, JSON.stringify(uniqueQuestions, null, 2), 'utf8');
console.log(`Saved to ${jsonPath}`);
