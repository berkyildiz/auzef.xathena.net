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
    </div>
  );
}

export default App;
