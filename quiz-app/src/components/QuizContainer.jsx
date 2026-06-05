import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, ListChecks } from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function QuizContainer({ courseId, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    import(`../data/courses/${courseId}.json`)
      .then((module) => {
        // Shuffle the questions
        const shuffled = [...module.default].sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Sorular yüklenirken hata oluştu:", err);
        setIsLoading(false);
      });
  }, [courseId]);

  const handleAnswer = (isCorrect, letter) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        isCorrect,
        selectedLetter: letter
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsFinished(false);
    setShowReview(false);
  };

  if (isLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Sorular Yükleniyor...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Henüz soru eklenmemiş.</h2>
        <button className="btn btn-outline" style={{ marginTop: '2rem' }} onClick={onBack}>
          <ArrowLeft size={18} /> Geri Dön
        </button>
      </div>
    );
  }

  // --- REVIEW MODE (Çözümleri İncele) ---
  if (showReview) {
    return (
      <div className="container animate-fade-in">
        <div className="quiz-header" style={{ marginBottom: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setShowReview(false)}>
            <ArrowLeft size={18} /> Sonuç Ekranına Dön
          </button>
          <h2>Tüm Çözümler</h2>
        </div>
        
        <div className="review-list">
          {questions.map((q, idx) => {
            const answerData = userAnswers[idx];
            const isCorrect = answerData?.isCorrect;
            const cardClass = isCorrect ? 'review-card correct-border' : 'review-card incorrect-border';
            
            return (
              <div key={q.id} className={`glass-panel ${cardClass}`} style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Soru {idx + 1}</span>
                  {isCorrect ? (
                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Doğru Bildin</span>
                  ) : (
                    <span style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>Yanlış Bildin</span>
                  )}
                </div>
                
                {q.imageUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img src={q.imageUrl} alt="Soru görseli" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{q.questionText}</h3>
                
                <div className="options-grid" style={{ marginBottom: '1.5rem' }}>
                  {q.options.map(opt => {
                    let style = { padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '0.5rem', opacity: 0.7 };
                    if (opt.letter === q.correctAnswer) {
                      style = { ...style, background: 'var(--success-bg)', borderColor: 'var(--success-color)', opacity: 1, fontWeight: 'bold' };
                    } else if (opt.letter === answerData?.selectedLetter) {
                      style = { ...style, background: 'var(--error-bg)', borderColor: 'var(--error-color)', opacity: 1 };
                    }
                    
                    return (
                      <div key={opt.letter} style={style}>
                        {opt.letter}) {opt.text}
                      </div>
                    );
                  })}
                </div>
                
                <div className="explanation-box animate-fade-in">
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Çözüm Yolu</h4>
                  <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{q.explanation || 'Bu soru için henüz bir çözüm yolu eklenmemiş.'}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={restartQuiz}>
            <RotateCcw size={18} /> Testi Yeniden Başlat
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN ---
  if (isFinished) {
    const score = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);
    
    let message = "";
    if (percentage >= 80) message = "Harika iş çıkardın! 🎉";
    else if (percentage >= 50) message = "Tebrikler, ama biraz daha çalışabilirsin. 👍";
    else message = "Daha fazla pratik yapmalısın. Çözümleri incelemek sana çok fayda sağlayacaktır. 💪";

    return (
      <div className="container animate-fade-in">
        <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={onBack}>
          <ArrowLeft size={18} /> Geri Dön
        </button>
        
        <div className="glass-panel results-container">
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Sınav Tamamlandı!</h2>
          
          <div className="score-circle">
            <div className="score-number">{score}</div>
            <div className="score-text">/ {questions.length} Doğru</div>
          </div>
          
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Başarı Oranı: %{percentage}</h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>{message}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setShowReview(true)}>
              <ListChecks size={18} /> Çözümleri İncele
            </button>
            <button className="btn btn-outline" onClick={restartQuiz}>
              <RotateCcw size={18} /> Tekrar Çöz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  return (
    <div className="container">
      <div className="quiz-header">
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={onBack}>
          <ArrowLeft size={18} /> Geri
        </button>
        <div style={{ textAlign: 'right' }}>
          <div className="quiz-progress">
            Soru {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>
      
      <div className="progress-bar-bg" style={{ marginBottom: '2rem' }}>
        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      <QuestionCard 
        key={currentQuestion.id}
        question={currentQuestion} 
        onAnswer={(isCorrect) => handleAnswer(isCorrect, currentQuestion.options.find(o => o.isCorrect === isCorrect || !isCorrect)?.letter)}
        onNext={handleNext}
        isLastQuestion={currentIndex === questions.length - 1}
      />
    </div>
  );
}
