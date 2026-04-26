import numpy as np
from typing import Dict, List, Any
from collections import Counter
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class InterviewScorer:
    """
    Generates comprehensive interview scoring and feedback
    """
    
    def __init__(self):
        self.weight_config = {
            'confidence': 0.30,
            'professionalism': 0.25,
            'engagement': 0.20,
            'clarity': 0.15,
            'presence': 0.10
        }
    
    def generate_report(self, session: Dict, frames_data: List[Dict]) -> Dict:
        """Generate complete interview report"""
        
        # Calculate dimension scores
        confidence_score = self._calculate_confidence_score(frames_data)
        professionalism_score = self._calculate_professionalism_score(frames_data)
        engagement_score = self._calculate_engagement_score(frames_data)
        clarity_score = self._calculate_clarity_score(session.get('answers', []))
        presence_score = self._calculate_presence_score(frames_data)
        
        dimensions = {
            'confidence': {
                'score': confidence_score,
                'breakdown': self._get_confidence_breakdown(frames_data)
            },
            'professionalism': {
                'score': professionalism_score,
                'breakdown': self._get_professionalism_breakdown(frames_data)
            },
            'engagement': {
                'score': engagement_score,
                'breakdown': self._get_engagement_breakdown(frames_data)
            },
            'clarity': {
                'score': clarity_score,
                'breakdown': self._get_clarity_breakdown(session.get('answers', []))
            },
            'presence': {
                'score': presence_score,
                'breakdown': self._get_presence_breakdown(frames_data)
            }
        }
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(dimensions)
        
        # Determine band
        band = self._get_band(overall_score)
        
        # Generate feedback
        feedback = self._generate_feedback(dimensions, overall_score, frames_data)
        
        # Per-question analysis
        per_question = self._analyze_per_question(session, frames_data)
        
        # Confidence trend
        confidence_trend = self._calculate_confidence_trend(frames_data)
        
        return {
            'candidate': session.get('candidate'),
            'role': session.get('role'),
            'difficulty': session.get('difficulty'),
            'overall_score': overall_score,
            'band': band,
            'dimensions': dimensions,
            'feedback': feedback,
            'per_question': per_question,
            'confidence_trend': confidence_trend,
            'total_frames_analysed': len(frames_data),
            'duration_seconds': session.get('duration_seconds', 0),
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_confidence_score(self, frames: List[Dict]) -> int:
        """Calculate confidence score based on expression and eye contact"""
        if not frames:
            return 0
        
        # Expression weights
        expression_scores = {
            'happy': 100,
            'neutral': 70,
            'surprised': 80,
            'sad': 30,
            'angry': 20,
            'fearful': 25,
            'disgusted': 15,
            'unknown': 50
        }
        
        expression_score = np.mean([
            expression_scores.get(f.get('expression', 'unknown'), 50)
            for f in frames if f.get('face_detected', False)
        ]) if any(f.get('face_detected') for f in frames) else 30
        
        # Eye contact score
        eye_contact_rate = np.mean([
            1 if f.get('eye_contact') else 0
            for f in frames if f.get('face_detected', False)
        ]) if any(f.get('face_detected') for f in frames) else 0
        eye_score = eye_contact_rate * 100
        
        # Combine (60% expression, 40% eye contact)
        return int(expression_score * 0.6 + eye_score * 0.4)
    
    def _calculate_professionalism_score(self, frames: List[Dict]) -> int:
        """Calculate professionalism based on posture"""
        if not frames:
            return 0
        
        posture_scores = {
            'upright': 100,
            'leaning_forward': 75,
            'leaning_back': 60,
            'slouching': 35,
            'unknown': 50
        }
        
        scores = [
            posture_scores.get(f.get('posture', 'unknown'), 50)
            for f in frames
        ]
        
        return int(np.mean(scores)) if scores else 50
    
    def _calculate_engagement_score(self, frames: List[Dict]) -> int:
        """Calculate engagement based on speaking and expression diversity"""
        if not frames:
            return 0
        
        # Speaking engagement
        speaking_rate = np.mean([
            1 if f.get('speaking') else 0
            for f in frames
        ]) if frames else 0
        speaking_score = speaking_rate * 100
        
        # Expression diversity (more diverse = more engaged)
        expressions = [f.get('expression') for f in frames if f.get('face_detected')]
        if expressions:
            unique_expressions = len(set(expressions))
            diversity_score = min(100, unique_expressions * 20)
        else:
            diversity_score = 0
        
        # Combine (50% speaking, 50% expression diversity)
        return int(speaking_score * 0.5 + diversity_score * 0.5)
    
    def _calculate_clarity_score(self, answers: List[Dict]) -> int:
        """Calculate clarity based on answer length and structure"""
        if not answers:
            return 0
        
        scores = []
        for answer_data in answers:
            answer = answer_data.get('answer', '')
            word_count = len(answer.split())
            
            # Ideal response length: 50-200 words
            if 50 <= word_count <= 200:
                length_score = 100
            elif 20 <= word_count < 50:
                length_score = 60
            elif word_count > 200:
                length_score = 80
            else:
                length_score = 30
            
            # Check for STAR method keywords
            star_keywords = ['situation', 'task', 'action', 'result', 'challenge', 'solution', 'implemented']
            has_star = any(keyword in answer.lower() for keyword in star_keywords)
            star_score = 100 if has_star else 50
            
            scores.append((length_score * 0.6 + star_score * 0.4))
        
        return int(np.mean(scores)) if scores else 50
    
    def _calculate_presence_score(self, frames: List[Dict]) -> int:
        """Calculate presence based on face detection consistency"""
        if not frames:
            return 0
        
        face_detected_rate = np.mean([
            1 if f.get('face_detected') else 0
            for f in frames
        ])
        
        return int(face_detected_rate * 100)
    
    def _calculate_overall_score(self, dimensions: Dict) -> int:
        """Calculate weighted overall score"""
        total = 0
        for dim, data in dimensions.items():
            weight = self.weight_config.get(dim, 0.1)
            total += data['score'] * weight
        
        return int(total)
    
    def _get_band(self, score: int) -> str:
        """Get performance band"""
        if score >= 85:
            return 'Excellent'
        elif score >= 70:
            return 'Good'
        elif score >= 55:
            return 'Fair'
        else:
            return 'Needs Improvement'
    
    def _get_confidence_breakdown(self, frames: List[Dict]) -> Dict:
        """Get detailed confidence breakdown"""
        expressions = [f.get('expression') for f in frames if f.get('face_detected')]
        expr_counts = Counter(expressions)
        total = sum(expr_counts.values()) or 1
        
        eye_contact_frames = sum(1 for f in frames if f.get('eye_contact'))
        eye_contact_rate = (eye_contact_frames / len(frames) * 100) if frames else 0
        
        return {
            'dominant_expression': expr_counts.most_common(1)[0][0] if expr_counts else 'unknown',
            'expression_distribution': {k: (v/total)*100 for k, v in expr_counts.items()},
            'eye_contact_rate': round(eye_contact_rate, 1)
        }
    
    def _get_professionalism_breakdown(self, frames: List[Dict]) -> Dict:
        """Get detailed professionalism breakdown"""
        postures = [f.get('posture') for f in frames]
        posture_counts = Counter(postures)
        total = len(postures) or 1
        
        return {
            'posture_distribution': {k: (v/total)*100 for k, v in posture_counts.items()},
            'dominant_posture': posture_counts.most_common(1)[0][0] if posture_counts else 'unknown'
        }
    
    def _get_engagement_breakdown(self, frames: List[Dict]) -> Dict:
        """Get detailed engagement breakdown"""
        speaking_frames = sum(1 for f in frames if f.get('speaking'))
        speaking_rate = (speaking_frames / len(frames) * 100) if frames else 0
        
        return {
            'speaking_rate': round(speaking_rate, 1),
            'total_frames_analyzed': len(frames)
        }
    
    def _get_clarity_breakdown(self, answers: List[Dict]) -> Dict:
        """Get detailed clarity breakdown"""
        word_counts = [len(a.get('answer', '').split()) for a in answers]
        avg_words = np.mean(word_counts) if word_counts else 0
        
        return {
            'average_response_length': round(avg_words, 1),
            'total_responses': len(answers)
        }
    
    def _get_presence_breakdown(self, frames: List[Dict]) -> Dict:
        """Get detailed presence breakdown"""
        face_present = sum(1 for f in frames if f.get('face_detected'))
        face_presence_rate = (face_present / len(frames) * 100) if frames else 0
        
        return {
            'face_presence_rate': round(face_presence_rate, 1),
            'total_frames_analyzed': len(frames)
        }
    
    def _generate_feedback(self, dimensions: Dict, overall_score: int, frames: List[Dict]) -> List[str]:
        """Generate actionable feedback"""
        feedback = []
        
        # Confidence feedback
        conf_score = dimensions['confidence']['score']
        if conf_score < 60:
            feedback.append("Work on maintaining more consistent eye contact with the camera.")
        elif conf_score < 80:
            feedback.append("Good confidence overall. Try to smile more naturally during responses.")
        else:
            feedback.append("Excellent confidence and presence throughout the interview.")
        
        # Professionalism feedback
        prof_score = dimensions['professionalism']['score']
        if prof_score < 60:
            feedback.append("Improve your posture - sit upright and avoid slouching.")
        elif prof_score < 80:
            feedback.append("Your posture is generally good. Stay mindful of leaning tendencies.")
        else:
            feedback.append("Professional posture maintained throughout the session.")
        
        # Engagement feedback
        eng_score = dimensions['engagement']['score']
        if eng_score < 60:
            feedback.append("Increase engagement by speaking more and varying your expressions.")
        elif eng_score < 80:
            feedback.append("Good engagement level. Consider adding more vocal variety.")
        else:
            feedback.append("Highly engaged candidate with excellent expression diversity.")
        
        # Clarity feedback
        clarity_score = dimensions['clarity']['score']
        if clarity_score < 60:
            feedback.append("Provide more detailed, structured answers using the STAR method.")
        elif clarity_score < 80:
            feedback.append("Your answers are clear. Add more specific examples for impact.")
        else:
            feedback.append("Excellent answer structure with relevant examples.")
        
        # Presence feedback
        presence_score = dimensions['presence']['score']
        if presence_score < 70:
            feedback.append("Ensure you remain visible and centered in the camera frame.")
        
        return feedback
    
    def _analyze_per_question(self, session: Dict, frames: List[Dict]) -> List[Dict]:
        """Analyze performance per question"""
        questions = session.get('questions', [])
        answers = session.get('answers', [])
        
        per_question = []
        
        for i, question in enumerate(questions):
            # Get frames for this question
            question_frames = [f for f in frames if f.get('question_index') == i]
            
            # Get answer
            answer_data = next((a for a in answers if a.get('question_index') == i), {})
            answer = answer_data.get('answer', '')
            
            # Calculate metrics
            expressions = [f.get('expression') for f in question_frames if f.get('face_detected')]
            expr_counts = Counter(expressions)
            dominant_expression = expr_counts.most_common(1)[0][0] if expr_counts else 'neutral'
            
            # Posture score
            postures = [f.get('posture') for f in question_frames]
            posture_scores = {'upright': 100, 'leaning_forward': 70, 'leaning_back': 60, 'slouching': 30}
            avg_posture_score = np.mean([posture_scores.get(p, 50) for p in postures]) if postures else 50
            
            # Eye contact rate
            eye_contact_frames = sum(1 for f in question_frames if f.get('eye_contact'))
            eye_contact_rate = (eye_contact_frames / len(question_frames) * 100) if question_frames else 0
            
            per_question.append({
                'question': question.get('text', ''),
                'answer': answer,
                'dominant_expression': dominant_expression,
                'avg_posture_score': round(avg_posture_score, 1),
                'eye_contact_rate': round(eye_contact_rate, 1),
                'frame_count': len(question_frames)
            })
        
        return per_question
    
    def _calculate_confidence_trend(self, frames: List[Dict]) -> str:
        """Calculate confidence trend over the interview"""
        if len(frames) < 10:
            return 'stable'
        
        # Split into first half and second half
        mid = len(frames) // 2
        first_half = frames[:mid]
        second_half = frames[mid:]
        
        # Calculate average confidence for each half
        def avg_confidence(frames_list):
            if not frames_list:
                return 0
            expressions = [f.get('expression') for f in frames_list if f.get('face_detected')]
            expr_scores = {
                'happy': 100, 'neutral': 70, 'surprised': 80,
                'sad': 30, 'angry': 20, 'fearful': 25, 'disgusted': 15
            }
            scores = [expr_scores.get(e, 50) for e in expressions]
            return np.mean(scores) if scores else 50
        
        first_score = avg_confidence(first_half)
        second_score = avg_confidence(second_half)
        
        if second_score > first_score + 10:
            return 'improving'
        elif second_score < first_score - 10:
            return 'declining'
        else:
            return 'stable'