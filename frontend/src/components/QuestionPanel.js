import React, { useState } from 'react';

const QuestionPanel = ({ question, questionIndex, totalQuestions, answer, onAnswerChange, disabled }) => {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="question-panel-modern">
      <div className="question-header-modern">
        <span className="question-number">Question {questionIndex + 1} of {totalQuestions}</span>
        <span className="word-count">{wordCount} words</span>
      </div>
      
      <div className="question-text-modern">
        <p>{question.text}</p>
      </div>
      
      <textarea
        className="answer-textarea"
        placeholder="Type your answer here... Be specific and use examples."
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        rows={8}
      />
    </div>
  );
};

export default QuestionPanel;