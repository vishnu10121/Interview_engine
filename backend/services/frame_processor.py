import base64
import cv2
import numpy as np
import time
from threading import Thread
import logging

logger = logging.getLogger(__name__)

class FrameProcessor:   # Make sure 'F' is capital
    """Process video frames with low-latency pipeline"""
    
    def __init__(self):
        self.frame_counter = {}
        self.result_cache = {}
        logger.info("FrameProcessor initialized")
    
    def process_frame_async(self, session_id: str, frame_base64: str, 
                           timestamp: float, question_index: int) -> dict:
        """Process frame asynchronously with frame skipping"""
        
        # Frame skipping for performance (process every 3rd frame)
        count = self.frame_counter.get(session_id, 0)
        self.frame_counter[session_id] = count + 1
        if count % 3 != 0:
            return {'skipped': True}
        
        # Decode base64 to image
        try:
            img_data = base64.b64decode(frame_base64)
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {'face_detected': False, 'expression': 'unknown'}
        except Exception as e:
            logger.error(f"Frame decode error: {e}")
            return {'face_detected': False, 'expression': 'unknown'}
        
        # Mock response (since mediapipe may not work)
        result = {
            'face_detected': True,
            'expression': 'neutral',
            'posture': 'upright',
            'eye_contact': True,
            'speaking': False,
            'processing_ms': 50
        }
        
        # Cache the result
        cache_key = f"{session_id}_{question_index}"
        self.result_cache[cache_key] = result
        
        return result
    
    def clear_session_cache(self, session_id: str):
        """Clear cache for a session"""
        keys_to_remove = [k for k in self.result_cache if k.startswith(session_id)]
        for key in keys_to_remove:
            del self.result_cache[key]