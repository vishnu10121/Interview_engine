import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when switching between login and signup
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      
      if (!isLogin) {
        setSuccess(`🎉 Welcome ${name}! Account created successfully.`);
        setTimeout(() => {
          onLogin(data.user);
        }, 1500);
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={styles.toastSuccess}
          >
            <span style={styles.toastIcon}>✅</span>
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>⚡</div>
          <h1 style={styles.logoText}>Interview<span style={{ color: '#f59e0b' }}>Engine</span></h1>
        </div>

        <div style={styles.tabSwitcher}>
          <button 
            style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <div style={styles.error}>{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div style={styles.divider}>
          <span>or</span>
        </div>

        <button style={styles.googleBtn} onClick={() => window.location.href='https://interview-engine-1.onrender.com/api/auth/google/login'}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={styles.googleIcon} />
          Continue with Google
        </button>

        <div style={styles.switchText}>
          {isLogin ? (
            <p>Don't have an account? <button onClick={() => setIsLogin(false)} style={styles.switchBtn}>Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setIsLogin(true)} style={styles.switchBtn}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
    padding: '20px',
    position: 'relative'
  },
  toastSuccess: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#10b981',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  toastIcon: {
    fontSize: '18px'
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    borderRadius: '32px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logoIcon: {
    fontSize: '48px',
    marginBottom: '8px'
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white'
  },
  tabSwitcher: {
    display: 'flex',
    gap: '12px',
    background: 'rgba(255,255,255,0.05)',
    padding: '6px',
    borderRadius: '60px',
    marginBottom: '32px'
  },
  tab: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '60px',
    color: '#94a3b8',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tabActive: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#0f172a'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#ef4444',
    marginBottom: '16px',
    textAlign: 'center',
    fontSize: '13px'
  },
  divider: {
    textAlign: 'center',
    margin: '24px 0',
    position: 'relative',
    color: '#64748b',
    fontSize: '13px'
  },
  googleBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '40px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  googleIcon: {
    width: '20px',
    height: '20px'
  },
  switchText: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#64748b',
    fontSize: '13px'
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#f59e0b',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default Login;