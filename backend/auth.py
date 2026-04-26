from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authlib.integrations.flask_client import OAuth

from models.mongo_models import (
    mongo,
    find_user_by_email,
    find_user_by_google_id,
    create_user,
    verify_password,
    find_user_by_id,
    get_user_sessions   # ✅ missing import added
)

from bson.objectid import ObjectId
import json


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)

oauth = OAuth()


# -------------------------
# INIT GOOGLE OAUTH
# -------------------------
def init_oauth(app):

    oauth.init_app(app)

    oauth.register(
        name="google",

        client_id=app.config["GOOGLE_CLIENT_ID"],

        client_secret=app.config["GOOGLE_CLIENT_SECRET"],

        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",

        client_kwargs={
            "scope": "openid email profile"
        }
    )


# -------------------------
# REGISTER USER
# -------------------------
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    email = data.get("email")

    name = data.get("name")

    password = data.get("password")


    if not email or not password:

        return jsonify({"error": "Email and password required"}), 400


    if find_user_by_email(email):

        return jsonify({"error": "Email already exists"}), 400


    user_id = create_user(
        email=email,
        name=name,
        password=password
    )


    access_token = create_access_token(
        identity=str(user_id)
    )


    return jsonify({

        "token": access_token,

        "user": {

            "id": str(user_id),

            "name": name,

            "email": email
        }

    })


# -------------------------
# LOGIN USER
# -------------------------
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")

    password = data.get("password")


    user = find_user_by_email(email)


    if not user or not verify_password(user, password):

        return jsonify({"error": "Invalid credentials"}), 401


    access_token = create_access_token(
        identity=str(user["_id"])
    )


    return jsonify({

        "token": access_token,

        "user": {

            "id": str(user["_id"]),

            "name": user["name"],

            "email": user["email"]
        }

    })


# -------------------------
# GOOGLE LOGIN
# -------------------------
@auth_bp.route("/google/login")
def google_login():

    redirect_uri = url_for(
        "auth.google_callback",
        _external=True
    )

    return oauth.google.authorize_redirect(
        redirect_uri
    )


# -------------------------
# GOOGLE CALLBACK
# -------------------------
@auth_bp.route("/google/callback")
def google_callback():

    token = oauth.google.authorize_access_token()

    user_info = oauth.google.parse_id_token(token)


    email = user_info["email"]

    name = user_info.get(
        "name",
        email.split("@")[0]
    )

    google_id = user_info["sub"]


    # check if google account exists
    user = find_user_by_google_id(google_id)


    if not user:

        # check email exists
        user = find_user_by_email(email)


        if user:

            # link google id to existing user

            mongo.db.users.update_one(

                {"_id": user["_id"]},

                {

                    "$set": {

                        "google_id": google_id
                    }

                }

            )

        else:

            # create new user

            user_id = create_user(

                email=email,

                name=name,

                google_id=google_id

            )

            user = find_user_by_id(user_id)


    access_token = create_access_token(

        identity=str(user["_id"])

    )


    # redirect to React frontend
    return f"""
    <script>
        window.location.href =
        "http://localhost:3000/auth/callback?token={access_token}";
    </script>
    """


# -------------------------
# CURRENT USER
# -------------------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():

    user_id = get_jwt_identity()

    user = find_user_by_id(user_id)


    if not user:

        return jsonify({"error": "User not found"}), 404


    return jsonify({

        "id": str(user["_id"]),

        "name": user["name"],

        "email": user["email"]

    })


# -------------------------
# USER HISTORY
# -------------------------
@auth_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():

    user_id = get_jwt_identity()

    sessions = get_user_sessions(user_id)


    history = []

    for s in sessions:

        history.append({

            "session_id": s["session_id"],

            "role": s["role"],

            "difficulty": s["difficulty"],

            "score": s.get("report", {}).get("overall_score"),

            "date": str(s.get("start_time"))

        })


    return jsonify(history)


# -------------------------
# LOGOUT
# -------------------------
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():

    return jsonify({

        "message": "Logged out successfully"

    })