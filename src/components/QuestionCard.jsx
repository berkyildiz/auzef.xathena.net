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
    if (hasAnswered || isRevealed) return;
    const isCorrect = letter === question.correctAnswer;
    onAnswer(questionIndex, isCorrect, letter);
  };

  let cardBorderClass = '';
  if (hasAnswered) {
    cardBorderClass = answerData.isCorrect ? 'correct-border' : 'incorrect-border';
  } else if (isRevealed) {
    cardBorderClass = 'revealed-border'; 
  }

  return (
    <div id={`question-${questionIndex}`} className={`glass-panel ${cardBorderClass}`} style={{ padding: '1.5rem', marginBottom: '1rem', width: '100%', scrollMarginTop: '80px', touchAction: 'manipulation' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.1rem' }}>Soru {questionIndex + 1}</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hasAnswered && (
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: answerData.isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>
              {answerData.isCorrect ? 'Doğru' : 'Yanlış'}
            </span>
          )}
          
          {!hasAnswered && isRevealed && (
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Boş Bırakıldı
            </span>
          )}

          {!hasAnswered && !isRevealed && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} 
              onClick={() => onReveal(questionIndex)}
            >
              <Eye size={14} /> Çözüm
            </button>
          )}
        </div>
      </div>

      {question.imageUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img 
            src={question.imageUrl} 
            alt={`Soru ${questionIndex + 1}`} 
            className="question-image" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      
      <h2 className="question-text" style={{ fontSize: '1.15rem', lineHeight: '1.5', marginBottom: '1.2rem' }}>{question.questionText}</h2>
      
      <div className="options-grid">
        {question.options.map((option) => {
          let optionClass = "option-card";
          
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
              style={{ padding: '0.8rem 1rem', touchAction: 'manipulation' }}
            >
              <div className="option-letter">{option.letter}</div>
              <div style={{ flex: 1, fontSize: '1rem' }}>{option.text}</div>
              
              {(hasAnswered || isRevealed) && option.letter === question.correctAnswer && (
                <CheckCircle size={18} style={{ color: 'var(--success-color)' }} />
              )}
              {hasAnswered && option.letter === selectedOption && selectedOption !== question.correctAnswer && (
                <XCircle size={18} style={{ color: 'var(--error-color)' }} />
              )}
            </div>
          );
        })}
      </div>
      
      {(hasAnswered || isRevealed) && (
        <div className="explanation-box" style={{ marginTop: '1.2rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            <Lightbulb size={18} />
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Çözüm ve Açıklama</h4>
          </div>
          <p style={{ lineHeight: '1.5', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap' }}>
            {question.explanation || 'Bu soru için henüz detaylı çözüm yolu eklenmemiş. Doğru cevap: ' + question.correctAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
