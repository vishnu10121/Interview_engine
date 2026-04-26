# Interview Assessment Engine

An AI-powered automated interview system that analyzes candidate responses through video, facial expressions, posture, and behavioral cues.

## Features

- 🎥 Real-time webcam capture and analysis
- 🤖 Facial expression recognition (happy, neutral, sad, surprised, etc.)
- 🧘 Posture detection (upright, slouching, leaning)
- 👁️ Eye contact and speaking detection
- 📊 Comprehensive scoring across 5 dimensions
- 📝 Per-question breakdown and feedback
- ⚡ Low-latency processing with frame skipping

## Tech Stack

**Backend:**
- Flask + Flask-SocketIO (REST API + WebSockets)
- MediaPipe (face mesh, pose detection)
- OpenCV (image processing)
- NumPy, scikit-learn (analysis)

**Frontend:**
- React 18
- WebRTC (camera access)
- Custom CSS (Obsidian Lab theme)

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- pip, npm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py