import QuizContainer from '../../../../../components/QuizContainer';
import { COURSES } from '../../../../../lib/courses';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export function generateStaticParams() {
  const params = [];
  const groupSize = 20;

  for (const course of COURSES) {
    const totalQuestions = course.questionCount;
    const numTests = Math.ceil(totalQuestions / groupSize);
    
    for (let i = 1; i <= numTests; i++) {
      params.push({
        courseId: course.id,
        testId: i.toString(),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }) {
  const { courseId, testId } = await params;
  const course = COURSES.find(c => c.id === courseId);
  
  if (!course) {
    return { title: 'Test Bulunamadı' };
  }

  const title = `${course.title} - Deneme Sınavı ${testId} | AUZEF`;
  const description = `AUZEF ${course.title} dersi geçmiş dönem çıkmış soruları içeren Deneme Sınavı ${testId}. Hemen test çözmeye başla ve başarı yüzdeni gör.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    }
  };
}

export default async function TestPage({ params }) {
  const { courseId, testId } = await params;
  const course = COURSES.find(c => c.id === courseId);

  if (!course) {
    notFound();
  }

  const testIndex = parseInt(testId, 10) - 1;
  const groupSize = 20;
  const totalQuestions = course.questionCount;
  const numTests = Math.ceil(totalQuestions / groupSize);

  if (testIndex < 0 || testIndex >= numTests) {
    notFound();
  }

  const start = testIndex * groupSize;
  const end = Math.min((testIndex + 1) * groupSize, totalQuestions);

  const testConfig = {
    id: parseInt(testId, 10),
    title: `Deneme Sınavı ${testId}`,
    startIndex: start,
    endIndex: end
  };

  // Load JSON dynamically server-side
  let allQuestions = [];
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'courses', `${courseId}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    allQuestions = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading questions for ${courseId}:`, error);
    notFound();
  }

  const questions = allQuestions.slice(start, end);

  // Generate FAQPage Structured Data for rich snippets
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.questionText || "Soru",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.options ? Object.entries(q.options).find(([letter, _]) => letter === q.correctAnswer)?.[1] || "Cevap" : "Cevap"
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <QuizContainer 
        courseId={courseId} 
        courseTitle={course.title} 
        testConfig={testConfig} 
        questions={questions} 
      />
    </>
  );
}
