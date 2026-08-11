from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="AI Cardiac Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # TODO: Connect to actual RAG pipeline and dataset
    # For now, we mock the response since the user will connect their dataset later.
    
    user_msg = request.message.lower()
    reply = ""
    
    if "hello" in user_msg or "hi" in user_msg:
        reply = "Hello! I am your AI Cardiac Assistant. How can I help you with your heart health today?"
    elif "symptom" in user_msg or "pain" in user_msg:
        reply = "I understand you're asking about symptoms. Based on general cardiac data, chest pain can be a sign of various conditions. Please remember I am an AI and this is not medical advice. Always consult a doctor."
    else:
        reply = f"I received your message: '{request.message}'. Once my dataset is connected, I will provide a more specific answer!"
        
    return ChatResponse(reply=reply)

# Admin / Doctors API
import json

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "doctors.json")

def load_doctors():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_doctors(doctors):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(doctors, f, indent=2)

class Doctor(BaseModel):
    name: str
    specialty: str
    experience: str
    rating: str
    lat: float
    lng: float
    area: str

@app.get("/api/doctors")
def get_doctors():
    return load_doctors()

@app.post("/api/doctors")
def add_doctor(doc: Doctor):
    doctors = load_doctors()
    new_doc = doc.dict()
    new_doc["id"] = str(len(doctors) + 1)
    doctors.append(new_doc)
    save_doctors(doctors)
    return {"status": "success", "doctor": new_doc}

# Users API
USERS_FILE = os.path.join(os.path.dirname(__file__), "data", "users.json")

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

class UserRegister(BaseModel):
    name: str
    age: int
    gender: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/api/register")
def register_user(user: UserRegister):
    users = load_users()
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = user.dict()
    new_user["id"] = str(len(users) + 1)
    users.append(new_user)
    save_users(users)
    return {"status": "success", "user": {"name": new_user["name"], "email": new_user["email"]}}

@app.post("/api/login")
def login_user(creds: UserLogin):
    if creds.email.lower() == "admin" and creds.password == "admin123":
        return {"status": "success", "user": {"name": "Admin", "email": "admin", "role": "admin"}}
        
    users = load_users()
    for u in users:
        if u["email"] == creds.email and u["password"] == creds.password:
            return {"status": "success", "user": {"name": u["name"], "email": u["email"]}}
    raise HTTPException(status_code=401, detail="Invalid email or password")
