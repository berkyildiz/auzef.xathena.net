const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const directoryPath = 'bilimselarastirmateknikleri';
const outputPath = 'src/data/courses/bilimselarastirmateknikleriyeni2.json';

async function processPdfs() {
    try {
        const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.pdf'));
        console.log(`Found ${files.length} PDFs.`);
        
        let allQuestions = [];
        let idCounter = 1;
        
        for (const file of files) {
            console.log(`Processing ${file}...`);
            const filePath = path.join(directoryPath, file);
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            
            const text = data.text;
            
            // Split the text roughly into blocks per question
            const blocks = text.split(/\n(?=\d+\))/);
            
            for (let block of blocks) {
                // Ignore headers/footers in the block if any
                const qMatch = block.match(/^\d+\)\s*(.*?)(?=A:)/s);
                const optMatch = block.match(/A:\s*(.*?)\s*B:\s*(.*?)\s*C:\s*(.*?)\s*D:\s*(.*?)\s*E:\s*(.*?)\s*Doğru Cevap:\s*([A-E])/s);
                
                if (qMatch && optMatch) {
                    const questionText = qMatch[1].trim().replace(/\s+/g, ' ');
                    
                    const optionsText = [
                        optMatch[1].trim().replace(/\s+/g, ' '),
                        optMatch[2].trim().replace(/\s+/g, ' '),
                        optMatch[3].trim().replace(/\s+/g, ' '),
                        optMatch[4].trim().replace(/\s+/g, ' '),
                        optMatch[5].trim().replace(/\s+/g, ' ')
                    ];
                    
                    const correctAnswerLetter = optMatch[6].trim();
                    
                    const optionsArray = ['A', 'B', 'C', 'D', 'E'].map((letter, i) => ({
                        letter: letter,
                        text: optionsText[i],
                        isCorrect: letter === correctAnswerLetter
                    }));
                    
                    allQuestions.push({
                        id: idCounter++,
                        questionText: questionText,
                        options: optionsArray,
                        correctAnswer: correctAnswerLetter,
                        imageUrl: null,
                        explanation: `**Doğru Cevap: ${optionsText[['A','B','C','D','E'].indexOf(correctAnswerLetter)]}**`
                    });
                }
            }
        }
        
        console.log(`Total questions extracted: ${allQuestions.length}`);
        
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
        
        console.log(`Unique questions after deduplication: ${uniqueQuestions.length}`);
        
        // Re-index IDs
        uniqueQuestions.forEach((q, idx) => {
            q.id = idx + 1;
        });
        
        fs.writeFileSync(outputPath, JSON.stringify(uniqueQuestions, null, 2), 'utf8');
        console.log(`Saved to ${outputPath}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

processPdfs();
