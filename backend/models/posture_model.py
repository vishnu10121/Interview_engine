import cv2
import numpy as np
from typing import str
import logging

logger = logging.getLogger(__name__)

class PostureDetector:
    """
    Posture detection using MediaPipe Pose
    Detects: upright, slouching, leaning_forward, leaning_back
    """
    
    def __init__(self):
        try:
            import mediapipe as mp
            self.mp_pose = mp.solutions.pose
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.initialized = True
            logger.info("Posture detector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize posture detector: {e}")
            self.initialized = False
    
    def detect(self, frame: np.ndarray) -> str:
        """
        Detect posture from frame
        Returns: 'upright', 'slouching', 'leaning_forward', 'leaning_back', or 'unknown'
        """
        if not self.initialized:
            return 'unknown'
        
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)
            
            if not results.pose_landmarks:
                return 'unknown'
            
            landmarks = results.pose_landmarks.landmark
            
            # Extract key points for posture analysis
            # Shoulders, hips, nose
            left_shoulder = landmarks[11]
            right_shoulder = landmarks[12]
            left_hip = landmarks[23]
            right_hip = landmarks[24]
            nose = landmarks[0]
            
            # Calculate shoulder and hip centers
            shoulder_center_y = (left_shoulder.y + right_shoulder.y) / 2
            hip_center_y = (left_hip.y + right_hip.y) / 2
            shoulder_hip_ratio = shoulder_center_y / hip_center_y if hip_center_y > 0 else 0.5
            
            # Calculate forward lean (nose relative to shoulders)
            nose_x = nose.x
            shoulder_center_x = (left_shoulder.x + right_shoulder.x) / 2
            lean_offset = nose_x - shoulder_center_x
            
            # Classify posture
            if shoulder_hip_ratio < 0.7:  # Shoulders significantly lower than hips
                return 'slouching'
            elif lean_offset > 0.05:  # Leaning forward
                return 'leaning_forward'
            elif lean_offset < -0.05:  # Leaning back
                return 'leaning_back'
            elif 0.7 <= shoulder_hip_ratio <= 0.85:
                return 'upright'
            else:
                return 'unknown'
                
        except Exception as e:
            logger.debug(f"Posture detection error: {e}")
            return 'unknown'
    
    def calculate_posture_score(self, posture: str) -> float:
        """Convert posture to a score (0-100)"""
        scores = {
            'upright': 100,
            'leaning_forward': 70,
            'leaning_back': 60,
            'slouching': 30,
            'unknown': 50
        }
        return scores.get(posture, 50)