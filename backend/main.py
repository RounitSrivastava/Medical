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

from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import requests
from groq import Groq

load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# We now use the Colab GPU server instead of Hugging Face's Free API!
COLAB_API_URL = "https://upstream-glitch-duo.ngrok-free.dev/api/chat"

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.lower()
    
    messages = [
        {"role": "system", "content": "You are Dr. Aisha, an AI Cardiac Assistant. Answer the patient's medical query carefully and professionally."},
        {"role": "user", "content": user_msg}
    ]
    
    import re
    
    try:
        # Connect to your Google Colab GPU!
        response = requests.post(COLAB_API_URL, json={"message": user_msg}, timeout=60)
        response.raise_for_status()
        reply = response.json().get("reply", "")
        if reply:
            reply = re.sub(r'[*#_`]', '', reply)
            return ChatResponse(reply=reply)
        else:
            raise Exception("Empty response from Colab")
            
    except Exception as e:
        print(f"Colab Server Error/Disconnected: {e}")
        
        # Groq Fallback Engine
        if groq_client:
            print("Using Groq API Fallback...")
            try:
                groq_response = groq_client.chat.completions.create(
                    messages=messages,
                    model="qwen/qwen3.8-27b",
                    temperature=0.3,
                    max_tokens=150,
                )
                reply = groq_response.choices[0].message.content
                reply = re.sub(r'[*#_`]', '', reply)
                return ChatResponse(reply=reply)
            except Exception as groq_e:
                print(f"Groq API Error: {groq_e}")

        # Absolute Last Resort Hardcoded Fallback
        reply = "I am currently analyzing your symptoms. Please rest and press the Emergency SOS button if you experience severe pain."
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
