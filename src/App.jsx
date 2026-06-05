import { useState } from 'react';
import CourseSelector from './components/CourseSelector';
import TestSelector from './components/TestSelector';
import QuizContainer from './components/QuizContainer';

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null); // { id, title }
  const [selectedTest, setSelectedTest] = useState(null); // { startIndex, endIndex, title }

  const handleSelectCourse = (courseId, courseTitle) => {
    setSelectedCourse({ id: courseId, title: courseTitle });
    setSelectedTest(null);
  };

  const handleSelectTest = (startIndex, endIndex, title) => {
    setSelectedTest({ startIndex, endIndex, title });
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedTest(null);
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
  };

  return (
    <div className="App">
      {!selectedCourse ? (
        <CourseSelector onSelectCourse={handleSelectCourse} />
      ) : !selectedTest ? (
        <TestSelector 
          courseId={selectedCourse.id} 
          courseTitle={selectedCourse.title} 
          onSelectTest={handleSelectTest}
          onBack={handleBackToCourses} 
        />
      ) : (
        <QuizContainer 
          courseId={selectedCourse.id} 
          courseTitle={selectedCourse.title}
          testConfig={selectedTest}
          onBack={handleBackToTests} 
        />
      )}
      
      <footer style={{
        marginTop: '4rem',
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          Developed with ❤️ by <strong>Berk Yıldız</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href="https://berkyildiz.com.tr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            berkyildiz.com.tr
          </a>
          <span>|</span>
          <a href="https://xathena.net" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            xathena.net
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
