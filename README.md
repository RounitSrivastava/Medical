# 🩺 CardioCare AI Portal: Rural Healthcare Kiosk

![CardioCare UI Overview](frontend/public/favicon.ico) *(Replace with actual screenshot)*

## 🌍 The Mission
In rural areas, patients often have to travel miles to a town or city just for a basic medical checkup. **CardioCare AI Portal** is designed to run on a local kiosk, bringing expert medical triage directly to the village. 

Our AI Chief Cardiologist, **Dr. Aisha**, acts as the crucial first layer of defense. She can analyze symptoms, read live vitals from smartwatches, and instantly evaluate prescriptions. If a case is deemed serious, the system escalates the patient to a perfectly matched human doctor for immediate care.

---

## ✨ Cutting-Edge Features

### 🗣️ Hands-Free "Wake Word" Voice AI
Built for a touchless kiosk environment. Patients can simply step up to the machine and say **"Hello Doctor"**.
* **Continuous Background Listening:** Custom-built on the Web Speech API to bypass browser timeouts.
* **Smart TTS:** Dr. Aisha speaks her diagnoses out loud with natural voice synthesis.

### ⌚ Live Bluetooth Telemetry (EKG/BPM)
No expensive medical equipment required—just a consumer smartwatch.
* **Web Bluetooth API Integration:** Connects directly to real smartwatches, Apple Watches, Garmin, and Polar bands via the browser.
* **Live Streaming:** Renders a dynamic, real-time EKG waveform and BPM counter directly on the consultation screen.
* **Virtual Simulator:** Graceful fallback to a virtual telemetry simulator if no real device is paired.

### 💊 AI Prescription OCR Analyzer
Patients can upload a photo of a handwritten or printed prescription.
* **Client-Side OCR:** Powered by `Tesseract.js` to extract text from images natively in the browser.
* **Garbage-Filtered AI Evaluation:** The AI is strictly prompted to ignore typos, scanning artifacts, and gibberish. It extracts the real medication names, provides a 1-sentence summary of what they do, and evaluates if the regimen is safe for a cardiac patient.

---

## 🛠️ Full Technology Stack

### 🧠 Artificial Intelligence & Machine Learning
* **Primary LLM:** 27B parameter Qwen model hosted remotely on a Google Colab GPU server.
* **Fallback LLM:** Seamless fallback to **LLaMA-3 via Groq Cloud API** for ultra-low-latency responses if the local server goes offline.
* **OCR Engine:** **Tesseract.js** for client-side Optical Character Recognition.

### 💻 Frontend (Client)
* **Framework:** Next.js 14 (App Router)
* **Library:** React 18
* **Language:** TypeScript
* **Styling:** Vanilla CSS Modules featuring Glassmorphism, dynamic gradients, and micro-animations.
* **Browser APIs:** 
  * `Web Speech API` (for continuous wake-word listening and Text-to-Speech)
  * `Web Bluetooth API` (GATT protocol for heart rate sensor telemetry)
  * `HTML5 Canvas` (for 60fps real-time EKG waveform rendering)

### ⚙️ Backend (Server)
* **Framework:** FastAPI
* **Language:** Python 3.10+
* **Server:** Uvicorn (ASGI)
* **Middleware:** FastAPI CORS Middleware (Cross-Origin Resource Sharing)
* **Data Storage:** Local JSON-based flat files (`users.json`, `doctors.json`) for lightweight kiosk deployment.

---

## 📁 Project Structure

```text
SEM7Project/
├── backend/                  # Python FastAPI Server
│   ├── data/                 # JSON database (users, doctors)
│   ├── main.py               # Core API router and AI prompt logic
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables (Groq API Key)
│
├── frontend/                 # Next.js React Application
│   ├── public/               # Static assets (images, icons)
│   ├── src/
│   │   ├── app/              # Next.js App Router (pages & layouts)
│   │   │   ├── consultation/ # Main AI Chat, EKG, OCR & Voice UI
│   │   │   ├── login/        # Patient/Admin Authentication
│   │   │   └── admin/        # Doctor escalation dashboard
│   │   │
│   │   └── components/       # Reusable React components
│   │       ├── EKGMonitor.tsx   # Bluetooth & Canvas rendering logic
│   │       ├── Avatar.tsx       # Dr. Aisha UI & animations
│   │       └── BookingModal.tsx # Doctor escalation system
│   │
│   ├── package.json          # Node dependencies
│   └── tsconfig.json         # TypeScript configuration
```

---

## 🚀 How to Run the Project Locally

### 1. Start the Backend (FastAPI)
Open a terminal in the root directory:
```bash
cd backend
# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate   # (Windows)
# source venv/bin/activate # (Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your Groq API Key:
# GROQ_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload
```
*The backend will run on `http://localhost:8000`*

### 2. Start the Frontend (Next.js)
Open a new, second terminal in the root directory:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000`*

---

## 💡 How to Use the App
1. **Login:** Open `http://localhost:3000` and login as a patient.
2. **Consultation Room:** 
   - Click the **Hands-Free (👋)** button until it turns green, and say *"Hello Doctor"* to begin voice chatting.
   - Click the **Pair Bluetooth** button to connect a real smartwatch and stream your pulse.
   - Click the **Prescription (💊)** button to upload a photo of your medications for instant safety analysis.

---

*Built with ❤️ for the future of accessible rural healthcare.*
