import { useState } from 'react';
import CourseSelector from './components/CourseSelector';
import QuizContainer from './components/QuizContainer';

function App() {
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
  };

  return (
    <div className="App">
      {!selectedCourseId ? (
        <CourseSelector onSelectCourse={handleSelectCourse} />
      ) : (
        <QuizContainer courseId={selectedCourseId} onBack={handleBackToCourses} />
      )}
    </div>
  );
}

export default App;
