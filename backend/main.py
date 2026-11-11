from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import re

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
GROQ_MODEL = "qwen/qwen3.8-27b"

def clean_ai_reply(text: str) -> str:
    """Strip reasoning tags and markdown symbols for clean display and speech output."""
    cleaned = re.sub(r'<think>[\s\S]*?</think>', '', text or '')
    cleaned = re.sub(r'[*#_`]', '', cleaned)
    return cleaned.strip()

def run_groq_chat(messages: list, max_tokens: int = 350, temperature: float = 0.3) -> str:
    """Execute Groq chat/vision completion using the configured Qwen model."""
    if not groq_client:
        raise RuntimeError("Groq API key not configured")
    groq_response = groq_client.chat.completions.create(
        messages=messages,
        model=GROQ_MODEL,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return clean_ai_reply(groq_response.choices[0].message.content or "")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.lower()

    messages = [
        {"role": "system", "content": "You are Dr. Aisha, an AI Cardiac Assistant. You are currently in the middle of a live consultation. Answer the patient's medical query carefully, professionally, and concisely. DO NOT introduce yourself or say 'Hello I am Dr. Aisha' because the patient already knows who you are. Just answer the query directly."},
        {"role": "user", "content": user_msg}
    ]

    try:
        # Connect to your Google Colab GPU!
        response = requests.post(COLAB_API_URL, json={"message": user_msg}, timeout=5)
        response.raise_for_status()
        reply = response.json().get("reply", "")
        if reply:
            return ChatResponse(reply=clean_ai_reply(reply))
        raise Exception("Empty response from Colab")

    except Exception as e:
        print(f"Colab Server Error/Disconnected: {e}")

        # Groq Fallback Engine
        if groq_client:
            print("Using Groq API Fallback...")
            try:
                reply = run_groq_chat(messages, max_tokens=350, temperature=0.3)
                if reply:
                    return ChatResponse(reply=reply)
            except Exception as groq_e:
                print(f"Groq API Error: {groq_e}")

        # Absolute Last Resort Hardcoded Fallback
        reply = "I am currently analyzing your symptoms. Please rest and press the Emergency SOS button if you experience severe pain."
        return ChatResponse(reply=reply)

class PrescriptionExtractRequest(BaseModel):
    image_url: str

class PrescriptionExtractResponse(BaseModel):
    text: str

@app.post("/api/extract-prescription", response_model=PrescriptionExtractResponse)
async def extract_prescription(request: PrescriptionExtractRequest):
    if not request.image_url or not request.image_url.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Invalid prescription image format")

    messages = [
        {
            "role": "system",
            "content": "You are an expert medical transcription assistant. Read the prescription image carefully, including printed and handwritten text. Output ONLY the extracted medications, dosages, frequencies, and clinical notes line by line in plain text. If no readable text is present, reply with exactly NO_TEXT_FOUND. Do not invent illegible items or add conversational filler."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Transcribe all medications, strengths, and dosing instructions from this prescription image:"},
                {"type": "image_url", "image_url": {"url": request.image_url}}
            ]
        }
    ]

    try:
        extracted = run_groq_chat(messages, max_tokens=400, temperature=0.1)
        if not extracted or "NOTEXTFOUND" in extracted.upper().replace("_", "").replace(" ", ""):
            raise HTTPException(status_code=422, detail="Could not read text from prescription image")
        return PrescriptionExtractResponse(text=extracted)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Prescription Vision Extract Error: {e}")
        raise HTTPException(status_code=502, detail="Failed to extract prescription image")

class PrescriptionAnalyzeRequest(BaseModel):
    text: str = ""
    image_url: Optional[str] = None

@app.post("/api/analyze-prescription", response_model=ChatResponse)
async def analyze_prescription(request: PrescriptionAnalyzeRequest):
    clean_text = request.text.strip()
    has_image = bool(request.image_url and request.image_url.startswith("data:image/"))
    if not clean_text and not has_image:
        raise HTTPException(status_code=400, detail="Please provide prescription text or upload an image")

    system_prompt = (
        "You are Dr. Aisha, an AI Cardiac Assistant currently in a live consultation evaluating a patient's prescription. "
        "DO NOT introduce yourself or say 'Hello I am Dr. Aisha'. "
        "Identify each medication clearly, give a concise 1-sentence summary of what each medicine treats, "
        "and evaluate whether it is safe or requires caution for a cardiac patient (noting heart rate, blood pressure, or bleeding considerations). "
        "Ignore minor OCR typos if text was extracted from a photo. Be direct, empathetic, and clear without markdown formatting."
    )

    if has_image:
        prompt_text = (
            f"Please analyze this prescription image and evaluate cardiac safety. Extracted/entered text: {clean_text}"
            if clean_text
            else "Please read this prescription image, list each medication, summarize what it does, and evaluate cardiac safety."
        )
        user_content = [
            {"type": "text", "text": prompt_text},
            {"type": "image_url", "image_url": {"url": request.image_url}}
        ]
    else:
        user_content = f"Please analyze this prescription and evaluate cardiac safety:\n{clean_text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    try:
        reply = run_groq_chat(messages, max_tokens=450, temperature=0.2)
        if reply:
            return ChatResponse(reply=reply)
    except Exception as e:
        print(f"Prescription Analyze Error: {e}")

    return ChatResponse(
        reply="I could not complete the prescription analysis right now. Please ensure the medication names are clearly entered and consult your cardiologist before changing any dose."
    )

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
    new_doc = doc.model_dump()
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
    
    new_user = user.model_dump()
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
