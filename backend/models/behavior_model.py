import cv2
import numpy as np
from typing import Tuple
import logging
from collections import deque

logger = logging.getLogger(__name__)

class BehaviorAnalyzer:
    """
    Analyzes behavioral indicators: eye contact, speaking (lip motion)
    """
    
    def __init__(self):
        try:
            import mediapipe as mp
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5
            )
            self.initialized = True
            
            # For lip motion tracking
            self.lip_motion_history = deque(maxlen=10)
            logger.info("Behavior analyzer initialized")
        except Exception as e:
            logger.error(f"Failed to initialize behavior analyzer: {e}")
            self.initialized = False
    
    def detect_eye_contact(self, frame: np.ndarray) -> bool:
        """
        Detect if candidate is making eye contact
        Returns: True if eye contact detected
        """
        if not self.initialized:
            return False
        
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return False
            
            landmarks = results.multi_face_landmarks[0]
            
            # Eye landmarks for gaze estimation
            # Left eye: 33, 133, 157, 158, 159, 160, 161, 173
            # Right eye: 362, 263, 287, 288, 289, 290, 291, 380
            
            # Calculate iris/pupil position relative to eye corners
            left_eye_outer = landmarks.landmark[33]
            left_eye_inner = landmarks.landmark[133]
            right_eye_outer = landmarks.landmark[362]
            right_eye_inner = landmarks.landmark[263]
            
            # Simplified: If face is centered and eyes are visible, assume eye contact
            # In production, use gaze estimation model
            face_centered = 0.4 < landmarks.landmark[1].x < 0.6
            
            return face_centered
            
        except Exception:
            return False
    
    def detect_speaking(self, frame: np.ndarray) -> bool:
        """
        Detect if candidate is speaking based on lip motion
        Returns: True if speaking detected
        """
        if not self.initialized:
            return False
        
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return False
            
            landmarks = results.multi_face_landmarks[0]
            
            # Lip landmarks
            # Upper lip: 13, 14
            # Lower lip: 17, 18, 19, 20
            mouth_top = landmarks.landmark[13]
            mouth_bottom = landmarks.landmark[14]
            
            # Calculate mouth opening distance
            mouth_open = abs(mouth_top.y - mouth_bottom.y)
            
            # Track motion over time
            self.lip_motion_history.append(mouth_open)
            
            # Speaking if mouth opening > threshold OR significant motion
            if len(self.lip_motion_history) >= 5:
                motion = max(self.lip_motion_history) - min(self.lip_motion_history)
                is_speaking = mouth_open > 0.02 or motion > 0.015
                return is_speaking
            
            return mouth_open > 0.025
            
        except Exception:
            return False