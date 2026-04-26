import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Results = ({ report, onRestart }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const score = report?.overall_score || 0;
  const band = report?.band || getBandFromScore(score);
  const dimensions = report?.dimensions || getDefaultDimensions(score);
  const feedback = report?.feedback || getDefaultFeedback(score);
  const totalAnswered = report?.total_questions_answered || 0;
  const totalQuestions = report?.total_questions || 0;
  const avgWords = report?.average_answer_length || 0;

  function getBandFromScore(s) {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 55) return 'Fair';
    return 'Needs Improvement';
  }

  function getDefaultDimensions(s) {
    return {
      confidence: { score: Math.min(95, s + 5) },
      professionalism: { score: Math.min(90, s + 3) },
      engagement: { score: Math.max(0, s - 5) },
      clarity: { score: Math.min(88, s + 2) },
      presence: { score: Math.max(0, s - 8) }
    };
  }

  function getDefaultFeedback(s) {
    if (s >= 85) {
      return [
        '🎉 Excellent performance! Outstanding answers.',
        '📝 Well-structured responses with great examples.',
        '💪 Strong communication and confidence displayed.',
        `📊 Average answer length: ${avgWords} words - Excellent detail!`
      ];
    } else if (s >= 70) {
      return [
        '👍 Good performance! Solid understanding shown.',
        '📝 Answers were clear and well-structured.',
        '💡 Add more specific examples to strengthen responses.',
        `📊 Average answer length: ${avgWords} words - Good detail.`
      ];
    } else if (s >= 55) {
      return [
        '📚 Fair performance. Room for improvement.',
        '💡 Focus on providing more detailed answers with examples.',
        '🎯 Use the STAR method for behavioral questions.',
        `📊 Average answer length: ${avgWords} words - Could be more detailed.`
      ];
    } else {
      return [
        '⚠️ Needs improvement. More preparation required.',
        '📚 Practice providing complete, detailed answers.',
        '💡 Aim for at least 30-50 words per answer.',
        `📊 Average answer length: ${avgWords} words - Too brief.`
      ];
    }
  }

  const getScoreColor = (s) => {
    if (s >= 85) return '#10b981';
    if (s >= 70) return '#f59e0b';
    if (s >= 55) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGradient}></div>
      
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Your Results</h1>
          <p style={styles.subtitle}>AI-powered interview analysis complete</p>
        </div>

        {/* Score Circle */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={styles.scoreContainer}
        >
          <div style={styles.scoreCircle}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12"/>
              <circle 
                cx="90" cy="90" r="80" 
                fill="none" 
                stroke={getScoreColor(score)} 
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={animate ? 2 * Math.PI * 80 * (1 - score / 100) : 2 * Math.PI * 80}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
              <text x="90" y="85" textAnchor="middle" fill={getScoreColor(score)} fontSize="42" fontWeight="bold">{score}</text>
              <text x="90" y="110" textAnchor="middle" fill="#64748b" fontSize="14">out of 100</text>
            </svg>
            <div style={{ ...styles.bandBadge, background: getScoreColor(score) + '20', color: getScoreColor(score), borderColor: getScoreColor(score) }}>
              {band}
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.statsCard}
        >
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📝</span>
              <div>
                <div style={styles.statValue}>{totalAnswered}/{totalQuestions}</div>
                <div style={styles.statLabel}>Questions Answered</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📊</span>
              <div>
                <div style={styles.statValue}>{avgWords}</div>
                <div style={styles.statLabel}>Avg Words/Answer</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dimension Scores */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.dimensionsContainer}
        >
          <h3 style={styles.sectionTitle}>Performance Metrics</h3>
          <div style={styles.dimensionsGrid}>
            {Object.entries(dimensions).map(([key, val], index) => (
              <motion.div 
                key={key} 
                style={styles.dimensionCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div style={styles.dimensionHeader}>
                  <span style={styles.dimensionIcon}>
                    {key === 'confidence' && '⚡'}
                    {key === 'professionalism' && '◈'}
                    {key === 'engagement' && '◎'}
                    {key === 'clarity' && '▲'}
                    {key === 'presence' && '●'}
                  </span>
                  <span style={styles.dimensionName}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span style={{ ...styles.dimensionScore, color: getScoreColor(val.score) }}>{val.score}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${val.score}%`, background: getScoreColor(val.score) }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.feedbackContainer}
        >
          <h3 style={styles.sectionTitle}>📝 Feedback & Recommendations</h3>
          <div style={styles.feedbackList}>
            {feedback.map((item, i) => (
              <div key={i} style={styles.feedbackItem}>
                <span style={styles.feedbackIcon}>✓</span>
                <span style={styles.feedbackText}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={styles.actionContainer}
        >
          <button style={styles.restartBtn} onClick={onRestart}>
            <span>🎯</span> Start New Interview
            <span style={styles.btnArrow}>→</span>
          </button>
        </motion.div>
      </div>

      <style>{`
        button:hover .btn-arrow {
          transform: translateX(5px);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245,158,11,0.3);
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0c15, #0f1222)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  bgGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.08), transparent 50%)',
    pointerEvents: 'none'
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px 60px',
    position: 'relative',
    zIndex: 10
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff, #f59e0b)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  scoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px'
  },
  scoreCircle: {
    position: 'relative',
    textAlign: 'center'
  },
  bandBadge: {
    position: 'absolute',
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid',
    whiteSpace: 'nowrap'
  },
  statsCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '32px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  statsGrid: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statIcon: {
    fontSize: '32px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white'
  },
  statLabel: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  dimensionsContainer: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '20px'
  },
  dimensionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  dimensionCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '16px'
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  dimensionIcon: {
    fontSize: '18px'
  },
  dimensionName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    textTransform: 'capitalize'
  },
  dimensionScore: {
    fontSize: '18px',
    fontWeight: '700'
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s ease-out'
  },
  feedbackContainer: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  feedbackItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px'
  },
  feedbackIcon: {
    width: '24px',
    height: '24px',
    background: 'rgba(16,185,129,0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#10b981'
  },
  feedbackText: {
    flex: 1,
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.5'
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  restartBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnArrow: {
    transition: 'transform 0.2s'
  }
};

export default Results;