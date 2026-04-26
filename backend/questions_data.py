import random

# Complete Questions Database by Role
QUESTIONS_BY_ROLE = {
    "Software Engineer": {
        "questions": [
            {"id": "SE1", "text": "Tell me about your programming experience and favorite technologies."},
            {"id": "SE2", "text": "Explain the difference between HTTP and HTTPS."},
            {"id": "SE3", "text": "What is Object-Oriented Programming? Explain the four main concepts."},
            {"id": "SE4", "text": "What is version control and why is Git important?"},
            {"id": "SE5", "text": "Explain the difference between SQL and NoSQL databases."},
            {"id": "SE6", "text": "What is an API? Explain REST API with example."},
            {"id": "SE7", "text": "Difference between let, const, and var in JavaScript."},
            {"id": "SE8", "text": "Explain what is CI/CD pipeline and its benefits."},
            {"id": "SE9", "text": "What is the difference between == and === in JavaScript?"},
            {"id": "SE10", "text": "Explain how garbage collection works in JavaScript."},
            {"id": "SE11", "text": "What is Docker and why is it used?"},
            {"id": "SE12", "text": "Explain the difference between agile and waterfall methodology."},
            {"id": "SE13", "text": "What is the purpose of package.json in Node.js?"},
            {"id": "SE14", "text": "Explain the event loop in JavaScript."},
            {"id": "SE15", "text": "What is middleware in Express.js?"},
            {"id": "SE16", "text": "Explain the difference between authentication and authorization."},
            {"id": "SE17", "text": "What is JWT and how does it work?"},
            {"id": "SE18", "text": "Explain the concept of closures in JavaScript."},
            {"id": "SE19", "text": "What is the difference between process and thread?"},
            {"id": "SE20", "text": "Explain how you would optimize a slow website."}
        ]
    },
    
    "Data Scientist": {
        "questions": [
            {"id": "DS1", "text": "Tell me about your experience with data analysis and machine learning."},
            {"id": "DS2", "text": "Explain the difference between supervised and unsupervised learning."},
            {"id": "DS3", "text": "What is the difference between pandas and numpy in Python?"},
            {"id": "DS4", "text": "Explain overfitting and how to prevent it."},
            {"id": "DS5", "text": "What is the purpose of train-test split in machine learning?"},
            {"id": "DS6", "text": "Explain the difference between regression and classification."},
            {"id": "DS7", "text": "What is the difference between L1 and L2 regularization?"},
            {"id": "DS8", "text": "Explain how a decision tree works."},
            {"id": "DS9", "text": "What is the difference between bagging and boosting?"},
            {"id": "DS10", "text": "Explain the confusion matrix and its components."},
            {"id": "DS11", "text": "What is feature engineering? Give examples."},
            {"id": "DS12", "text": "Explain the difference between correlation and causation."},
            {"id": "DS13", "text": "What is the purpose of data normalization?"},
            {"id": "DS14", "text": "Explain how K-Means clustering works."},
            {"id": "DS15", "text": "What is the difference between precision and recall?"},
            {"id": "DS16", "text": "Explain the bias-variance tradeoff."},
            {"id": "DS17", "text": "What is the purpose of cross-validation?"},
            {"id": "DS18", "text": "Explain the difference between SQL and NoSQL for data science."},
            {"id": "DS19", "text": "What is the difference between matplotlib and seaborn?"},
            {"id": "DS20", "text": "Explain the steps in a typical data science project."}
        ]
    },
    
    "Cybersecurity": {
        "questions": [
            {"id": "CS1", "text": "Tell me about your experience with cybersecurity and ethical hacking."},
            {"id": "CS2", "text": "Explain the difference between symmetric and asymmetric encryption."},
            {"id": "CS3", "text": "What is the difference between a virus and a worm?"},
            {"id": "CS4", "text": "Explain what is a DDoS attack and how to prevent it."},
            {"id": "CS5", "text": "What is the difference between penetration testing and vulnerability assessment?"},
            {"id": "CS6", "text": "Explain the CIA triad in cybersecurity."},
            {"id": "CS7", "text": "What is the difference between SHA-256 and MD5?"},
            {"id": "CS8", "text": "Explain what is a firewall and how it works."},
            {"id": "CS9", "text": "What is the difference between IDS and IPS?"},
            {"id": "CS10", "text": "Explain what is SQL injection and how to prevent it."},
            {"id": "CS11", "text": "What is cross-site scripting (XSS) and how to prevent it?"},
            {"id": "CS12", "text": "Explain the difference between white-box and black-box testing."},
            {"id": "CS13", "text": "What is the purpose of SSL/TLS certificates?"},
            {"id": "CS14", "text": "Explain what is a man-in-the-middle attack."},
            {"id": "CS15", "text": "What is the difference between hashing and encryption?"},
            {"id": "CS16", "text": "Explain what is a zero-day vulnerability."},
            {"id": "CS17", "text": "What is the difference between authentication and authorization?"},
            {"id": "CS18", "text": "Explain what is social engineering and its types."},
            {"id": "CS19", "text": "What is the purpose of a security audit?"},
            {"id": "CS20", "text": "Explain the concept of defense in depth."}
        ]
    },
    
    "Full Stack Developer": {
        "questions": [
            {"id": "FS1", "text": "Tell me about your experience with front-end and back-end development."},
            {"id": "FS2", "text": "Explain the difference between React and Angular."},
            {"id": "FS3", "text": "What is the purpose of Node.js in full stack development?"},
            {"id": "FS4", "text": "Explain how the MERN stack works."},
            {"id": "FS5", "text": "What is the difference between localStorage and sessionStorage?"},
            {"id": "FS6", "text": "Explain what is responsive web design."},
            {"id": "FS7", "text": "What is the difference between props and state in React?"},
            {"id": "FS8", "text": "Explain how RESTful APIs work."},
            {"id": "FS9", "text": "What is the difference between SQL and MongoDB?"},
            {"id": "FS10", "text": "Explain what is Redux and why use it?"},
            {"id": "FS11", "text": "What is the difference between PUT and PATCH?"},
            {"id": "FS12", "text": "Explain what is GraphQL and how it differs from REST."},
            {"id": "FS13", "text": "What is the purpose of Webpack in React?"},
            {"id": "FS14", "text": "Explain how JWT authentication works."},
            {"id": "FS15", "text": "What is the difference between server-side and client-side rendering?"},
            {"id": "FS16", "text": "Explain what is CORS and how to handle it."},
            {"id": "FS17", "text": "What is the purpose of environment variables?"},
            {"id": "FS18", "text": "Explain how to handle errors in Express.js."},
            {"id": "FS19", "text": "What is the difference between cookies and tokens?"},
            {"id": "FS20", "text": "Explain the process of deploying a full stack application."}
        ]
    },
    
    "General": {
        "questions": [
            {"id": "GEN1", "text": "Tell me about yourself and your professional background."},
            {"id": "GEN2", "text": "What are your greatest strengths and weaknesses?"},
            {"id": "GEN3", "text": "Why are you interested in this position?"},
            {"id": "GEN4", "text": "Describe a challenging situation and how you handled it."},
            {"id": "GEN5", "text": "How do you handle constructive criticism?"},
            {"id": "GEN6", "text": "Describe a time you worked in a team to achieve a goal."},
            {"id": "GEN7", "text": "How do you prioritize tasks when everything is urgent?"},
            {"id": "GEN8", "text": "Describe a time you showed leadership."},
            {"id": "GEN9", "text": "How do you stay updated with new technologies?"},
            {"id": "GEN10", "text": "Where do you see yourself in 5 years?"},
            {"id": "GEN11", "text": "How do you handle work pressure and stress?"},
            {"id": "GEN12", "text": "Describe a time you failed and what you learned."},
            {"id": "GEN13", "text": "How do you handle conflicts with colleagues?"},
            {"id": "GEN14", "text": "What motivates you to do your best work?"},
            {"id": "GEN15", "text": "Describe your ideal work environment."},
            {"id": "GEN16", "text": "How do you approach learning new skills?"},
            {"id": "GEN17", "text": "What is your proudest professional achievement?"},
            {"id": "GEN18", "text": "How do you handle feedback from managers?"},
            {"id": "GEN19", "text": "Describe a time you went above and beyond."},
            {"id": "GEN20", "text": "Why should we hire you for this role?"}
        ]
    }
}

def get_questions_for_role(role, difficulty="medium"):
    """Get random questions for a specific role"""
    
    # Map difficulty to number of questions
    question_counts = {
        "easy": 5,
        "medium": 6,
        "hard": 5
    }
    
    count = question_counts.get(difficulty, 6)
    
    # Get questions for the role
    role_data = QUESTIONS_BY_ROLE.get(role)
    
    if not role_data:
        # Fallback to General if role not found
        role_data = QUESTIONS_BY_ROLE["General"]
    
    all_questions = role_data["questions"]
    
    # Randomly select questions
    if len(all_questions) >= count:
        selected_questions = random.sample(all_questions, count)
    else:
        selected_questions = all_questions
    
    # Add unique IDs and shuffle
    for i, q in enumerate(selected_questions):
        q["display_id"] = f"{i+1}"
    
    random.shuffle(selected_questions)
    
    return selected_questions

def get_all_roles():
    """Get list of all available roles"""
    return list(QUESTIONS_BY_ROLE.keys())