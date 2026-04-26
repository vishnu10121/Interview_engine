import uuid
import time
from typing import Dict, List, Any
from datetime import datetime
import threading
import logging

logger = logging.getLogger(__name__)


class SessionManager:
    """
    Manages interview sessions with thread-safe operations
    Stores session info, answers, and video frame analysis data
    """

    def __init__(self):
        self._sessions: Dict[str, Dict] = {}
        self._frames: Dict[str, List] = {}
        self._lock = threading.Lock()

    # ----------------------------
    # CREATE SESSION (basic)
    # ----------------------------
    def create_session(
        self,
        candidate_name: str,
        role: str,
        difficulty: str,
        questions: List[Dict],
        duration_seconds: int
    ) -> str:

        session_id = str(uuid.uuid4())[:8]

        with self._lock:
            self._sessions[session_id] = {
                "session_id": session_id,
                "candidate": candidate_name,
                "role": role,
                "difficulty": difficulty,
                "questions": questions,
                "duration_seconds": duration_seconds,
                "start_time": time.time(),

                "answers": [
                    {
                        "question_index": i,
                        "answer": ""
                    }
                    for i in range(len(questions))
                ],

                "completed": False,
                "report": None
            }

            self._frames[session_id] = []

        logger.info(f"Session {session_id} created for {candidate_name}")

        return session_id


    # ----------------------------
    # GET SESSION
    # ----------------------------
    def get_session(self, session_id: str) -> Dict | None:

        with self._lock:
            return self._sessions.get(session_id)


    # ----------------------------
    # UPDATE ANSWER
    # ----------------------------
    def update_answer(
        self,
        session_id: str,
        question_index: int,
        answer: str
    ):

        with self._lock:

            session = self._sessions.get(session_id)

            if session:

                for ans in session["answers"]:

                    if ans["question_index"] == question_index:

                        ans["answer"] = answer

                        break


    # ----------------------------
    # ADD FRAME DATA
    # ----------------------------
    def add_frame(
        self,
        session_id: str,
        frame_data: Dict
    ):

        with self._lock:

            if session_id in self._frames:

                self._frames[session_id].append(frame_data)


    # ----------------------------
    # GET FRAME DATA
    # ----------------------------
    def get_session_frames(
        self,
        session_id: str
    ) -> List[Dict]:

        with self._lock:

            return self._frames.get(session_id, [])


    # ----------------------------
    # COMPLETE SESSION
    # ----------------------------
    def complete_session(
        self,
        session_id: str,
        report: Dict
    ):

        with self._lock:

            if session_id in self._sessions:

                self._sessions[session_id]["completed"] = True

                self._sessions[session_id]["report"] = report

                self._sessions[session_id]["end_time"] = time.time()

        logger.info(f"Session {session_id} completed")


    # ----------------------------
    # CREATE SESSION FOR LOGGED USER
    # ----------------------------
    def create_session_for_user(
        self,
        user_id: str,
        candidate_name: str,
        role: str,
        difficulty: str,
        questions: List[Dict],
        duration_seconds: int
    ) -> str:

        session_id = str(uuid.uuid4())[:8]

        with self._lock:

            self._sessions[session_id] = {

                "session_id": session_id,

                "user_id": user_id,

                "candidate": candidate_name,

                "role": role,

                "difficulty": difficulty,

                "questions": questions,

                "duration_seconds": duration_seconds,

                "start_time": time.time(),

                "answers": [
                    {
                        "question_index": i,
                        "answer": ""
                    }
                    for i in range(len(questions))
                ],

                "completed": False,

                "report": None
            }

            self._frames[session_id] = []


        # ----------------------------
        # SAVE SESSION TO DATABASE
        # ----------------------------

        try:

            from models.user import InterviewSession, db

            interview = InterviewSession(

                session_id=session_id,

                user_id=user_id,

                role=role,

                difficulty=difficulty,

                created_at=datetime.utcnow()

            )

            db.session.add(interview)

            db.session.commit()

            logger.info(f"Session {session_id} saved to database")

        except Exception as e:

            logger.error(f"Database save failed: {e}")


        return session_id