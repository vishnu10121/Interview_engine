from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime
import bcrypt

mongo = PyMongo()

def init_mongo(app):
    mongo.init_app(app)
    # Create indexes
    mongo.db.users.create_index('email', unique=True)
    mongo.db.users.create_index('google_id', sparse=True)
    mongo.db.sessions.create_index('session_id', unique=True)
    mongo.db.sessions.create_index('user_id')

# User helpers
def create_user(email, name, password=None, google_id=None):
    user = {
        'email': email,
        'name': name,
        'password_hash': bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8') if password else None,
        'google_id': google_id,
        'created_at': datetime.utcnow(),
        'interviews': []
    }
    result = mongo.db.users.insert_one(user)
    return str(result.inserted_id)

def find_user_by_email(email):
    return mongo.db.users.find_one({'email': email})

def find_user_by_google_id(google_id):
    return mongo.db.users.find_one({'google_id': google_id})

def find_user_by_id(user_id):
    return mongo.db.users.find_one({'_id': ObjectId(user_id)})

def verify_password(user, password):
    if not user.get('password_hash'):
        return False
    return bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))

# Interview session helpers
def save_interview_session(session_id, user_id, role, difficulty, questions, duration_seconds):
    session_doc = {
        'session_id': session_id,
        'user_id': ObjectId(user_id),
        'role': role,
        'difficulty': difficulty,
        'questions': questions,
        'duration_seconds': duration_seconds,
        'start_time': datetime.utcnow(),
        'answers': [],
        'frames': [],
        'completed': False,
        'report': None
    }
    mongo.db.sessions.insert_one(session_doc)
    return session_id

def get_session(session_id):
    return mongo.db.sessions.find_one({'session_id': session_id})

def update_session_answer(session_id, question_index, answer):
    mongo.db.sessions.update_one(
        {'session_id': session_id},
        {'$push': {'answers': {'question_index': question_index, 'answer': answer, 'timestamp': datetime.utcnow()}}}
    )

def add_frame_to_session(session_id, frame_data):
    mongo.db.sessions.update_one(
        {'session_id': session_id},
        {'$push': {'frames': frame_data}}
    )

def complete_session(session_id, report):
    mongo.db.sessions.update_one(
        {'session_id': session_id},
        {'$set': {'completed': True, 'report': report, 'end_time': datetime.utcnow()}}
    )
    # Also update user's interview list
    session = get_session(session_id)
    if session:
        mongo.db.users.update_one(
            {'_id': session['user_id']},
            {'$push': {'interviews': {'session_id': session_id, 'score': report.get('overall_score'), 'date': datetime.utcnow()}}}
        )

def get_user_sessions(user_id):
    return list(mongo.db.sessions.find({'user_id': ObjectId(user_id)}).sort('start_time', -1))