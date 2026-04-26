import cv2
import numpy as np
import base64
import math

class FaceAnalyzer:
    def __init__(self):
        self.expression_history = []
        self.current_expression = "neutral"
        self.eye_contact_history = []
        
    def analyze_frame(self, frame_base64):
        """Analyze facial expression from frame"""
        try:
            # Decode base64 to image
            img_data = base64.b64decode(frame_base64)
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return None
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Load face cascade classifier
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            
            # Detect faces
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                return {
                    'face_detected': False,
                    'expression': 'unknown',
                    'confidence': 0,
                    'eye_contact': False,
                    'message': 'No face detected'
                }
            
            # Get the first face
            (x, y, w, h) = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Detect eyes
            eyes = eye_cascade.detectMultiScale(face_roi)
            eye_contact = len(eyes) >= 2
            
            # Simple expression detection based on mouth position
            # Get mouth region (lower part of face)
            mouth_roi = frame[y+int(h*0.6):y+h, x:x+w]
            if mouth_roi.size > 0:
                # Calculate average color in mouth region
                avg_color = np.mean(mouth_roi, axis=(0,1))
                # This is simplified - for demo purposes
                
            # For demo, return mock data with face detected
            # Update expression history with some variation
            expressions = ['neutral', 'happy', 'neutral', 'calm', 'focused']
            import random
            mock_expression = random.choice(expressions)
            
            self.expression_history.append(mock_expression)
            if len(self.expression_history) > 30:
                self.expression_history.pop(0)
            
            # Update eye contact history
            self.eye_contact_history.append(eye_contact)
            if len(self.eye_contact_history) > 30:
                self.eye_contact_history.pop(0)
            
            # Calculate eye contact percentage
            eye_contact_percent = sum(self.eye_contact_history[-10:]) / 10 if self.eye_contact_history else 0
            
            return {
                'face_detected': True,
                'expression': mock_expression,
                'confidence': 0.85,
                'eye_contact': eye_contact,
                'eye_contact_percent': round(eye_contact_percent * 100),
                'features': {
                    'face_x': int(x),
                    'face_y': int(y),
                    'face_width': int(w),
                    'face_height': int(h)
                },
                'emotions': {
                    'happy': 30,
                    'sad': 10,
                    'surprised': 5,
                    'angry': 5,
                    'neutral': 50
                },
                'message': f'Face detected: {mock_expression}'
            }
            
        except Exception as e:
            print(f"Face analysis error: {e}")
            return {
                'face_detected': False,
                'expression': 'error',
                'confidence': 0,
                'eye_contact': False,
                'message': str(e)
            }
    
    def get_expression_emoji(self, expression):
        """Get emoji for expression"""
        emojis = {
            'happy': '😊',
            'neutral': '😐', 
            'sad': '😔',
            'surprised': '😲',
            'angry': '😠',
            'calm': '😌',
            'focused': '🤔',
            'unknown': '❓',
            'error': '⚠️'
        }
        return emojis.get(expression, '😐')
    
    def get_expression_color(self, expression):
        """Get color for expression"""
        colors = {
            'happy': '#10b981',
            'neutral': '#94a3b8',
            'sad': '#3b82f6',
            'surprised': '#f59e0b',
            'angry': '#ef4444',
            'calm': '#06b6d4',
            'focused': '#8b5cf6'
        }
        return colors.get(expression, '#64748b')
    
    def get_expression_advice(self, expression):
        """Get advice based on expression"""
        advice = {
            'happy': "Great! You're showing positive engagement.",
            'neutral': "Try to show more expression and enthusiasm.",
            'sad': "You seem down. Try to smile more during the interview.",
            'surprised': "Good engagement! Keep up the energy.",
            'angry': "Try to relax and maintain a calm demeanor.",
            'calm': "Good composure! Stay confident.",
            'focused': "Excellent focus! Keep it up."
        }
        return advice.get(expression, "Maintain good eye contact and smile when appropriate.")

# Create global instance
face_analyzer = FaceAnalyzer()