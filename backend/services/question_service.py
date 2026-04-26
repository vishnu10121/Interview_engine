import json
import os
from typing import List, Dict

class QuestionService:
    """Service to manage and serve interview questions"""
    
    def __init__(self, data_path: str = None):
        self.data_path = data_path or os.path.join(os.path.dirname(__file__), '../data/questions.json')
        self.questions_cache = self._load_questions()
    
    def _load_questions(self) -> Dict:
        """Load questions from JSON file"""
        default_questions = {
            "Software Engineer": {
                "easy": [
                    {"id": "SE_E1", "text": "Tell me about your programming experience and favorite technologies."},
                    {"id": "SE_E2", "text": "Describe a recent project you worked on. What was your role?"},
                    {"id": "SE_E3", "text": "How do you approach debugging a complex issue?"},
                    {"id": "SE_E4", "text": "Explain a programming concept you've recently learned."},
                    {"id": "SE_E5", "text": "How do you stay updated with new technologies?"}
                ],
                "medium": [
                    {"id": "SE_M1", "text": "Describe a challenging technical problem you solved. What was your approach?"},
                    {"id": "SE_M2", "text": "How do you ensure code quality in your projects?"},
                    {"id": "SE_M3", "text": "Explain your experience with version control and collaboration tools."},
                    {"id": "SE_M4", "text": "Describe a time you had to learn a new technology quickly."},
                    {"id": "SE_M5", "text": "How do you handle technical debt and refactoring?"},
                    {"id": "SE_M6", "text": "Explain your understanding of software design patterns."}
                ],
                "hard": [
                    {"id": "SE_H1", "text": "Describe a system you designed that handled high traffic. What were the key decisions?"},
                    {"id": "SE_H2", "text": "How do you approach performance optimization in large-scale applications?"},
                    {"id": "SE_H3", "text": "Explain your experience with cloud infrastructure and deployment."},
                    {"id": "SE_H4", "text": "Describe a technical disagreement you resolved with your team."},
                    {"id": "SE_H5", "text": "How do you mentor junior developers and promote best practices?"}
                ]
            },
            "Product Manager": {
                "easy": [
                    {"id": "PM_E1", "text": "What does a Product Manager do on a daily basis?"},
                    {"id": "PM_E2", "text": "Describe a product feature you helped define."},
                    {"id": "PM_E3", "text": "How do you prioritize features?"},
                    {"id": "PM_E4", "text": "Explain how you gather customer feedback."},
                    {"id": "PM_E5", "text": "What metrics do you track for product success?"}
                ],
                "medium": [
                    {"id": "PM_M1", "text": "Describe a time you had to make a product decision with limited data."},
                    {"id": "PM_M2", "text": "How do you communicate product requirements to engineering teams?"},
                    {"id": "PM_M3", "text": "Explain your process for conducting user research."},
                    {"id": "PM_M4", "text": "Describe a product launch you managed."},
                    {"id": "PM_M5", "text": "How do you handle stakeholder disagreement?"},
                    {"id": "PM_M6", "text": "Explain how you define and measure OKRs."}
                ],
                "hard": [
                    {"id": "PM_H1", "text": "Describe a product that failed and what you learned."},
                    {"id": "PM_H2", "text": "How do you balance short-term features with long-term vision?"},
                    {"id": "PM_H3", "text": "Explain your experience with A/B testing and experimentation."},
                    {"id": "PM_H4", "text": "How do you build product roadmaps for multiple teams?"},
                    {"id": "PM_H5", "text": "Describe how you've influenced product strategy at a high level."}
                ]
            },
            "Data Scientist": {
                "easy": [
                    {"id": "DS_E1", "text": "What's your experience with data analysis tools?"},
                    {"id": "DS_E2", "text": "Describe a data project you worked on."},
                    {"id": "DS_E3", "text": "How do you handle missing data?"},
                    {"id": "DS_E4", "text": "Explain a machine learning concept you use frequently."},
                    {"id": "DS_E5", "text": "How do you validate your models?"}
                ],
                "medium": [
                    {"id": "DS_M1", "text": "Describe how you would approach an imbalanced classification problem."},
                    {"id": "DS_M2", "text": "Explain feature engineering techniques you've used."},
                    {"id": "DS_M3", "text": "How do you communicate complex findings to non-technical stakeholders?"},
                    {"id": "DS_M4", "text": "Describe a time your model didn't perform as expected. What did you do?"},
                    {"id": "DS_M5", "text": "Explain your experience with productionizing models."},
                    {"id": "DS_M6", "text": "How do you choose between different algorithms for a problem?"}
                ],
                "hard": [
                    {"id": "DS_H1", "text": "Describe an end-to-end ML system you designed."},
                    {"id": "DS_H2", "text": "How do you ensure your models are fair and unbiased?"},
                    {"id": "DS_H3", "text": "Explain a time you had to optimize for both accuracy and latency."},
                    {"id": "DS_H4", "text": "How do you handle concept drift in production models?"},
                    {"id": "DS_H5", "text": "Describe your approach to experimental design."}
                ]
            },
            "General": {
                "easy": [
                    {"id": "GEN_E1", "text": "Tell me about yourself and your professional background."},
                    {"id": "GEN_E2", "text": "What are your greatest strengths?"},
                    {"id": "GEN_E3", "text": "Why are you interested in this position?"},
                    {"id": "GEN_E4", "text": "Describe your ideal work environment."},
                    {"id": "GEN_E5", "text": "Where do you see yourself in 5 years?"}
                ],
                "medium": [
                    {"id": "GEN_M1", "text": "Describe a challenging situation at work and how you handled it."},
                    {"id": "GEN_M2", "text": "How do you handle constructive criticism?"},
                    {"id": "GEN_M3", "text": "Describe a time you worked in a team to achieve a goal."},
                    {"id": "GEN_M4", "text": "How do you prioritize tasks when everything is urgent?"},
                    {"id": "GEN_M5", "text": "Describe a time you showed leadership."},
                    {"id": "GEN_M6", "text": "How do you adapt to changing priorities?"}
                ],
                "hard": [
                    {"id": "GEN_H1", "text": "Describe a time you failed and what you learned."},
                    {"id": "GEN_H2", "text": "How have you influenced positive change in your organization?"},
                    {"id": "GEN_H3", "text": "Describe a difficult decision you had to make."},
                    {"id": "GEN_H4", "text": "How do you handle ambiguity in projects?"},
                    {"id": "GEN_H5", "text": "Describe your approach to continuous improvement."}
                ]
            }
        }
        
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r') as f:
                return json.load(f)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        with open(self.data_path, 'w') as f:
            json.dump(default_questions, f, indent=2)
        
        return default_questions
    
    def get_questions(self, role: str, difficulty: str) -> List[Dict]:
        """Get questions for specific role and difficulty"""
        role_questions = self.questions_cache.get(role, self.questions_cache.get("General"))
        questions = role_questions.get(difficulty, role_questions.get("medium"))
        
        # Return copy with added metadata
        return [{
            'id': q['id'],
            'text': q['text'],
            'difficulty': difficulty,
            'role': role
        } for q in questions]