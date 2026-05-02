import React, { useRef, useEffect, useState } from 'react';

const WebcamStream = ({ sessionId, questionIndex, active }) => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const streamRef = useRef(null);

  // Simple camera start function
  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          setCameraError(null);
          console.log("Camera started successfully!");
          
          // Start sending frames
          sendFrames();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(err.message);
      setCameraActive(false);
    }
  };

  // Send frames to backend
  const sendFrames = () => {
    setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4 && cameraActive) {
        captureAndSend();
      }
    }, 3000);
  };

  const captureAndSend = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`https://interview-engine-1.onrender.com/api/sessions/${sessionId}/frames`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              frame: base64, 
              timestamp: Date.now() / 1000, 
              question_index: questionIndex 
            })
          });
          const data = await res.json();
          setFeedback(data);
        } catch (err) {
          console.error("Upload error:", err);
        }
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.7);
  };

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (cameraError) {
    return (
      <div style={styles.errorBox}>
        <div style={styles.errorIcon}>📷</div>
        <p>Camera Error: {cameraError}</p>
        <button onClick={startCamera} style={styles.retryBtn}>Retry Camera</button>
        <div style={styles.demoMode}>
          <p>Demo Mode Active</p>
          <div>😐 neutral | 🧍 upright | 👁 contact</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={styles.video}
      />
      {!cameraActive && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading camera...</p>
        </div>
      )}
      {feedback && (
        <div style={styles.feedback}>
          <span>😊 {feedback.expression || 'neutral'}</span>
          <span>🧍 {feedback.posture || 'upright'}</span>
          <span>👁 {feedback.eye_contact ? 'Contact' : 'No contact'}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#000',
    minHeight: '250px'
  },
  video: {
    width: '100%',
    transform: 'scaleX(-1)',
    display: 'block'
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: '#f59e0b',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '12px'
  },
  errorBox: {
    padding: '30px',
    textAlign: 'center',
    background: '#1a1f2a',
    borderRadius: '12px',
    color: '#94a3b8'
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  retryBtn: {
    marginTop: '16px',
    padding: '8px 20px',
    background: '#f59e0b',
    border: 'none',
    borderRadius: '20px',
    color: '#0f172a',
    cursor: 'pointer'
  },
  demoMode: {
    marginTop: '20px',
    padding: '12px',
    background: 'rgba(245,158,11,0.1)',
    borderRadius: '8px',
    fontSize: '12px'
  },
  feedback: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    right: '10px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'white'
  }
};

// Add animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default WebcamStream;