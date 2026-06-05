import { CheckCircle, XCircle, Lightbulb, Eye } from 'lucide-react';

export default function QuestionCard({ 
  question, 
  questionIndex, 
  userAnswers, 
  revealedQuestions,
  onAnswer, 
  onReveal,
  isFinished 
}) {
  const answerData = userAnswers[questionIndex];
  const hasAnswered = !!answerData;
  const isRevealed = revealedQuestions[questionIndex] || isFinished;
  const selectedOption = answerData?.selectedLetter;

  const handleOptionClick = (letter) => {
    // Eğer cevaplanmışsa veya sırrı çözülmüşse (revealed) tıklamayı engelle
    if (hasAnswered || isRevealed) return;
    
    const isCorrect = letter === question.correctAnswer;
    onAnswer(questionIndex, isCorrect, letter);
  };

  // Kartın genel durumu için border class belirleme
  let cardBorderClass = '';
  if (hasAnswered) {
    cardBorderClass = answerData.isCorrect ? 'correct-border' : 'incorrect-border';
  } else if (isRevealed) {
    cardBorderClass = 'revealed-border'; // boş bırakılıp cevabı gösterilmiş
  }

  return (
    <div id={`question-${questionIndex}`} className={`glass-panel animate-fade-in ${cardBorderClass}`} style={{ padding: '2rem', marginBottom: '1rem', width: '100%', scrollMarginTop: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Soru {questionIndex + 1}</h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {hasAnswered && (
            <span style={{ fontWeight: 'bold', color: answerData.isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>
              {answerData.isCorrect ? 'Doğru Bildin' : 'Yanlış Bildin'}
            </span>
          )}
          
          {!hasAnswered && isRevealed && (
            <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              Boş Bırakıldı
            </span>
          )}

          {!hasAnswered && !isRevealed && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
              onClick={() => onReveal(questionIndex)}
              title="Cevabı ve Çözümü Göster"
            >
              <Eye size={16} /> Çözümü Göster
            </button>
          )}
        </div>
      </div>

      {question.imageUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img 
            src={question.imageUrl} 
            alt={`Soru ${questionIndex + 1} görseli`} 
            className="question-image" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      
      <h2 className="question-text" style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{question.questionText}</h2>
      
      <div className="options-grid">
        {question.options.map((option) => {
          let optionClass = "option-card";
          
          // Eğer cevaplandıysa veya açıklandıysa etkileşimi kapat
          if (hasAnswered || isRevealed) {
            optionClass += " disabled";
            
            if (option.letter === question.correctAnswer) {
              optionClass += " correct";
            } else if (hasAnswered && option.letter === selectedOption && selectedOption !== question.correctAnswer) {
              optionClass += " incorrect";
            }
          }

          return (
            <div 
              key={option.letter} 
              className={optionClass}
              onClick={() => handleOptionClick(option.letter)}
            >
              <div className="option-letter">{option.letter}</div>
              <div style={{ flex: 1, fontSize: '1rem' }}>{option.text}</div>
              
              {(hasAnswered || isRevealed) && option.letter === question.correctAnswer && (
                <CheckCircle size={20} className="animate-fade-in" style={{ color: 'var(--success-color)' }} />
              )}
              {hasAnswered && option.letter === selectedOption && selectedOption !== question.correctAnswer && (
                <XCircle size={20} className="animate-fade-in" style={{ color: 'var(--error-color)' }} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Explanation Box appears if answered OR revealed */}
      {(hasAnswered || isRevealed) && (
        <div className="explanation-box animate-fade-in" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>
            <Lightbulb size={20} />
            <h4 style={{ margin: 0 }}>Çözüm ve Açıklama</h4>
          </div>
          <p style={{ lineHeight: '1.6', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap' }}>
            {question.explanation || 'Bu soru için henüz detaylı çözüm yolu eklenmemiş. Doğru cevap: ' + question.correctAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
