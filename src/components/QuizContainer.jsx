import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle, Award, List } from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function QuizContainer({ courseId, courseTitle, testConfig, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import(`../data/courses/${courseId}.json`)
      .then((module) => {
        const data = [...module.default];
        const slice = data.slice(testConfig.startIndex, testConfig.endIndex);
        setQuestions(slice);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Sorular yüklenirken hata oluştu:", err);
        setIsLoading(false);
      });
  }, [courseId, testConfig]);

  const handleAnswer = (questionIndex, isCorrect, letter) => {
    if (isFinished) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        isCorrect,
        selectedLetter: letter
      }
    }));
  };

  const handleReveal = (questionIndex) => {
    if (isFinished) return;
    setRevealedQuestions(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const restartQuiz = () => {
    setUserAnswers({});
    setRevealedQuestions({});
    setIsFinished(false);
    setShowReport(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishQuiz = () => {
    setIsFinished(true);
    setShowReport(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToQuestion = (index) => {
    const el = document.getElementById(`question-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
          <ArrowLeft size={18} /> Testlere Dön
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // --- RESULTS SCREEN ---
  if (showReport) {
    const score = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const emptyCount = totalQuestions - answeredCount;
    const wrongCount = answeredCount - score;
    
    let message = "";
    if (percentage >= 80) message = "Harika iş çıkardın! 🎉 Konuyu çok iyi kavramışsın.";
    else if (percentage >= 50) message = "Tebrikler, ama eksiklerin var. Çözümleri inceleyerek hatalarını kapatabilirsin. 👍";
    else message = "Daha fazla pratik yapmalısın. Çözüm yollarını detaylıca okuman sana çok fayda sağlayacaktır. 💪";

    return (
      <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
        <div className="glass-panel results-container" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Award size={64} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sınav Tamamlandı!</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--success-bg)', borderRadius: '12px', border: '1px solid var(--success-color)', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{score}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Doğru</div>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--error-bg)', borderRadius: '12px', border: '1px solid var(--error-color)', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--error-color)' }}>{wrongCount}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Yanlış</div>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{emptyCount}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Boş</div>
            </div>
          </div>
          
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Başarı Oranı: %{percentage}</h3>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>{message}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setShowReport(false); }}>
              <List size={18} /> Tüm Soruları ve Çözümleri İncele
            </button>
            <button className="btn btn-outline" onClick={restartQuiz}>
              <RotateCcw size={18} /> Sınavı Sıfırla
            </button>
            <button className="btn btn-outline" onClick={onBack}>
              <ArrowLeft size={18} /> Testlere Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-layout">
      {/* Sticky Header with Breadcrumbs */}
      <div className="quiz-sticky-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onBack} title="Testlere Dön">
              <ArrowLeft size={18} /> 
            </button>
            <div className="breadcrumbs hide-mobile" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {courseTitle || courseId} / <strong>{testConfig.title}</strong>
            </div>
          </div>

          <div style={{ flex: 1, margin: '0 2rem', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span>İlerleme ({answeredCount}/{totalQuestions})</span>
              <span>%{Math.round(progressPercentage)}</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '8px' }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {isFinished ? (
              <button className="btn btn-primary" onClick={() => setShowReport(true)}>
                Raporu Görüntüle
              </button>
            ) : (
              <button className="btn btn-primary" onClick={finishQuiz}>
                Sınavı Bitir
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', gap: '2rem', marginTop: '100px', alignItems: 'flex-start' }}>
        
        {/* Soru Listesi (Yukarıdan Aşağı) */}
        <div className="questions-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {questions.map((q, idx) => (
            <QuestionCard 
              key={q.id}
              questionIndex={idx}
              question={q} 
              userAnswers={userAnswers}
              revealedQuestions={revealedQuestions}
              onAnswer={handleAnswer}
              onReveal={handleReveal}
              isFinished={isFinished}
            />
          ))}
          
          {/* En Altta Sınavı Bitir Butonu */}
          {!isFinished && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '5rem' }}>
              <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={finishQuiz}>
                Sınavı Bitir ve Raporu Gör <CheckCircle size={20} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          )}
        </div>

        {/* Sağ Taraf - Navigasyon Izgarası */}
        <div className="question-navigator glass-panel" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', textAlign: 'center' }}>Navigasyon</h3>
          <div className="navigator-grid">
            {questions.map((_, idx) => {
              const ans = userAnswers[idx];
              const isRevealed = revealedQuestions[idx] || isFinished;
              
              let statusClass = "nav-btn";
              
              if (ans) {
                statusClass += ans.isCorrect ? " correct" : " incorrect";
              } else if (isRevealed && !ans) {
                statusClass += " empty-revealed";
              }
              
              return (
                <button 
                  key={idx} 
                  className={statusClass}
                  onClick={() => scrollToQuestion(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
