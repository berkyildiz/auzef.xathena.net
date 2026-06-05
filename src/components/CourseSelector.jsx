import { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

const COURSES = [
  {
    id: 'benzetim',
    title: 'Benzetim (Simülasyon)',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 155,
    color: '#3b82f6' // Blue color
  },
  {
    id: 'bilgisistemleriprojeyonetimi',
    title: 'Bilgi Sistemleri Proje Yönetimi',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 63,
    color: '#10b981' // Green color
  },
  {
    id: 'hukukuntemelkavramlari',
    title: 'Hukukun Temel Kavramları',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 173,
    color: '#8b5cf6' // Purple color
  },
  {
    id: 'veritabaniyonetimsistemleri',
    title: 'Veri Tabanı Yönetim Sistemleri',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 70,
    color: '#8b5cf6' // Violet color
  },
  {
    id: 'bilgisayarorganizasyonu',
    title: 'Bilgisayar Organizasyonu',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 92,
    color: '#ec4899' // Pink color
  },
  {
    id: 'bilimselarastirmateknikleri',
    title: 'Bilimsel Araştırma Teknikleri',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 186,
    color: '#0ea5e9' // Sky Blue color
  },
  {
    id: 'buyukveri',
    title: 'Büyük Veri',
    description: 'Geçmiş dönem çıkmış sorular ve cevapları',
    questionCount: 42,
    color: '#f43f5e' // Rose color
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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {COURSES.map(course => (
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
  );
}
