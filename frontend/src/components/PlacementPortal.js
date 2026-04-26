import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PlacementPortal = ({ user }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState('mcq');
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const companies = [
    { id: 'google', name: 'Google', icon: '🌐', color: '#4285F4', difficulty: 'Hard' }
  ];

  const companyTests = {
    google: {
      mcq: [
        { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"], answer: "O(log n)" },
        { question: "Which data structure is used for BFS traversal?", options: ["Stack", "Queue", "Array", "Linked List"], answer: "Queue" },
        { question: "What is the output of 5 & 3 in C++?", options: ["1", "2", "3", "5"], answer: "1" },
        { question: "Which company created Android?", options: ["Apple", "Microsoft", "Google", "Samsung"], answer: "Google" },
        { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Transfer Protocol", "Hyper Transfer Protocol", "None"], answer: "HyperText Transfer Protocol" }
      ],
      dsa: [
        { 
          id: 1, 
          title: "Two Sum", 
          problem: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
          difficulty: "Easy",
          function_name: "twoSum",
          test_cases: [
            { id: 1, input: "vector<int> nums = {2,7,11,15}; int target = 9;", expected: "[0,1]" },
            { id: 2, input: "vector<int> nums = {3,2,4}; int target = 6;", expected: "[1,2]" },
            { id: 3, input: "vector<int> nums = {3,3}; int target = 6;", expected: "[0,1]" }
          ],
          template: `vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    
}`
        }
      ]
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    const token = localStorage.getItem('token');
    const currentDSA = companyTests.google.dsa[0];
    
    try {
      const response = await fetch('http://localhost:5000/api/run-cpp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code || currentDSA.template,
          language: 'cpp',
          function_name: currentDSA.function_name,
          test_cases: currentDSA.test_cases
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const outputText = data.results.map(r => {
          if (r.passed) {
            return `✅ Test ${r.test}: Passed (Expected: ${r.expected})`;
          } else {
            return `❌ Test ${r.test}: Failed\n   Input: ${r.input}\n   Expected: ${r.expected}\n   Got: ${r.output}`;
          }
        }).join('\n\n');
        
        setOutput(outputText + (data.all_passed ? '\n\n🎉 All test cases passed!' : '\n\n⚠️ Some test cases failed.'));
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitMcqTest = () => {
    const test = companyTests.google;
    let score = 0;
    test.mcq.forEach((q, idx) => {
      if (mcqAnswers[`mcq_${idx}`] === q.answer) score++;
    });
    const totalScore = Math.round((score / test.mcq.length) * 100);
    setResults({ type: 'mcq', score: totalScore, total: test.mcq.length, correct: score });
    setTestSubmitted(true);
  };

  const startTest = () => {
    setTestStarted(true);
    setCurrentSection('mcq');
    setCurrentMcqIndex(0);
    setMcqAnswers({});
    setCode('');
    setOutput('');
    setTestSubmitted(false);
    setResults(null);
  };

  const currentCompanyData = companyTests.google;

  return (
    <div className="placement-portal">
      {!testStarted ? (
        <>
          <div className="portal-hero">
            <h1>🏢 Placement<span>Portal</span></h1>
            <p>Practice Google mock test with MCQ & DSA coding challenges</p>
          </div>
          <div className="companies-grid">
            {companies.map(company => (
              <motion.div key={company.id} className="company-card" whileHover={{ scale: 1.02, y: -5 }} onClick={startTest}>
                <div className="company-icon" style={{ background: `${company.color}20` }}>{company.icon}</div>
                <h3>{company.name}</h3>
                <span className={`difficulty ${company.difficulty.toLowerCase()}`}>{company.difficulty}</span>
                <button className="start-test-btn">Start Test →</button>
              </motion.div>
            ))}
          </div>
        </>
      ) : !testSubmitted ? (
        <div className="test-container">
          <div className="test-header">
            <h2>Google Mock Test</h2>
            <div className="tabs">
              <button className={`tab ${currentSection === 'mcq' ? 'active' : ''}`} onClick={() => setCurrentSection('mcq')}>
                📝 MCQ ({currentCompanyData.mcq.length})
              </button>
              <button className={`tab ${currentSection === 'dsa' ? 'active' : ''}`} onClick={() => setCurrentSection('dsa')}>
                💻 DSA ({currentCompanyData.dsa.length})
              </button>
            </div>
          </div>

          {currentSection === 'mcq' && (
            <div className="mcq-section">
              <div className="mcq-card">
                <div className="mcq-header">Question {currentMcqIndex + 1} of {currentCompanyData.mcq.length}</div>
                <h3 className="mcq-question">{currentCompanyData.mcq[currentMcqIndex].question}</h3>
                <div className="mcq-options">
                  {currentCompanyData.mcq[currentMcqIndex].options.map((opt, idx) => (
                    <label key={idx} className={`mcq-option ${mcqAnswers[`mcq_${currentMcqIndex}`] === opt ? 'selected' : ''}`}>
                      <input type="radio" name="mcq" value={opt} checked={mcqAnswers[`mcq_${currentMcqIndex}`] === opt} 
                        onChange={() => setMcqAnswers({...mcqAnswers, [`mcq_${currentMcqIndex}`]: opt})} />
                      <span className="opt-letter">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="mcq-nav">
                  <button onClick={() => setCurrentMcqIndex(p => Math.max(0, p-1))} disabled={currentMcqIndex === 0}>← Previous</button>
                  <span>{currentMcqIndex + 1} / {currentCompanyData.mcq.length}</span>
                  <button onClick={() => setCurrentMcqIndex(p => Math.min(currentCompanyData.mcq.length - 1, p+1))} disabled={currentMcqIndex === currentCompanyData.mcq.length - 1}>Next →</button>
                </div>
                <button className="submit-btn" onClick={submitMcqTest}>Submit MCQ Test</button>
              </div>
            </div>
          )}

          {currentSection === 'dsa' && (
            <div className="dsa-container">
              <div className="problem-section">
                <h3>{currentCompanyData.dsa[0].title}</h3>
                <span className="difficulty-badge easy">Easy</span>
                <div className="problem-statement">{currentCompanyData.dsa[0].problem}</div>
                <div className="test-cases-section">
                  <h4>📋 Test Cases:</h4>
                  {currentCompanyData.dsa[0].test_cases.map((tc, idx) => (
                    <div key={idx} className="test-case">
                      <div><span className="test-label">Input {idx + 1}:</span> {tc.input}</div>
                      <div><span className="test-label">Expected:</span> {tc.expected}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="code-section">
                <div className="language-bar">
                  <span className="lang-active">⚡ C++</span>
                </div>
                <textarea 
                  value={code || currentCompanyData.dsa[0].template} 
                  onChange={(e) => setCode(e.target.value)} 
                  className="code-editor"
                  spellCheck="false"
                />
                <button className="run-code-btn" onClick={runCode} disabled={isRunning}>
                  {isRunning ? '⏳ Running...' : '▶ Run Code'}
                </button>
                {output && (
                  <div className="output-box">
                    <div className="output-title">📤 Output:</div>
                    <pre className="output-text">{output}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="results-container">
          <div className="results-card">
            <h1>📊 Test Results</h1>
            <div className="score-circle">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="12"/>
                <circle cx="80" cy="80" r="70" fill="none" stroke={results?.score >= 70 ? '#10b981' : results?.score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="12" strokeDasharray={2 * Math.PI * 70} strokeDashoffset={2 * Math.PI * 70 * (1 - (results?.score || 0) / 100)} strokeLinecap="round" transform="rotate(-90 80 80)"/>
                <text x="80" y="88" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">{results?.score || 0}%</text>
              </svg>
            </div>
            <div className="result-stat">✅ Correct: <strong>{results.correct}</strong> / {results.total}</div>
            <div className="result-stat">📊 Percentage: <strong>{results.score}%</strong></div>
            <button className="back-btn" onClick={() => { setTestStarted(false); setTestSubmitted(false); setCode(''); setOutput(''); }}>← Back to Companies</button>
          </div>
        </div>
      )}

      <style>{`
        .placement-portal { min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 24px; }
        .portal-hero { text-align: center; padding: 48px 20px; }
        .portal-hero h1 { font-size: 48px; background: linear-gradient(135deg, #fff, #f59e0b); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 12px; }
        .companies-grid { display: flex; justify-content: center; gap: 24px; }
        .company-card { background: rgba(255,255,255,0.05); border-radius: 24px; padding: 28px 20px; text-align: center; cursor: pointer; width: 300px; }
        .company-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.1); }
        .company-icon { font-size: 48px; margin-bottom: 16px; }
        .difficulty { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 12px 0; }
        .difficulty.hard { background: #ef444420; color: #ef4444; }
        .start-test-btn { background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 30px; padding: 10px 20px; color: white; cursor: pointer; width: 100%; }
        .test-container { max-width: 1400px; margin: 0 auto; }
        .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .test-header h2 { color: white; font-size: 28px; }
        .tabs { display: flex; gap: 12px; }
        .tab { background: rgba(255,255,255,0.05); border: none; padding: 10px 24px; border-radius: 40px; color: #94a3b8; cursor: pointer; }
        .tab.active { background: #f59e0b; color: #0f172a; }
        .mcq-card { background: rgba(255,255,255,0.05); border-radius: 24px; padding: 32px; }
        .mcq-question { font-size: 20px; color: white; margin: 20px 0; }
        .mcq-options { display: flex; flex-direction: column; gap: 12px; }
        .mcq-option { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; cursor: pointer; }
        .mcq-option.selected { background: rgba(245,158,11,0.15); border: 1px solid #f59e0b; }
        .mcq-nav { display: flex; justify-content: space-between; margin: 24px 0; }
        .submit-btn { width: 100%; background: #10b981; border: none; border-radius: 40px; padding: 14px; color: white; cursor: pointer; }
        .dsa-container { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .problem-section { background: rgba(255,255,255,0.05); border-radius: 24px; padding: 24px; }
        .problem-statement { color: #cbd5e1; line-height: 1.6; margin: 16px 0; }
        .code-section { background: #0a0c15; border-radius: 24px; overflow: hidden; }
        .language-bar { padding: 12px 16px; background: #1e293b; }
        .lang-active { background: #f59e0b; color: #0f172a; padding: 6px 14px; border-radius: 20px; display: inline-block; }
        .code-editor { width: 100%; min-height: 300px; background: #0a0c15; border: none; color: #e2e8f0; font-family: monospace; padding: 16px; resize: vertical; }
        .run-code-btn { margin: 16px; background: #10b981; border: none; border-radius: 10px; padding: 10px 20px; color: white; cursor: pointer; }
        .output-box { margin: 0 16px 16px; padding: 16px; background: #1e293b; border-radius: 12px; }
        .output-text { color: #10b981; font-family: monospace; white-space: pre-wrap; }
        .results-card { background: rgba(255,255,255,0.05); border-radius: 32px; padding: 48px; text-align: center; max-width: 500px; margin: 0 auto; }
        .result-stat { margin: 12px 0; font-size: 18px; color: white; }
        .back-btn { background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 40px; padding: 14px; color: white; cursor: pointer; width: 100%; margin-top: 24px; }
        @media (max-width: 768px) { .dsa-container { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default PlacementPortal;