import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Setup = ({ onSessionCreated, user, onGoToProfile, onLogout, onGoToDashboard }) => {
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
  { id: 'se', name: 'Software Engineer', icon: '💻', color: '#4285F4' },
  { id: 'ds', name: 'Data Scientist', icon: '📊', color: '#34A853' },
  { id: 'cs', name: 'Cybersecurity', icon: '🔒', color: '#EA4335' },
  { id: 'fs', name: 'Full Stack Developer', icon: '🔄', color: '#8B5CF6' },
  { id: 'gen', name: 'General', icon: '📝', color: '#06B6D4' }
];

  const difficulties = [
    { 
      value: 'easy', 
      label: 'Junior', 
      description: 'Perfect for beginners', 
      questions: '5 basic questions',
      duration: '15 min',
      icon: '🌱',
      color: '#10b981'
    },
    { 
      value: 'medium', 
      label: 'Mid-Level', 
      description: 'For experienced developers', 
      questions: '6 in-depth questions',
      duration: '20 min',
      icon: '⚡',
      color: '#f59e0b'
    },
    { 
      value: 'hard', 
      label: 'Senior', 
      description: 'Challenge yourself', 
      questions: '5 advanced challenges',
      duration: '30 min',
      icon: '🎯',
      color: '#ef4444'
    }
  ];

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Please enter your name');
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://interview-engine-1.onrender.com/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          candidate_name: name, 
          role, 
          difficulty
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSessionCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.bgGradient}></div>
      <div style={styles.bgBlur1}></div>
      <div style={styles.bgBlur2}></div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo} onClick={onGoToDashboard}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>Interview<span style={{ color: '#f59e0b' }}>Engine</span></span>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.profileBtn} onClick={onGoToProfile}>
            <span style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</span>
            <span style={styles.profileName}>{user?.name?.split(' ')[0] || 'Profile'}</span>
          </button>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <span>🚪</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.heroSection}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.title}
          >
            Start New Interview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={styles.subtitle}
          >
            AI-powered assessment with real-time feedback
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.formCard}
        >
          {/* Name Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👤</span>
              Full Name
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>💼</span>
              Target Role
            </label>
            <div style={styles.rolesGrid}>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.name)}
                  style={{
                    ...styles.roleCard,
                    borderColor: role === r.name ? r.color : 'transparent',
                    background: role === r.name ? `${r.color}15` : 'rgba(255,255,255,0.03)'
                  }}
                >
                  <span style={styles.roleIcon}>{r.icon}</span>
                  <span style={styles.roleName}>{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection - Mobile Responsive */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📊</span>
              Difficulty Level
            </label>
            <div style={styles.difficultyGrid}>
              {difficulties.map(d => (
                <motion.div
                  key={d.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty(d.value)}
                  style={{
                    ...styles.difficultyCard,
                    borderColor: difficulty === d.value ? d.color : 'rgba(255,255,255,0.1)',
                    background: difficulty === d.value ? `${d.color}10` : 'rgba(255,255,255,0.03)'
                  }}
                >
                  <div style={styles.difficultyCardLeft}>
                    <span style={styles.difficultyIcon}>{d.icon}</span>
                    <div style={styles.difficultyInfo}>
                      <span style={{ ...styles.difficultyLabel, color: difficulty === d.value ? d.color : 'white' }}>
                        {d.label}
                      </span>
                      <span style={styles.difficultyDesc}>{d.description}</span>
                    </div>
                  </div>
                  <div style={styles.difficultyMeta}>
                    <span style={styles.metaTag}>📝 {d.questions}</span>
                    <span style={styles.metaTag}>⏱️ {d.duration}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            style={styles.startBtn}
          >
            {loading ? (
              <>
                <div style={styles.btnSpinner}></div>
                Starting Interview...
              </>
            ) : (
              <>
                <span>🎤</span>
                Start Interview
                <span style={styles.btnArrow}>→</span>
              </>
            )}
          </motion.button>
        </motion.div>
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
    background: '#0a0c15',
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
  bgBlur1: {
    position: 'fixed',
    top: '-50%',
    right: '-50%',
    width: '80%',
    height: '80%',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05), transparent)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  bgBlur2: {
    position: 'fixed',
    bottom: '-50%',
    left: '-50%',
    width: '80%',
    height: '80%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03), transparent)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '12px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  logoIcon: {
    fontSize: '28px'
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'white'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '40px',
    color: 'white',
    cursor: 'pointer'
  },
  avatar: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600'
  },
  profileName: {
    '@media (maxWidth: 480px)': {
      display: 'none'
    }
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '40px',
    color: '#ef4444',
    cursor: 'pointer'
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px 24px 60px',
    position: 'relative',
    zIndex: 10
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff, #f59e0b)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    marginBottom: '12px',
    '@media (maxWidth: 768px)': {
      fontSize: '32px'
    }
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    '@media (maxWidth: 768px)': {
      fontSize: '14px'
    }
  },
  formCard: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(12px)',
    borderRadius: '32px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '40px',
    '@media (maxWidth: 768px)': {
      padding: '24px'
    }
  },
  inputGroup: {
    marginBottom: '28px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '12px'
  },
  labelIcon: {
    fontSize: '18px'
  },
  inputWrapper: {
    position: 'relative'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    '@media (maxWidth: 768px)': {
      padding: '12px 14px',
      fontSize: '14px'
    }
  },
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    '@media (maxWidth: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px'
    }
  },
  roleCard: {
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '@media (maxWidth: 768px)': {
      padding: '10px',
      flexDirection: 'column',
      gap: '4px'
    }
  },
  roleIcon: {
    fontSize: '20px',
    '@media (maxWidth: 768px)': {
      fontSize: '18px'
    }
  },
  roleName: {
    fontSize: '13px',
    color: 'white',
    '@media (maxWidth: 768px)': {
      fontSize: '11px'
    }
  },
  difficultyGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  difficultyCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexWrap: 'wrap',
    gap: '12px',
    '@media (maxWidth: 480px)': {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  difficultyCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  difficultyIcon: {
    fontSize: '28px'
  },
  difficultyInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  difficultyLabel: {
    fontSize: '16px',
    fontWeight: '600'
  },
  difficultyDesc: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  difficultyMeta: {
    display: 'flex',
    gap: '8px',
    '@media (maxWidth: 480px)': {
      width: '100%',
      justifyContent: 'space-between'
    }
  },
  metaTag: {
    fontSize: '11px',
    color: '#64748b',
    background: 'rgba(255,255,255,0.05)',
    padding: '4px 8px',
    borderRadius: '12px',
    whiteSpace: 'nowrap'
  },
  errorBox: {
    padding: '12px 16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '20px'
  },
  startBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '8px',
    '@media (maxWidth: 768px)': {
      padding: '14px',
      fontSize: '14px'
    }
  },
  btnArrow: {
    transition: 'transform 0.2s'
  },
  btnSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite'
  }
};

export default Setup;