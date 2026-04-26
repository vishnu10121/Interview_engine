import os

class Config:
    # MongoDB connection
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/interview_db')
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    
    # Google OAuth (same as before)
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    OAUTH_REDIRECT_URI = 'http://localhost:5000/api/auth/google/callback'
    
    # Session config
    SESSION_TIMEOUT = 3600
    MAX_SESSIONS = 100
    FRAME_SKIP = 3