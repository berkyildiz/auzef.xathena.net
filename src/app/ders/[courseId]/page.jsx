import TestSelector from '../../../components/TestSelector';
import { COURSES } from '../../../lib/courses';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return COURSES.map((course) => ({
    courseId: course.id,
  }));
}

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = COURSES.find(c => c.id === courseId);
  
  if (!course) {
    return { title: 'Ders Bulunamadı' };
  }

  return {
    title: `${course.title} Çıkmış Sorular ve Denemeler | AUZEF`,
    description: `AUZEF ${course.title} dersi geçmiş dönem çıkmış sorular, deneme sınavları ve detaylı cevapları. Hemen test çözmeye başla.`,
    openGraph: {
      title: `${course.title} Çıkmış Sorular ve Denemeler | AUZEF`,
      description: `AUZEF ${course.title} dersi geçmiş dönem çıkmış sorular, deneme sınavları ve detaylı cevapları. Hemen test çözmeye başla.`,
    }
  };
}

export default async function CoursePage({ params }) {
  const { courseId } = await params;
  const course = COURSES.find(c => c.id === courseId);

  if (!course) {
    notFound();
  }

  return <TestSelector courseId={courseId} />;
}
