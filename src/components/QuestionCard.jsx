import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function QuestionCard({ question, questionIndex, userAnswers, onAnswer }) {
  const answerData = userAnswers[questionIndex];
  const hasAnswered = !!answerData;
  const selectedOption = answerData?.selectedLetter;

  const handleOptionClick = (letter) => {
    if (hasAnswered) return;
    const isCorrect = letter === question.correctAnswer;
    onAnswer(questionIndex, isCorrect, letter);
  };

  return (
    <div id={`question-${questionIndex}`} className={`glass-panel animate-fade-in ${hasAnswered ? (answerData.isCorrect ? 'correct-border' : 'incorrect-border') : ''}`} style={{ padding: '2rem', marginBottom: '2rem', scrollMarginTop: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Soru {questionIndex + 1}</h3>
        {hasAnswered && (
          <span style={{ fontWeight: 'bold', color: answerData.isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>
            {answerData.isCorrect ? 'Doğru Bildin' : 'Yanlış Bildin'}
          </span>
        )}
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
          
          if (hasAnswered) {
            optionClass += " disabled";
            if (option.letter === question.correctAnswer) {
              optionClass += " correct";
            } else if (option.letter === selectedOption && selectedOption !== question.correctAnswer) {
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
              
              {hasAnswered && option.letter === question.correctAnswer && (
                <CheckCircle size={20} className="animate-fade-in" style={{ color: 'var(--success-color)' }} />
              )}
              {hasAnswered && option.letter === selectedOption && selectedOption !== question.correctAnswer && (
                <XCircle size={20} className="animate-fade-in" style={{ color: 'var(--error-color)' }} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Explanation Box appears immediately after answering */}
      {hasAnswered && (
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
