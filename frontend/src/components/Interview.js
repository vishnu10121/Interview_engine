import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as faceapi from 'face-api.js';

// Make sure you have these files inside /public/models/
// (downloaded from https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
// Required files:
//   tiny_face_detector_model-weights_manifest.json
//   tiny_face_detector_model-shard1
//   face_expression_model-weights_manifest.json
//   face_expression_model-shard1
//   face_landmark_68_tiny_model-weights_manifest.json
//   face_landmark_68_tiny_model-shard1

const MODEL_URL = '/models';

export default function Interview({ session, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(session.duration_seconds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelLoadFailed, setModelLoadFailed] = useState(false);

  // Real expression state (will fallback to mock if models fail)
  const [feedback, setFeedback] = useState({
    expression: 'neutral',
    posture: 'upright',
    eye_contact: true,
    confidence: 0,
    faceDetected: true,
  });

  const videoRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const isSubmittedRef = useRef(false);
  const mockIntervalRef = useRef(null);

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const wordCount = (answers[currentQuestion?.id] || '').trim().split(/\s+/).filter(w => w).length;
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // ─── Load face-api models with timeout fallback ───
  useEffect(() => {
    let isMounted = true;
    const loadTimeout = setTimeout(() => {
      if (isMounted && !modelsLoaded) {
        console.warn('Model loading timeout – switching to mock mode');
        setModelLoadFailed(true);
        setModelsLoaded(false);
        startMockFeedback();
      }
    }, 5000);

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (isMounted) {
          setModelsLoaded(true);
          setModelLoadFailed(false);
          console.log('✅ Face-api models loaded from local folder');
          // Stop mock if running
          if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
        }
      } catch (err) {
        console.error('❌ Model load error:', err);
        if (isMounted) {
          setModelLoadFailed(true);
          setModelsLoaded(false);
          startMockFeedback();
        }
      }
    };
    loadModels();

    return () => {
      isMounted = false;
      clearTimeout(loadTimeout);
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, []);

  const startMockFeedback = () => {
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    mockIntervalRef.current = setInterval(() => {
      const expressions = ['happy', 'neutral', 'focused', 'calm', 'thinking'];
      const postures = ['upright', 'good', 'proper'];
      setFeedback({
        expression: expressions[Math.floor(Math.random() * expressions.length)],
        posture: postures[Math.floor(Math.random() * postures.length)],
        eye_contact: Math.random() > 0.3,
        confidence: Math.floor(Math.random() * 30) + 60,
        faceDetected: true,
      });
    }, 3000);
  };

  // ─── Timer ───
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !isSubmittedRef.current) handleSubmit();
  }, [timeLeft]);

  // ─── Real expression detection (only if models loaded) ───
  const detectExpression = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;
    if (!modelsLoaded || modelLoadFailed) return;

    try {
      const result = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceExpressions()
        .withFaceLandmarks(true);

      if (!result) {
        setFeedback(prev => ({ ...prev, faceDetected: false, expression: 'not in frame' }));
        return;
      }

      const expressions = result.expressions;
      const sorted = Object.entries(expressions).sort(([, a], [, b]) => b - a);
      const topExpression = sorted[0][0];
      const confidence = Math.round(sorted[0][1] * 100);

      // Eye contact estimation
      const landmarks = result.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const eyeCenter = (
        leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length +
        rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length
      ) / 2;
      const videoWidth = videoRef.current.videoWidth || 640;
      const deviation = Math.abs(eyeCenter - videoWidth / 2) / (videoWidth / 2);
      const hasEyeContact = deviation < 0.35;

      // Posture estimation
      const box = result.detection.box;
      const videoHeight = videoRef.current.videoHeight || 480;
      const videoArea = videoWidth * videoHeight;
      const faceArea = box.width * box.height;
      const faceSizeRatio = faceArea / videoArea;
      const faceCenterY = box.y + box.height / 2;
      const upperHalf = faceCenterY < videoHeight * 0.55;
      let posture = 'good';
      if (faceSizeRatio < 0.04) posture = 'too far';
      else if (faceSizeRatio > 0.45) posture = 'too close';
      else if (!upperHalf) posture = 'slouching';
      else posture = 'upright';

      setFeedback({
        expression: topExpression,
        posture,
        eye_contact: hasEyeContact,
        confidence,
        faceDetected: true,
      });
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  // ─── Stop camera ───
  const stopCamera = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setIsRequesting(false);
  };

  // ─── Start camera ───
  const startCamera = async () => {
    if (isSubmittedRef.current) return;
    if (cameraActive || isRequesting) return;
    setIsRequesting(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      if (isSubmittedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        setIsRequesting(false);
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setCameraError(null);

        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

        frameIntervalRef.current = setInterval(captureAndSendFrame, 3000);
        // Start detection only if models loaded, else mock already running
        if (modelsLoaded && !modelLoadFailed) {
          detectionIntervalRef.current = setInterval(detectExpression, 800);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Camera access denied');
      setCameraActive(false);
    } finally {
      setIsRequesting(false);
    }
  };

  // Restart detection when models load after camera is active
  useEffect(() => {
    if (modelsLoaded && !modelLoadFailed && cameraActive) {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = setInterval(detectExpression, 800);
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    }
  }, [modelsLoaded, modelLoadFailed, cameraActive]);

  const captureAndSendFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const token = localStorage.getItem('token');
        try {
          await fetch(`https://interview-engine-1.onrender.com/api/sessions/${session.session_id}/frames`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ frame: base64, timestamp: Date.now() / 1000, question_index: currentIndex })
          });
        } catch (err) { console.error('Frame upload error:', err); }
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.6);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return '#ef4444';
    if (timeLeft <= 300) return '#f59e0b';
    return '#10b981';
  };

  const getExpressionDisplay = () => {
    const map = {
      happy:     { emoji: '😊', label: 'Happy',    color: '#10b981' },
      neutral:   { emoji: '😐', label: 'Neutral',  color: '#94a3b8' },
      surprised: { emoji: '😲', label: 'Surprised',color: '#f59e0b' },
      sad:       { emoji: '😢', label: 'Sad',      color: '#60a5fa' },
      angry:     { emoji: '😠', label: 'Angry',    color: '#ef4444' },
      fearful:   { emoji: '😨', label: 'Nervous',  color: '#a78bfa' },
      disgusted: { emoji: '😒', label: 'Disgusted',color: '#fb923c' },
      focused:   { emoji: '🤔', label: 'Focused',  color: '#8b5cf6' },
      calm:      { emoji: '😌', label: 'Calm',     color: '#06b6d4' },
      thinking:  { emoji: '🤔', label: 'Thinking', color: '#8b5cf6' },
    };
    return map[feedback.expression] || { emoji: '🔍', label: feedback.expression, color: '#94a3b8' };
  };

  const updateAnswer = (text) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: text }));
  const handleNext = () => { if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1); };
  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

  const handleSubmit = async () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitting(true);
    stopCamera();

    const textResponses = Object.entries(answers).map(([id, ans]) => ({
      question_index: questions.findIndex(q => q.id === id),
      answer: ans
    }));
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://interview-engine-1.onrender.com/api/sessions/${session.session_id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text_responses: textResponses })
      });
      const report = await res.json();
      onComplete(report);
    } catch (err) {
      alert('Failed to submit. Try again.');
      isSubmittedRef.current = false;
      setIsSubmitting(false);
      startCamera();
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const exprDisplay = getExpressionDisplay();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>Interview<span style={{ color: '#f59e0b' }}>Engine</span></span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userBadge}>
            <span style={styles.avatar}>{session.candidate?.charAt(0)}</span>
            <span>{session.candidate}</span>
            <span style={styles.roleTag}>{session.role}</span>
          </div>
          <div style={{ ...styles.timer, color: getTimerColor() }}>⏱️ {formatTime(timeLeft)}</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={styles.progressWrapper}>
        <div style={styles.progressBar}>
          <motion.div
            className="progress-fill"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={styles.mainGrid}>
        {/* Left: Webcam */}
        <div style={styles.webcamCard}>
          <div style={styles.cardHeader}>
            <span>📷 Live Feed</span>
            <div style={styles.liveDot}></div>
          </div>
          <div style={styles.webcamContainer}>
            {cameraError ? (
              <div style={styles.errorPlaceholder}>
                <div>📷</div>
                <p>Camera access needed</p>
                <button onClick={startCamera} style={styles.retryBtn}>Try again</button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
                {!cameraActive && (
                  <div style={styles.loadingOverlay}>
                    <div style={styles.spinner}></div>
                    <p>{modelsLoaded ? 'Starting camera...' : 'Loading AI models...'}</p>
                  </div>
                )}
                {cameraActive && (
                  <div style={styles.feedbackBar}>
                    <span style={{ color: exprDisplay.color, fontWeight: 600 }}>
                      {exprDisplay.emoji} {exprDisplay.label}
                      {feedback.faceDetected && feedback.confidence > 0 && (
                        <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: 4 }}>
                          {feedback.confidence}%
                        </span>
                      )}
                    </span>
                    <span style={{ color: feedback.posture === 'upright' || feedback.posture === 'good' ? '#10b981' : '#f59e0b' }}>
                      🧍 {feedback.posture}
                    </span>
                    <span style={{ color: feedback.eye_contact ? '#10b981' : '#ef4444' }}>
                      👁 {feedback.eye_contact ? 'eye contact' : 'look at camera'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Model loading indicator (only show if models are loading but not failed) */}
          {(!modelsLoaded && !modelLoadFailed) && cameraActive && (
            <div style={styles.modelLoadingBanner}>
              <span style={styles.modelSpinner}></span>
              <span>AI expression model loading...</span>
            </div>
          )}
          {modelLoadFailed && cameraActive && (
  <div
    style={{
      ...styles.modelLoadingBanner,
      background: 'rgba(239,68,68,0.1)',
      color: '#ef4444',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}
  >
    <span>Give Good Expression</span>
  </div>
)}
        </div>

        {/* Right: Question & Answer */}
        <div style={styles.questionCard}>
          <div style={styles.cardHeader}>
            <span>📝 Question {currentIndex + 1}</span>
            <span style={styles.wordCount}>{wordCount} words</span>
          </div>
          <div style={styles.questionText}>{currentQuestion.text}</div>
          <textarea
            style={styles.textarea}
            placeholder="Type your answer here... Be specific and use examples (STAR method recommended)."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => updateAnswer(e.target.value)}
            rows={6}
          />
          <div style={styles.buttonGroup}>
            <button style={styles.prevBtn} onClick={handlePrev} disabled={currentIndex === 0}>← Previous</button>
            {!isLast ? (
              <button style={styles.nextBtn} onClick={handleNext}>Next →</button>
            ) : (
              <button style={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Navigator */}
      <div style={styles.navigator}>
        <div style={styles.navTitle}>Questions</div>
        <div style={styles.navGrid}>
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                ...styles.navDot,
                background: answers[q.id] ? '#10b981' : (currentIndex === idx ? '#f59e0b' : 'rgba(255,255,255,0.05)'),
                color: answers[q.id] || currentIndex === idx ? 'white' : '#94a3b8',
                transform: currentIndex === idx ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 4px; }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0c15, #0f1222)', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'rgba(10,12,21,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 20, fontWeight: 700, color: 'white' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 20 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 40, fontSize: 13, color: 'white' },
  avatar: { width: 28, height: 28, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#0f172a' },
  roleTag: { padding: '2px 10px', background: 'rgba(245,158,11,0.2)', borderRadius: 20, fontSize: 11, color: '#f59e0b' },
  timer: { fontFamily: 'monospace', fontSize: 24, fontWeight: 700, letterSpacing: '0.05em' },
  progressWrapper: { position: 'relative', marginTop: 8 },
  progressBar: { height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressText: { position: 'absolute', right: 20, top: -25, fontSize: 12, color: '#64748b' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, padding: '24px 32px', maxWidth: 1400, margin: '0 auto' },
  webcamCard: { background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 14, color: '#94a3b8', fontWeight: 500 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1.5s infinite' },
  webcamContainer: { position: 'relative', background: '#000', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', transform: 'scaleX(-1)', display: 'block' },
  loadingOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'white', fontSize: 14 },
  spinner: { width: 40, height: 40, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorPlaceholder: { textAlign: 'center', color: '#94a3b8', padding: 20 },
  retryBtn: { marginTop: 12, padding: '8px 20px', background: '#f59e0b', border: 'none', borderRadius: 30, color: '#0f172a', cursor: 'pointer' },
  feedbackBar: { position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 12, justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: 40, fontSize: 12, color: 'white', flexWrap: 'wrap' },
  modelLoadingBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(245,158,11,0.1)', fontSize: 12, color: '#f59e0b', borderTop: '1px solid rgba(245,158,11,0.2)' },
  modelSpinner: { width: 12, height: 12, border: '2px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },
  questionCard: { background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', flexDirection: 'column' },
  wordCount: { fontSize: 12, color: '#64748b' },
  questionText: { fontSize: 20, lineHeight: 1.5, color: '#e2e8f0', margin: '16px 0 24px' },
  textarea: { width: '100%', padding: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: 'white', fontSize: 14, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit' },
  buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  prevBtn: { padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 40, color: '#cbd5e1', cursor: 'pointer', transition: '0.2s' },
  nextBtn: { padding: '12px 28px', background: 'rgba(245,158,11,0.15)', border: 'none', borderRadius: 40, color: '#f59e0b', cursor: 'pointer' },
  submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 40, color: 'white', cursor: 'pointer', fontWeight: 600 },
  navigator: { background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '16px 24px', margin: '0 32px 24px' },
  navTitle: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  navGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  navDot: { width: 36, height: 36, borderRadius: 12, fontSize: 13, fontWeight: 500, border: 'none', transition: 'all 0.2s', cursor: 'pointer' }
};