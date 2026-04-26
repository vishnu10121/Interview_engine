import React, { useState } from 'react';

const QuestionInterface = ({ questions, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1606);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  return (
    <div className="interview-interface">
      {/* Header */}
      <div className="interface-header">
        <div className="logo">⚡ InterviewEngine</div>
        <div className="timer-display">
          <span>Time Left</span>
          <strong className={timeLeft < 60 ? 'warning' : ''}>{formatTime(timeLeft)}</strong>
        </div>
      </div>

      {/* Question Area */}
      <div className="question-area">
        <div className="question-badge">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
        <div className="question-content">
          <p>{currentQuestion.text}</p>
        </div>

        {/* Options for MCQ */}
        <div className="options-area">
          {currentQuestion.options?.map((opt, idx) => (
            <label key={idx} className={`option ${answers[currentQuestion.id] === opt.value ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`q${currentQuestion.id}`}
                value={opt.value}
                checked={answers[currentQuestion.id] === opt.value}
                onChange={() => setAnswers({...answers, [currentQuestion.id]: opt.value})}
              />
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{opt.text}</span>
            </label>
          ))}
        </div>

        {/* Navigation */}
        <div className="nav-buttons">
          <button 
            onClick={() => setCurrentIndex(i => Math.max(0, i-1))}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>
          <button 
            className="primary"
            onClick={() => {
              if (currentIndex < totalQuestions - 1) {
                setCurrentIndex(i => i+1);
              } else {
                onSubmit(answers);
              }
            }}
          >
            {currentIndex === totalQuestions - 1 ? 'Submit' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="questions-grid-sidebar">
        <h4>Questions</h4>
        <div className="grid">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              className={`grid-item ${answers[q.id] ? 'answered' : ''} ${currentIndex === idx ? 'current' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionInterface;