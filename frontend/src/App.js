import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import Interview from './components/Interview';
import Results from './components/Results';
import Profile from './components/Profile';
import MobileBlock from './components/MobileBlock';

export const VIEWS = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  SETUP: 'setup',
  INTERVIEW: 'interview',
  RESULTS: 'results',
  PROFILE: 'profile',
  MOBILE_BLOCK: 'mobile_block'
};

// Function to check if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
};

export default function App() {
  const [view, setView] = useState(VIEWS.LOGIN);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device on mount
  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    if (mobile) {
      setView(VIEWS.MOBILE_BLOCK);
    }
  }, []);

  // Check on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && view !== VIEWS.LOGIN && view !== VIEWS.MOBILE_BLOCK) {
        setView(VIEWS.MOBILE_BLOCK);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isMobile) {
      fetch('https://interview-engine-1.onrender.com/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
          setView(VIEWS.DASHBOARD);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, [isMobile]);

  // Google OAuth callback handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token && !isMobile) {
      localStorage.setItem('token', token);
      fetch('https://interview-engine-1.onrender.com/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
          setView(VIEWS.SETUP);
          window.history.replaceState({}, document.title, '/');
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, [isMobile]);

  const handleLogin = (userData) => {
    setUser(userData);
    setView(VIEWS.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView(VIEWS.LOGIN);
  };

  const handleStartInterview = () => {
    if (isMobile) {
      setView(VIEWS.MOBILE_BLOCK);
    } else {
      setView(VIEWS.SETUP);
    }
  };

  const handleSessionCreated = (sessionData) => {
    if (isMobile) {
      setView(VIEWS.MOBILE_BLOCK);
    } else {
      setSession(sessionData);
      setView(VIEWS.INTERVIEW);
    }
  };

  const handleInterviewComplete = (reportData) => {
    setReport(reportData);
    setView(VIEWS.RESULTS);
  };

  const handleRestart = () => {
    setSession(null);
    setReport(null);
    setView(VIEWS.DASHBOARD);
  };

  const handleGoToProfile = () => setView(VIEWS.PROFILE);
  const handleBackToSetup = () => setView(VIEWS.SETUP);
  const handleGoToDashboard = () => setView(VIEWS.DASHBOARD);
  const handleExitMobile = () => {
    setView(VIEWS.LOGIN);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // If mobile, show block screen
  if (view === VIEWS.MOBILE_BLOCK) {
    return <MobileBlock onExit={handleExitMobile} />;
  }

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        {view === VIEWS.LOGIN && (
          <motion.div
            key="login"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        )}

        {view === VIEWS.DASHBOARD && (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              onStartInterview={handleStartInterview}
            />
          </motion.div>
        )}

        {view === VIEWS.SETUP && (
          <motion.div
            key="setup"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Setup 
              onSessionCreated={handleSessionCreated}
              user={user}
              onGoToProfile={handleGoToProfile}
              onLogout={handleLogout}
              onGoToDashboard={handleGoToDashboard}
            />
          </motion.div>
        )}

        {view === VIEWS.INTERVIEW && session && (
          <motion.div
            key="interview"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Interview session={session} onComplete={handleInterviewComplete} />
          </motion.div>
        )}

        {view === VIEWS.RESULTS && report && (
          <motion.div
            key="results"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Results report={report} onRestart={handleRestart} />
          </motion.div>
        )}

        {view === VIEWS.PROFILE && (
          <motion.div
            key="profile"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Profile user={user} onLogout={handleLogout} onBackToSetup={handleBackToSetup} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}