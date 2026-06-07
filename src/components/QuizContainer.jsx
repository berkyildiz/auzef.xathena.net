import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle, Award, Menu, X } from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function QuizContainer({ courseId, courseTitle, testConfig, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDrawerOpen]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishQuiz = () => {
    setIsFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToQuestion = (index) => {
    setIsDrawerOpen(false); // Otomatik kapat
    setTimeout(() => {
      const el = document.getElementById(`question-${index}`);
      if (el) {
        // Sticky header payı bırakarak kaydır (80px)
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loader">Sorular Yükleniyor...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
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

  const score = Object.values(userAnswers).filter(a => a.isCorrect).length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const emptyCount = totalQuestions - answeredCount;
  const wrongCount = answeredCount - score;

  return (
    <div className="quiz-layout" style={{ touchAction: 'manipulation' }}>
      {/* Global Top Edge Progress Bar */}
      <div className="global-progress-bg">
        <div className="global-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}></div>
      )}

      {/* Sticky Header with Breadcrumbs */}
      <div className="quiz-sticky-header">
        <div className="container header-container">
          
          <div className="header-left">
            <button className="btn btn-icon btn-outline" onClick={onBack} title="Testlere Dön" style={{ padding: '0.4rem' }}>
              <ArrowLeft size={20} /> 
            </button>
            <div className="breadcrumbs hide-mobile" style={{ fontSize: '0.9rem' }}>
              {courseTitle || courseId} / <strong>{testConfig.title}</strong>
            </div>
            <div className="mobile-title show-mobile" style={{ fontSize: '1rem' }}>
              {testConfig.title}
            </div>
          </div>

          <div className="header-center hide-mobile">
            <div className="progress-text">
              {isFinished ? (
                <span style={{ color: 'var(--success-color)' }}>Skor: %{percentage}</span>
              ) : (
                <>
                  <span>İlerleme ({answeredCount}/{totalQuestions})</span>
                  <span>%{Math.round(progressPercentage)}</span>
                </>
              )}
            </div>
          </div>

          <div className="header-right">
            {isFinished ? (
              <button className="btn btn-primary btn-sm" onClick={restartQuiz} style={{ padding: '0.4rem 0.8rem' }}>
                <span className="hide-mobile">Yeniden Başla</span>
                <RotateCcw className="show-mobile icon-only" size={18} />
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={finishQuiz} style={{ padding: '0.4rem 0.8rem' }}>
                <span className="hide-mobile">Sınavı Bitir</span>
                <CheckCircle className="show-mobile icon-only" size={18} />
              </button>
            )}
            
            {/* Mobile Drawer Toggle */}
            <button className="btn btn-icon btn-outline drawer-toggle show-mobile" onClick={() => setIsDrawerOpen(true)} style={{ padding: '0.4rem' }}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container layout-container">
        
        {/* Soru Listesi */}
        <div className="questions-list-container">
          
          {/* INLINE RESULTS COMPONENT */}
          {isFinished && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', borderColor: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.05)' }}>
              <Award size={48} style={{ color: 'var(--primary-color)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Sınav Tamamlandı! Başarı: %{percentage}
              </h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--success-bg)', color: 'var(--success-color)', padding: '0.75rem 1.5rem', borderRadius: '12px', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{score}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Doğru</div>
                </div>
                <div style={{ background: 'var(--error-bg)', color: 'var(--error-color)', padding: '0.75rem 1.5rem', borderRadius: '12px', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{wrongCount}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Yanlış</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.75rem 1.5rem', borderRadius: '12px', minWidth: '100px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{emptyCount}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Boş</div>
                </div>
              </div>
              
              <button className="btn btn-outline" onClick={restartQuiz}>
                <RotateCcw size={18} /> Yeniden Başla
              </button>
            </div>
          )}

          {questions.map((q, idx) => (
            <QuestionCard 
              key={q.id || idx}
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
            <div className="finish-container" style={{ margin: '3rem 0' }}>
              <button className="btn btn-primary btn-large" onClick={finishQuiz} style={{ width: '100%', padding: '1.25rem' }}>
                Sınavı Bitir <CheckCircle size={22} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          )}
        </div>

        {/* Sağ Taraf - Navigasyon Izgarası (Desktop) / Drawer (Mobile) */}
        <div className={`question-navigator glass-panel ${isDrawerOpen ? 'drawer-open' : ''}`}>
          <div className="drawer-header show-mobile">
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Harita ({answeredCount}/{totalQuestions})</h3>
            <button className="btn btn-icon btn-ghost" onClick={() => setIsDrawerOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <h3 className="hide-mobile" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }}>Navigasyon</h3>
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
                  style={{ padding: 0, fontSize: '0.9rem' }}
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
