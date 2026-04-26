import React, { useState, useEffect } from 'react';

export default function Profile({ user, onLogout, onBackToSetup }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div className="gradient-bg" />
      <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header with back button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button 
            className="btn btn-secondary" 
            onClick={onBackToSetup}
            style={{ padding: '8px 16px' }}
          >
            ← Back to Setup
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleLogout}
            style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
          >
            Logout
          </button>
        </div>

        {/* Profile Info */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>👤</div>
          <h2>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>

        <hr style={{ borderColor: 'var(--border)', marginBottom: 24 }} />

        {/* Interview History */}
        <h3 style={{ marginBottom: 16 }}>📜 Interview History</h3>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-elevated)', borderRadius: 12 }}>
            <p>No interviews taken yet.</p>
            <button className="btn btn-primary" onClick={onBackToSetup} style={{ marginTop: 16 }}>
              Start Your First Interview →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((h, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{h.role}</strong>
                    <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'var(--amber-glow)', color: 'var(--amber)' }}>
                      {h.difficulty}
                    </span>
                  </div>
                  <div>
                    Score: <span style={{ fontSize: 20, fontWeight: 700, color: h.score >= 70 ? '#10b981' : h.score >= 50 ? '#f59e0b' : '#ef4444' }}>{h.score}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {new Date(h.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}