import Link from 'next/link';
import { BookOpen, ChevronRight, CheckCircle } from 'lucide-react';
import { COURSES } from '../lib/courses';

export default function CourseSelector() {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <img src="/logo.png" alt="AUZEF Soru Çözüm Logo" style={{ width: '120px', height: '120px', marginBottom: '1rem', borderRadius: '24px', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AUZEF Soru Çözüm</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Çıkmış soruları çözerek sınavlara hazırlanın. Bir ders seçerek hemen başlayın.
        </p>
      </div>
      
      {COURSES.some(c => c.category === 'final') && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Final - Bütünleme</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {COURSES.filter(c => c.category === 'final').map(course => (
              <Link href={`/ders/${course.id}`} key={course.id} prefetch={false} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-panel course-card">
                  <div className="icon-container" style={{ color: course.color, background: `${course.color}20` }}>
                    <BookOpen size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{course.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.description}</p>
                  </div>
                  <ChevronRight size={20} color="var(--text-secondary)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {COURSES.some(c => c.category === 'deneme') && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Deneme Sınavları</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {COURSES.filter(c => c.category === 'deneme').map(course => (
              <Link href={`/ders/${course.id}`} key={course.id} prefetch={false} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-panel course-card">
                  <div className="icon-container" style={{ color: course.color, background: `${course.color}20` }}>
                    <BookOpen size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{course.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.description}</p>
                  </div>
                  <ChevronRight size={20} color="var(--text-secondary)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {COURSES.some(c => c.category === 'tamamlandi') && (
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Tamamlanan Sınavlar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', opacity: 0.8 }}>
            {COURSES.filter(c => c.category === 'tamamlandi').map(course => (
              <Link href={`/ders/${course.id}`} key={course.id} prefetch={false} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="glass-panel course-card"
                  style={{ filter: 'grayscale(0.5)' }}
                >
                  <div className="icon-container" style={{ color: course.color, background: `${course.color}20` }}>
                    <CheckCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.description}</p>
                  </div>
                  <ChevronRight size={20} color="var(--text-secondary)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
