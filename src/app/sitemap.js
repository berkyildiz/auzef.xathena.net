import { COURSES } from '../lib/courses';

export const dynamic = "force-static";

export default function sitemap() {
  const baseUrl = 'https://auzef.xathena.net';
  const groupSize = 20;

  const urls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  for (const course of COURSES) {
    // Course Page
    urls.push({
      url: `${baseUrl}/ders/${course.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Test Pages
    const totalQuestions = course.questionCount;
    const numTests = Math.ceil(totalQuestions / groupSize);
    
    for (let i = 1; i <= numTests; i++) {
      urls.push({
        url: `${baseUrl}/ders/${course.id}/test/${i}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return urls;
}
