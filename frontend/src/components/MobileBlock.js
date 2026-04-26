import React from 'react';

const MobileBlock = ({ onExit }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📱❌</div>
        <h1 style={styles.title}>Not Available on Mobile</h1>
        <p style={styles.message}>
          Interview assessment and placement portal are only available on <strong>desktop/laptop</strong> devices.
        </p>
        <p style={styles.submessage}>
          Please use a computer with a webcam to take the interview.
        </p>
        <div style={styles.features}>
          <div style={styles.feature}>💻 Desktop Required</div>
          <div style={styles.feature}>🎥 Webcam Needed</div>
          <div style={styles.feature}>⌨️ Keyboard Recommended</div>
        </div>
        <button style={styles.button} onClick={onExit}>
          Exit & Go Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    borderRadius: '32px',
    padding: '48px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: '16px'
  },
  message: {
    fontSize: '16px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '12px'
  },
  submessage: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '24px'
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px'
  },
  feature: {
    padding: '8px 16px',
    background: 'rgba(245,158,11,0.1)',
    borderRadius: '40px',
    fontSize: '13px',
    color: '#f59e0b'
  },
  button: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  }
};

export default MobileBlock;