import { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

const questionCounts = {
  buyukveri: 43,
  bilgisistemleriprojeyonetimi: 64,
  veritabaniyonetimsistemleri: 71,
  bilgisayarorganizasyonu: 94,
  benzetim: 156,
  hukukuntemelkavramlarifinal: 73,
  hukukuntemelkavramlaributunleme: 38,
  bilimselarastirmateknikleri: 194
};

const COURSES = [
  {
    id: 'benzetim',
    title: 'Benzetim (Simülasyon)',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.benzetim,
    color: '#3b82f6', // Blue color
    category: 'deneme'
  },
  {
    id: 'bilgisistemleriprojeyonetimi',
    title: 'Bilgi Sistemleri Proje Yönetimi',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilgisistemleriprojeyonetimi,
    color: '#10b981', // Green color
    category: 'deneme'
  },
  {
    id: 'hukukuntemelkavramlarifinal',
    title: 'Hukukun Temel Kavramları (Final)',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.hukukuntemelkavramlarifinal,
    color: '#8b5cf6', // Purple color
    category: 'final'
  },
  {
    id: 'hukukuntemelkavramlaributunleme',
    title: 'Hukukun Temel Kavramları (Bütünleme)',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.hukukuntemelkavramlaributunleme,
    color: '#d946ef', // Fuchsia color
    category: 'final'
  },
  {
    id: 'veritabaniyonetimsistemleri',
    title: 'Veritabanı Yönetim Sistemleri',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.veritabaniyonetimsistemleri,
    color: '#f59e0b', // Amber color
    category: 'deneme'
  },
  {
    id: 'bilgisayarorganizasyonu',
    title: 'Bilgisayar Organizasyonu',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilgisayarorganizasyonu,
    color: '#ef4444', // Red color
    category: 'deneme'
  },
  {
    id: 'bilimselarastirmateknikleri',
    title: 'Bilimsel Araştırma Teknikleri',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.bilimselarastirmateknikleri,
    color: '#14b8a6', // Teal color
    category: 'deneme'
  },
  {
    id: 'buyukveri',
    title: 'Büyük Veri',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: questionCounts.buyukveri,
    color: '#06b6d4', // Cyan color
    category: 'deneme'
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

      <div>
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
    </div>
  );
}
