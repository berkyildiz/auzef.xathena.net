import { useState } from 'react';
import { BookOpen, ChevronRight, CheckCircle } from 'lucide-react';

const questionCounts = {
  buyukveri: 37,
  buyukveri2022_2023final: 23,
  bilgisistemleriprojeyonetimi: 64,
  veritabaniyonetimsistemleri: 20,
  bilgisayarorganizasyonu: 62,
  benzetim: 156,
  hukukuntemelkavramlarifinal: 73,
  hukukuntemelkavramlaributunleme: 38,
  hukukuntemelkavramlarideneme: 80,
  bilimselarastirmateknikleri: 117,
  bilisimhukuku: 39,
  bilisimhukukubutunleme: 20
};

const COURSES = [
  {
    id: 'benzetim',
    title: 'Benzetim (Simülasyon) ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.benzetim,
    color: '#3b82f6', // Blue color
    category: 'tamamlandi'
  },
  {
    id: 'bilgisistemleriprojeyonetimi',
    title: 'Bilgi Sistemleri Proje Yönetimi ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilgisistemleriprojeyonetimi,
    color: '#10b981', // Green color
    category: 'tamamlandi'
  },
  {
    id: 'hukukuntemelkavramlarifinal',
    title: 'Hukukun Temel Kavramları (Final) ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.hukukuntemelkavramlarifinal,
    color: '#8b5cf6', // Purple color
    category: 'tamamlandi'
  },
  {
    id: 'hukukuntemelkavramlaributunleme',
    title: 'Hukukun Temel Kavramları (Bütünleme) ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.hukukuntemelkavramlaributunleme,
    color: '#d946ef', // Fuchsia color
    category: 'tamamlandi'
  },
  {
    id: 'hukukuntemelkavramlarideneme',
    title: 'Hukukun Temel Kavramları (Deneme) ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.hukukuntemelkavramlarideneme,
    color: '#c026d3', // Pink-purple color
    category: 'tamamlandi'
  },
  {
    id: 'veritabaniyonetimsistemleri',
    title: 'Veritabanı Yönetim Sistemleri ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.veritabaniyonetimsistemleri,
    color: '#f59e0b', // Amber color
    category: 'tamamlandi'
  },
  {
    id: 'bilgisayarorganizasyonu',
    title: 'Bilgisayar Organizasyonu ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilgisayarorganizasyonu,
    color: '#ef4444', // Red color
    category: 'tamamlandi'
  },
  {
    id: 'bilimselarastirmateknikleri',
    title: 'Bilimsel Araştırma Teknikleri ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilimselarastirmateknikleri,
    color: '#14b8a6', // Teal color
    category: 'tamamlandi'
  },
  {
    id: 'buyukveri',
    title: 'Büyük Veri ✅',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.buyukveri,
    color: '#06b6d4', // Cyan color
    category: 'tamamlandi'
  },
  {
    id: 'buyukveri2022-2023final',
    title: 'Büyük Veri (2022-2023 Final) ✅',
    description: 'Geçmiş dönem çıkmış sorular ve AI Çeldiricileri',
    questionCount: questionCounts.buyukveri2022_2023final,
    color: '#38bdf8', // Light blue color
    category: 'tamamlandi'
  },
  {
    id: 'bilisimhukuku',
    title: 'Bilişim Hukuku (2024-2025 Final)',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilisimhukuku,
    color: '#ec4899', // Pink color
    category: 'final'
  },
  {
    id: 'bilisimhukukubutunleme',
    title: 'Bilişim Hukuku (Bütünleme)',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilisimhukukubutunleme,
    color: '#a855f7', // Purple color
    category: 'final'
  }
];

export default function CourseSelector({ onSelectCourse }) {
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
              <div 
                key={course.id}
                className="glass-panel course-card"
                onClick={() => onSelectCourse(course.id, course.title)}
              >
                <div className="icon-container" style={{ color: course.color, background: `${course.color}20` }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.description}</p>
                </div>
                <ChevronRight size={20} color="var(--text-secondary)" />
              </div>
            ))}
          </div>
        </div>
      )}

      {COURSES.some(c => c.category === 'deneme') && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Deneme Sınavları</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {COURSES.filter(c => c.category === 'deneme').map(course => (
              <div 
                key={course.id}
                className="glass-panel course-card"
                onClick={() => onSelectCourse(course.id, course.title)}
              >
                <div className="icon-container" style={{ color: course.color, background: `${course.color}20` }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.description}</p>
                </div>
                <ChevronRight size={20} color="var(--text-secondary)" />
              </div>
            ))}
          </div>
        </div>
      )}

      {COURSES.some(c => c.category === 'tamamlandi') && (
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Tamamlanan Sınavlar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', opacity: 0.8 }}>
            {COURSES.filter(c => c.category === 'tamamlandi').map(course => (
              <div 
                key={course.id}
                className="glass-panel course-card"
                onClick={() => onSelectCourse(course.id, course.title)}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
