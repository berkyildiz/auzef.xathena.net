import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle, Award, List, Menu, X } from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function QuizContainer({ courseId, courseTitle, testConfig, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [showReport, setShowReport] = useState(false);
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
    setShowReport(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishQuiz = () => {
    setIsFinished(true);
    setShowReport(true);
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
      <div className="container animate-fade-in results-page">
        <div className="glass-panel results-container">
          <Award size={64} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
          <h2 className="results-title">Sınav Tamamlandı!</h2>
          
          <div className="stats-grid">
            <div className="stat-card success-card">
              <div className="stat-number">{score}</div>
              <div className="stat-label">Doğru</div>
            </div>
            <div className="stat-card error-card">
              <div className="stat-number">{wrongCount}</div>
              <div className="stat-label">Yanlış</div>
            </div>
            <div className="stat-card neutral-card">
              <div className="stat-number">{emptyCount}</div>
              <div className="stat-label">Boş</div>
            </div>
          </div>
          
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Başarı Oranı: %{percentage}</h3>
          <p className="results-message">{message}</p>
          
          <div className="results-actions">
            <button className="btn btn-primary" onClick={() => { setShowReport(false); window.scrollTo(0,0); }}>
              <List size={18} /> <span className="btn-text">Soruları İncele</span>
            </button>
            <button className="btn btn-outline" onClick={restartQuiz}>
              <RotateCcw size={18} /> <span className="btn-text">Sıfırla</span>
            </button>
            <button className="btn btn-outline" onClick={onBack}>
              <ArrowLeft size={18} /> <span className="btn-text">Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-layout">
      {/* Global Top Edge Progress Bar */}
      <div className="global-progress-bg">
        <div className="global-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div className="drawer-overlay animate-fade-in" onClick={() => setIsDrawerOpen(false)}></div>
      )}

      {/* Sticky Header with Breadcrumbs */}
      <div className="quiz-sticky-header">
        <div className="container header-container">
          
          <div className="header-left">
            <button className="btn btn-icon btn-outline" onClick={onBack} title="Testlere Dön">
              <ArrowLeft size={20} /> 
            </button>
            <div className="breadcrumbs hide-mobile">
              {courseTitle || courseId} / <strong>{testConfig.title}</strong>
            </div>
            <div className="mobile-title show-mobile">
              {testConfig.title}
            </div>
          </div>

          <div className="header-center hide-mobile">
            <div className="progress-text">
              <span>İlerleme ({answeredCount}/{totalQuestions})</span>
              <span>%{Math.round(progressPercentage)}</span>
            </div>
          </div>

          <div className="header-right">
            {isFinished ? (
              <button className="btn btn-primary btn-sm" onClick={() => setShowReport(true)}>
                <span className="hide-mobile">Raporu Görüntüle</span>
                <Award className="show-mobile icon-only" size={20} />
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={finishQuiz}>
                <span className="hide-mobile">Sınavı Bitir</span>
                <CheckCircle className="show-mobile icon-only" size={20} />
              </button>
            )}
            
            {/* Mobile Drawer Toggle */}
            <button className="btn btn-icon btn-outline drawer-toggle show-mobile" onClick={() => setIsDrawerOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container layout-container">
        
        {/* Soru Listesi */}
        <div className="questions-list-container">
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
            <div className="finish-container">
              <button className="btn btn-primary btn-large" onClick={finishQuiz}>
                Sınavı Bitir ve Raporu Gör <CheckCircle size={22} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          )}
        </div>

        {/* Sağ Taraf - Navigasyon Izgarası (Desktop) / Drawer (Mobile) */}
        <div className={`question-navigator glass-panel ${isDrawerOpen ? 'drawer-open' : ''}`}>
          <div className="drawer-header show-mobile">
            <h3 style={{ margin: 0 }}>Harita ({answeredCount}/{totalQuestions})</h3>
            <button className="btn btn-icon btn-ghost" onClick={() => setIsDrawerOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <h3 className="hide-mobile" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', textAlign: 'center' }}>Navigasyon</h3>
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
