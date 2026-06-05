import { useState, useEffect } from 'react';
import { FileText, ArrowLeft, ChevronRight } from 'lucide-react';

export default function TestSelector({ courseId, courseTitle, onSelectTest, onBack }) {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import(`../data/courses/${courseId}.json`)
      .then((module) => {
        setTotalQuestions(module.default.length);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Soru sayısı yüklenirken hata:", err);
        setIsLoading(false);
      });
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Testler Yükleniyor...</div>
      </div>
    );
  }

  // Grupları oluştur (20'şer soru)
  const tests = [];
  const groupSize = 20;
  const numTests = Math.ceil(totalQuestions / groupSize);

  for (let i = 0; i < numTests; i++) {
    const start = i * groupSize;
    const end = Math.min((i + 1) * groupSize, totalQuestions);
    tests.push({
      id: i,
      title: `Deneme Sınavı ${i + 1}`,
      description: `Soru ${start + 1} - ${end}`,
      startIndex: start,
      endIndex: end,
      count: end - start
    });
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem' }} onClick={onBack}>
          <ArrowLeft size={18} /> Geri Dön
        </button>
        <div className="breadcrumbs" style={{ color: 'var(--text-secondary)' }}>
          Dersler / <strong style={{ color: 'var(--text-primary)' }}>{courseTitle || courseId}</strong>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{courseTitle || courseId} Testleri</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Lütfen çözmek istediğiniz testi seçin. Her test 20 sorudan oluşmaktadır.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {tests.map(test => (
          <div 
            key={test.id}
            className="glass-panel course-card"
            onClick={() => onSelectTest(test.startIndex, test.endIndex, test.title)}
          >
            <div className="icon-container" style={{ color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.1)' }}>
              <FileText size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{test.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{test.description} ({test.count} Soru)</p>
            </div>
            <ChevronRight size={20} color="var(--text-secondary)" />
          </div>
        ))}
      </div>
    </div>
  );
}
