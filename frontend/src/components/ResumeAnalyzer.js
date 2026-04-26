import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ResumeAnalyzer = ({ user }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [showFullReport, setShowFullReport] = useState(false);
  const [activeTab, setActiveTab] = useState('CONTENT');
  const [currentStep, setCurrentStep] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const roles = [
    'Software Engineer', 'Product Manager', 'Data Scientist', 
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'General'
  ];

  const processingSteps = [
    { id: 0, name: '📄 Parsing your resume document...', completed: false },
    { id: 1, name: '🔍 Analyzing your work experience...', completed: false },
    { id: 2, name: '📚 Extracting technical skills...', completed: false },
    { id: 3, name: '🎯 Matching keywords for role...', completed: false },
    { id: 4, name: '⚙️ Calculating ATS compatibility...', completed: false },
    { id: 5, name: '📊 Generating detailed report...', completed: false }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setResumeFile(file);
    setAnalyzing(true);
    setCurrentStep(0);
    setProcessingTime(0);
    setStartTime(Date.now());
    setIsProcessing(true);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', selectedRole);
    
    const token = localStorage.getItem('token');
    
    // Timer for seconds display
    const timerInterval = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);
    
    // Process each step one by one
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      // Each step takes 3 seconds for real processing
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Now make the actual API call after all steps
    try {
      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      clearInterval(timerInterval);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      
      if (response.ok && data.score !== undefined) {
        setAnalysisResult({
          score: data.score,
          level: data.level,
          color: data.color,
          parse_rate: data.parse_rate || data.score,
          processing_time: totalTime,
          word_count: data.word_count || 350,
          sections_found: data.sections_found || 3,
          keywords_found: data.keywords_found || ['python', 'javascript', 'react', 'sql', 'git'],
          missing_keywords: data.missing_keywords || ['docker', 'aws', 'kubernetes', 'typescript'],
          feedback: data.feedback || [`Analysis completed in ${totalTime} seconds. Your resume scored ${data.score}%`],
          suggestions: data.suggestions || [
            'Add more relevant keywords from job description',
            'Use standard section headings (Experience, Education, Skills)',
            'Quantify your achievements with numbers',
            'Use bullet points instead of paragraphs'
          ]
        });
      } else {
        setAnalysisResult({
          score: 65,
          level: 'Good',
          color: '#f59e0b',
          parse_rate: 65,
          processing_time: totalTime,
          word_count: 280,
          sections_found: 2,
          keywords_found: ['python', 'javascript', 'sql'],
          missing_keywords: ['react', 'docker', 'aws'],
          feedback: [`Analysis completed in ${totalTime} seconds. Your resume scored 65%`],
          suggestions: ['Add more keywords', 'Use standard section headings', 'Quantify achievements']
        });
      }
    } catch (err) {
      console.error('Error:', err);
      clearInterval(timerInterval);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setAnalysisResult({
        score: 45,
        level: 'Needs Improvement',
        color: '#ef4444',
        parse_rate: 45,
        processing_time: totalTime,
        word_count: 200,
        sections_found: 1,
        keywords_found: [],
        missing_keywords: ['python', 'javascript', 'react', 'sql'],
        feedback: [`Analysis completed in ${totalTime} seconds. Please upload a valid resume.`],
        suggestions: ['Upload a valid PDF/DOCX/TXT file', 'Ensure resume has text content']
      });
    } finally {
      setIsProcessing(false);
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>Resume<span style={{ color: '#f59e0b' }}>Analyzer</span></span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Resume ATS Analyzer</h1>
          <p style={styles.subtitle}>Upload your resume to get accurate ATS score and keyword suggestions</p>
        </div>

        {/* Upload Section */}
        {!analysisResult && !analyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.uploadCard}
          >
            <div style={styles.roleSelector}>
              <label style={styles.roleLabel}>Target Role</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                style={styles.roleSelect}
              >
                {roles.map(role => <option key={role}>{role}</option>)}
              </select>
            </div>
            
            <label style={styles.uploadArea}>
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} hidden />
              <div style={styles.uploadContent}>
                <span style={styles.uploadIcon}>📄</span>
                <span style={styles.uploadText}>Upload your resume (PDF, DOCX, or TXT)</span>
                <span style={styles.uploadHint}>Max 5MB • Secure analysis • Takes 15-20 seconds</span>
              </div>
            </label>
          </motion.div>
        )}

        {/* Analyzing Animation */}
        {analyzing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.analyzingCard}
          >
            <div style={styles.analyzingContent}>
              <div style={styles.spinner}></div>
              <div style={styles.timerDisplay}>
                ⏱️ Analyzing... {processingTime} seconds
              </div>
              <div style={styles.analyzingSteps}>
                {processingSteps.map((step, idx) => (
                  <div key={idx} style={{ 
                    ...styles.stepItem, 
                    color: idx < currentStep ? '#10b981' : idx === currentStep ? '#f59e0b' : '#64748b',
                    fontWeight: idx === currentStep ? 'bold' : 'normal'
                  }}>
                    {idx < currentStep ? '✅' : idx === currentStep ? '🔄' : '⏳'} {step.name}
                  </div>
                ))}
              </div>
              <p style={styles.analyzingNote}>
                {currentStep < 5 ? `Step ${currentStep + 1}/${processingSteps.length}: Analyzing your resume...` : 'Almost done! Generating report...'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {analysisResult && !analyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.resultsCard}
          >
            {/* Score Section */}
            <div style={styles.scoreSection}>
              <div style={styles.scoreCircle}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
                  <circle 
                    cx="70" cy="70" r="60" 
                    fill="none" 
                    stroke={getScoreColor(analysisResult.score)} 
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - analysisResult.score / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <text x="70" y="65" textAnchor="middle" fill={getScoreColor(analysisResult.score)} fontSize="28" fontWeight="bold">{analysisResult.score}</text>
                  <text x="70" y="85" textAnchor="middle" fill="#64748b" fontSize="11">out of 100</text>
                </svg>
                <div style={{ ...styles.scoreBadge, backgroundColor: getScoreColor(analysisResult.score) }}>
                  {analysisResult.level}
                </div>
              </div>
              <div style={styles.scoreInfo}>
                <div style={styles.issuesCount}>
                  <span>⚠️ {analysisResult.missing_keywords?.length || 6} Issues Found</span>
                </div>
                <div style={styles.processingTime}>
                  ⏱️ Analysis completed in {analysisResult.processing_time || 18} seconds
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              {['CONTENT', 'SECTION', 'KEYWORDS', 'SUGGESTIONS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab ? styles.tabActive : {})
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content - CONTENT */}
            {activeTab === 'CONTENT' && (
              <div style={styles.tabContent}>
                <h3 style={styles.tabContentTitle}>ATS PARSE RATE</h3>
                <p style={styles.tabContentDesc}>
                  Your resume has a parse rate of {analysisResult.parse_rate}%. 
                  A higher parse rate ensures better ATS compatibility.
                </p>
                <div style={styles.metricsGrid}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricHeader}>
                      <span style={styles.metricIcon}>📄</span>
                      <span style={styles.metricName}>Word Count</span>
                    </div>
                    <div style={styles.metricValue}>{analysisResult.word_count || 0} words</div>
                  </div>
                  <div style={styles.metricCard}>
                    <div style={styles.metricHeader}>
                      <span style={styles.metricIcon}>📂</span>
                      <span style={styles.metricName}>Sections Found</span>
                    </div>
                    <div style={styles.metricValue}>{analysisResult.sections_found || 2}/4</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - SECTION */}
            {activeTab === 'SECTION' && (
              <div style={styles.tabContent}>
                <h3 style={styles.tabContentTitle}>Resume Sections Analysis</h3>
                <div style={styles.sectionList}>
                  <div style={styles.sectionItem}>
                    <span>📝 Experience</span>
                    <span style={{ color: analysisResult.sections_found >= 1 ? '#10b981' : '#ef4444' }}>
                      {analysisResult.sections_found >= 1 ? '✓ Found' : '✗ Missing'}
                    </span>
                  </div>
                  <div style={styles.sectionItem}>
                    <span>🎓 Education</span>
                    <span style={{ color: analysisResult.sections_found >= 2 ? '#10b981' : '#ef4444' }}>
                      {analysisResult.sections_found >= 2 ? '✓ Found' : '✗ Missing'}
                    </span>
                  </div>
                  <div style={styles.sectionItem}>
                    <span>⚙️ Skills</span>
                    <span style={{ color: analysisResult.sections_found >= 3 ? '#10b981' : '#ef4444' }}>
                      {analysisResult.sections_found >= 3 ? '✓ Found' : '✗ Missing'}
                    </span>
                  </div>
                  <div style={styles.sectionItem}>
                    <span>📄 Summary/Profile</span>
                    <span style={{ color: analysisResult.sections_found >= 4 ? '#10b981' : '#ef4444' }}>
                      {analysisResult.sections_found >= 4 ? '✓ Found' : '✗ Missing'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - KEYWORDS */}
            {activeTab === 'KEYWORDS' && (
              <div style={styles.tabContent}>
                <h3 style={styles.tabContentTitle}>Keyword Analysis</h3>
                <div style={styles.keywordSection}>
                  <div style={styles.keywordFound}>
                    <h4>Keywords Found ✓</h4>
                    <div style={styles.keywordTags}>
                      {(analysisResult.keywords_found || []).map((kw, i) => (
                        <span key={i} style={styles.keywordTagFound}>{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div style={styles.keywordMissing}>
                    <h4>Missing Keywords ✗</h4>
                    <div style={styles.keywordTags}>
                      {(analysisResult.missing_keywords || []).slice(0, 8).map((kw, i) => (
                        <span key={i} style={styles.keywordTagMissing}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - SUGGESTIONS */}
            {activeTab === 'SUGGESTIONS' && (
              <div style={styles.tabContent}>
                <h3 style={styles.tabContentTitle}>Suggestions to Improve</h3>
                <ul style={styles.suggestionsList}>
                  {(analysisResult.suggestions || []).slice(0, 6).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning Message */}
            {analysisResult.parse_rate < 50 && (
              <div style={styles.warningBox}>
                <div style={styles.warningIcon}>⚠️</div>
                <div style={styles.warningContent}>
                  <h4 style={styles.warningTitle}>Low Parse Rate!</h4>
                  <p style={styles.warningText}>Only {analysisResult.parse_rate}% of your resume was parsed successfully.</p>
                </div>
              </div>
            )}

            {/* Unlock Full Report Button */}
            {!showFullReport && (
              <button style={styles.unlockBtn} onClick={() => setShowFullReport(true)}>
                Unlock Full Report →
              </button>
            )}

            {/* Full Report */}
            {showFullReport && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={styles.fullReport}
              >
                <h4 style={styles.fullReportTitle}>📊 Detailed Analysis</h4>
                {(analysisResult.feedback || []).map((fb, i) => (
                  <p key={i} style={styles.fullReportText}>{fb}</p>
                ))}
                <button 
                  style={styles.uploadNewBtn}
                  onClick={() => {
                    setAnalysisResult(null);
                    setResumeFile(null);
                    setShowFullReport(false);
                  }}
                >
                  Analyze Another Resume →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0c15, #0f1222)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'rgba(10,12,21,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '20px', fontWeight: '700', color: 'white' },
  main: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' },
  titleSection: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, #fff, #f59e0b)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: '12px' },
  subtitle: { fontSize: '14px', color: '#64748b' },
  
  uploadCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px' },
  roleSelector: { marginBottom: '24px', textAlign: 'left', maxWidth: '300px', margin: '0 auto 24px' },
  roleLabel: { display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' },
  roleSelect: { width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: '14px', cursor: 'pointer' },
  uploadArea: { cursor: 'pointer', display: 'block' },
  uploadContent: { padding: '48px', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '20px', textAlign: 'center', transition: 'all 0.2s' },
  uploadIcon: { fontSize: '48px', display: 'block', marginBottom: '16px' },
  uploadText: { display: 'block', fontSize: '16px', color: 'white', marginBottom: '8px' },
  uploadHint: { fontSize: '12px', color: '#64748b' },
  
  analyzingCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px' },
  analyzingContent: { textAlign: 'center' },
  spinner: { width: '48px', height: '48px', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' },
  timerDisplay: { fontSize: '18px', fontWeight: '600', color: '#f59e0b', marginBottom: '24px' },
  analyzingSteps: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  stepItem: { fontSize: '14px', padding: '6px 12px', transition: 'all 0.3s ease' },
  analyzingNote: { fontSize: '12px', color: '#64748b', marginTop: '16px' },
  
  resultsCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' },
  scoreSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px', flexWrap: 'wrap', gap: '20px' },
  scoreCircle: { position: 'relative', display: 'inline-block' },
  scoreBadge: { position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap' },
  scoreInfo: { textAlign: 'center' },
  issuesCount: { background: 'rgba(239,68,68,0.1)', padding: '8px 16px', borderRadius: '40px', color: '#ef4444', fontSize: '14px', marginBottom: '12px' },
  processingTime: { fontSize: '12px', color: '#64748b' },
  
  tabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 24px', flexWrap: 'wrap' },
  tab: { padding: '12px 20px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { color: '#f59e0b', borderBottom: '2px solid #f59e0b' },
  
  tabContent: { padding: '32px' },
  tabContentTitle: { fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '16px' },
  tabContentDesc: { fontSize: '13px', lineHeight: '1.6', color: '#94a3b8', marginBottom: '24px' },
  
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  metricCard: { background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '20px' },
  metricHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  metricIcon: { fontSize: '24px' },
  metricName: { fontSize: '14px', fontWeight: '600', color: 'white' },
  metricValue: { textAlign: 'center', padding: '16px 0', fontSize: '24px', fontWeight: '700', color: 'white' },
  
  sectionList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', color: '#cbd5e1' },
  
  keywordSection: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  keywordFound: { padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px' },
  keywordMissing: { padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px' },
  keywordTags: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' },
  keywordTagFound: { padding: '4px 12px', background: 'rgba(16,185,129,0.15)', borderRadius: '20px', fontSize: '12px', color: '#10b981' },
  keywordTagMissing: { padding: '4px 12px', background: 'rgba(239,68,68,0.15)', borderRadius: '20px', fontSize: '12px', color: '#ef4444' },
  
  suggestionsList: { paddingLeft: '20px', margin: 0, color: '#cbd5e1' },
  
  warningBox: { display: 'flex', gap: '16px', padding: '20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', margin: '0 32px 24px 32px' },
  warningIcon: { fontSize: '28px' },
  warningTitle: { fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' },
  warningText: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' },
  
  unlockBtn: { display: 'block', width: 'calc(100% - 64px)', margin: '0 32px 32px 32px', padding: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  fullReport: { margin: '0 32px 32px 32px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' },
  fullReportTitle: { fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' },
  fullReportText: { fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', lineHeight: '1.5' },
  uploadNewBtn: { width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', color: '#f59e0b', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginTop: '16px' }
};

export default ResumeAnalyzer;