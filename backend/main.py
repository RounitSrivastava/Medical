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
