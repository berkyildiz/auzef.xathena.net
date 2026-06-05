import { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function QuestionCard({ question, onAnswer, onNext, isLastQuestion }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionClick = (letter) => {
    if (hasAnswered) return;
    
    setSelectedOption(letter);
    setHasAnswered(true);
    
    const isCorrect = letter === question.correctAnswer;
    onAnswer(isCorrect, letter);
  };

  const handleNextClick = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    onNext();
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      {question.imageUrl && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img 
            src={question.imageUrl} 
            alt="Soru görseli" 
            className="question-image" 
            onError={(e) => {
              e.target.style.display = 'none'; // Resim yüklenemezse gizle
            }}
          />
        </div>
      )}
      
      <h2 className="question-text">{question.questionText}</h2>
      
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
              <div style={{ flex: 1 }}>{option.text}</div>
              
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
      
      {hasAnswered && (
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleNextClick}>
            {isLastQuestion ? 'Sonuçları Gör' : 'Sıradaki Soru'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
