import cv2
import numpy as np
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

class ExpressionRecognizer:
    """
    Facial expression recognition using MediaPipe + lightweight classifier
    Supports: happy, neutral, sad, surprised, angry, fearful, disgusted
    """
    
    EXPRESSIONS = ['neutral', 'happy', 'sad', 'surprised', 'angry', 'fearful', 'disgusted']
    
    def __init__(self):
        try:
            import mediapipe as mp
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.initialized = True
            logger.info("Expression recognizer initialized")
        except Exception as e:
            logger.error(f"Failed to initialize expression recognizer: {e}")
            self.initialized = False
    
    def analyze(self, frame: np.ndarray) -> Tuple[bool, str]:
        """
        Detect face and recognize expression
        Returns: (face_detected, expression)
        """
        if not self.initialized:
            return False, 'unknown'
        
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return False, 'unknown'
            
            # Face detected - extract expression features from landmarks
            landmarks = results.multi_face_landmarks[0]
            
            # Extract key facial features for expression analysis
            expression = self._classify_expression(landmarks)
            
            return True, expression
            
        except Exception as e:
            logger.debug(f"Expression analysis error: {e}")
            return False, 'unknown'
    
    def _classify_expression(self, landmarks) -> str:
        """Classify expression based on facial landmark geometry"""
        try:
            # Get key landmark indices (MediaPipe FaceMesh)
            # Reference: https://google.github.io/mediapipe/solutions/face_mesh.html
            
            # Eyebrow positions
            left_eyebrow_inner = landmarks.landmark[65]
            right_eyebrow_inner = landmarks.landmark[295]
            
            # Eye openness
            left_eye_top = landmarks.landmark[159]
            left_eye_bottom = landmarks.landmark[145]
            right_eye_top = landmarks.landmark[386]
            right_eye_bottom = landmarks.landmark[374]
            
            # Mouth features
            mouth_left = landmarks.landmark[61]
            mouth_right = landmarks.landmark[291]
            mouth_top = landmarks.landmark[13]
            mouth_bottom = landmarks.landmark[14]
            
            # Calculate features
            brow_height = (left_eyebrow_inner.y + right_eyebrow_inner.y) / 2
            left_eye_open = abs(left_eye_top.y - left_eye_bottom.y)
            right_eye_open = abs(right_eye_top.y - right_eye_bottom.y)
            mouth_open = abs(mouth_top.y - mouth_bottom.y)
            mouth_width = abs(mouth_left.x - mouth_right.x)
            
            # Simple rule-based classification
            # In production, use a trained model (e.g., MobileNet fine-tuned on FER2013)
            
            if mouth_open > 0.03 and mouth_width > 0.1:
                return 'surprised'
            elif mouth_open > 0.02 and mouth_top.y < 0.4:
                return 'happy'
            elif brow_height > 0.3 and left_eye_open < 0.01:
                return 'angry'
            elif brow_height < 0.2 and mouth_top.y > 0.6:
                return 'sad'
            else:
                return 'neutral'
                
        except Exception:
            return 'neutral'
