import React, { useState, useEffect } from 'react';
import ResumeAnalyzer from './ResumeAnalyzer';
import PlacementPortal from './PlacementPortal';

const Dashboard = ({ user, onLogout, onStartInterview }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    bestScore: 0,
    totalTimeSpent: 0
  });

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Check if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth <= 768;
  };

  const fetchInterviewHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://interview-engine-1.onrender.com/api/auth/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInterviewHistory(data);
      
      if (data.length > 0) {
        const scores = data.map(item => item.score);
        const totalInterviews = data.length;
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalInterviews);
        const bestScore = Math.max(...scores);
        setStats({
          totalInterviews,
          avgScore,
          bestScore,
          totalTimeSpent: totalInterviews * 20
        });
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const handleMenuClick = (menu) => {
    // Check for mobile device
    if (isMobileDevice() && (menu === 'placement' || menu === 'resume')) {
      setShowMobileWarning(true);
      setTimeout(() => setShowMobileWarning(false), 3000);
      return;
    }
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const handleNewInterview = () => {
    if (isMobileDevice()) {
      setShowMobileWarning(true);
      setTimeout(() => setShowMobileWarning(false), 3000);
      return;
    }
    onStartInterview();
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getScoreBand = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Warning Toast */}
      {showMobileWarning && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          zIndex: 2000,
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          animation: 'fadeInOut 3s ease'
        }}>
          ⚠️ This feature is only available on Desktop/Laptop
        </div>
      )}

      {/* Mobile Menu Toggle Button */}
      <button 
        className="sidebar-toggle-mobile"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1001,
          background: '#f59e0b',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'none',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#0f172a'
        }}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon-svg">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L4 14L20 24L36 14L20 4Z" stroke="#f59e0b" strokeWidth="2" fill="none"/>
              <path d="M4 24L20 34L36 24" stroke="#f59e0b" strokeWidth="2" fill="none"/>
              <path d="M4 19L20 29L36 19" stroke="#f59e0b" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="19" r="3" fill="#f59e0b"/>
            </svg>
          </div>
          <span className="logo-text">Interview<span>Engine</span></span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeMenu === 'resume' ? 'active' : ''}`}
            onClick={() => handleMenuClick('resume')}
          >
            <span className="nav-icon">📄</span>
            <span>Resume & ATS</span>
          </button>
          <button 
            className={`nav-item ${activeMenu === 'placement' ? 'active' : ''}`}
            onClick={() => handleMenuClick('placement')}
          >
            <span className="nav-icon">🏢</span>
            <span>Placement Portal</span>
          </button>
          <button 
            className={`nav-item ${activeMenu === 'history' ? 'active' : ''}`}
            onClick={() => handleMenuClick('history')}
          >
            <span className="nav-icon">📜</span>
            <span>Interview History</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name?.split(' ')[0] || 'User'}</span>
              <span className="user-email">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {activeMenu === 'dashboard' && (
          <>
            <header className="dashboard-header">
              <div className="header-title">
                <h1>Overview</h1>
                <p>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</p>
              </div>
              <button className="new-interview-btn" onClick={handleNewInterview}>
                <span>+</span> New Interview
              </button>
            </header>

            <div className="stats-grid">
              <div className="stat-card" style={{ borderTopColor: '#10b981' }}>
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-label">Total Interviews</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>{stats.totalInterviews}</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderTopColor: '#f59e0b' }}>
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <span className="stat-label">Average Score</span>
                  <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.avgScore}%</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderTopColor: '#3b82f6' }}>
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <span className="stat-label">Best Score</span>
                  <span className="stat-value" style={{ color: '#3b82f6' }}>{stats.bestScore}%</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderTopColor: '#8b5cf6' }}>
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <span className="stat-label">Time Spent</span>
                  <span className="stat-value" style={{ color: '#8b5cf6' }}>{stats.totalTimeSpent} min</span>
                </div>
              </div>
            </div>

            <div className="ai-feature-card">
              <div className="ai-icon">🤖</div>
              <div className="ai-content">
                <h3>AI-Powered Interview Analysis</h3>
                <p>
                  Implemented computer vision and machine learning techniques to evaluate facial expressions, 
                  posture, and communication confidence during mock interview sessions.
                </p>
              </div>
            </div>

            <div className="recent-section">
              <div className="section-header">
                <h2>Recent Interviews</h2>
              </div>
              {interviewHistory.length === 0 ? (
                <div className="empty-state">
                  <p>No interviews yet. Start your first interview!</p>
                </div>
              ) : (
                <div className="recent-list">
                  {interviewHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="recent-item">
                      <div className="recent-info">
                        <span className="recent-role">{item.role}</span>
                        <span className="recent-badge" style={{ backgroundColor: getDifficultyColor(item.difficulty) }}>
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="recent-score" style={{ color: getScoreColor(item.score) }}>
                        {item.score}%
                      </div>
                      <div className="recent-date">{formatDate(item.date)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeMenu === 'resume' && (
          <ResumeAnalyzer user={user} />
        )}

        {activeMenu === 'placement' && (
          <PlacementPortal user={user} onLogout={onLogout} onStartInterview={onStartInterview} />
        )}

        {activeMenu === 'history' && (
          <div className="history-view">
            <header className="dashboard-header">
              <div className="header-title">
                <h1>Interview History</h1>
                <p>View all your past interview performances</p>
              </div>
            </header>

            {loading ? (
              <div className="loading-spinner">Loading interview history...</div>
            ) : interviewHistory.length === 0 ? (
              <div className="empty-history">
                <p>No interviews taken yet.</p>
                <button className="start-btn" onClick={onStartInterview}>Start Your First Interview →</button>
              </div>
            ) : (
              <div className="history-grid">
                {interviewHistory.map((item, index) => (
                  <div key={index} className="history-card">
                    <div className="history-header">
                      <span className="history-role">{item.role}</span>
                      <span className="history-badge" style={{ backgroundColor: getDifficultyColor(item.difficulty) }}>
                        {item.difficulty}
                      </span>
                    </div>
                    <div className="history-date">{formatDate(item.date)}</div>
                    <div className="history-score">
                      <span>Score:</span>
                      <strong style={{ color: getScoreColor(item.score) }}>{item.score}%</strong>
                    </div>
                    <div className="history-band" style={{ color: getScoreColor(item.score) }}>
                      {getScoreBand(item.score)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        /* Dashboard Container */
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #1e1b4b);
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          90% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }

        /* Sidebar - Fixed Logo */
        .dashboard-sidebar {
          width: 280px;
          background: #0a0c15;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 1000;
          transition: transform 0.3s ease;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* Hide scrollbar */
        .dashboard-sidebar::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }

        /* Logo stays at top */
        .sidebar-logo {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
          position: sticky;
          top: 0;
          background: #0a0c15;
          z-index: 100;
        }

        .logo-icon-svg {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(245, 158, 11, 0.12);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          white-space: nowrap;
        }

        .logo-text span {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0 16px;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 4px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }

        .nav-item.active {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .nav-icon {
          font-size: 20px;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: auto;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: white;
        }

        .user-email {
          font-size: 10px;
          color: #94a3b8;
          word-break: break-all;
        }

        .logout-btn {
          width: 100%;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* Main Content */
        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          padding: 24px 32px;
          overflow-y: auto;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-title h1 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .header-title p {
          font-size: 14px;
          color: #94a3b8;
        }

        .new-interview-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          border-radius: 40px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .new-interview-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-top: 3px solid;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          display: block;
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
        }

        .ai-feature-card {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.05));
          border-radius: 20px;
          padding: 24px;
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .ai-icon {
          font-size: 48px;
        }

        .ai-content h3 {
          font-size: 18px;
          color: #f59e0b;
          margin-bottom: 8px;
        }

        .ai-content p {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .recent-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 18px;
          color: white;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .recent-role {
          font-weight: 500;
          color: white;
        }

        .recent-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          color: white;
        }

        .recent-score {
          font-size: 18px;
          font-weight: 700;
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .history-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .history-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .history-role {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .history-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          color: white;
        }

        .history-date {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .history-score {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #94a3b8;
        }

        .history-score strong {
          font-size: 20px;
          font-weight: 700;
        }

        .empty-history {
          text-align: center;
          padding: 60px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }

        .start-btn {
          margin-top: 16px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          border-radius: 30px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar-toggle-mobile {
            display: block !important;
          }
          
          .dashboard-sidebar {
            transform: translateX(-100%);
            width: 260px;
          }
          
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          
          .sidebar-overlay {
            display: block !important;
          }
          
          .dashboard-main {
            margin-left: 0;
            padding: 70px 16px 20px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .history-grid {
            grid-template-columns: 1fr;
          }
          
          .ai-feature-card {
            flex-direction: column;
            text-align: center;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .new-interview-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .dashboard-main {
            padding: 73px 12px 16px;
          }
          
          .stat-value {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;