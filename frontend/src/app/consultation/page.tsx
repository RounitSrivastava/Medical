"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import Avatar from "../../components/Avatar";
import BookingModal from "../../components/BookingModal";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

export default function Consultation() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "ai", text: "Namaste! I am Dr. Aisha, your AI Cardiac Assistant. I have your patient file open. How are you feeling today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [avatarStatus, setAvatarStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [isListening, setIsListening] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Web Speech API
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = "en-IN"; // Set to Indian English

        reco.onstart = () => {
          setIsListening(true);
          setAvatarStatus("listening");
        };

        reco.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSend(transcript);
        };

        reco.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed') {
            alert("Microphone access is blocked! Please check the URL bar of your browser and click the tiny microphone icon to 'Allow' access.");
          } else if (event.error !== 'no-speech') {
            alert("Microphone error: " + event.error);
          }
          setIsListening(false);
          setAvatarStatus("idle");
        };

        reco.onend = () => {
          setIsListening(false);
          if (avatarStatus === "listening") {
            setAvatarStatus("idle");
          }
        };

        setRecognition(reco);
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      setAvatarStatus("idle");
    } else {
      recognition?.start();
    }
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const newMsg: Message = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setAvatarStatus("thinking");

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      const aiMsg: Message = { id: Date.now() + 1, sender: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      
      speakResponse(data.reply);
    } catch (error) {
      console.error("Failed to connect to backend", error);
      const aiMsg: Message = { id: Date.now() + 1, sender: "ai", text: "Sorry, I am having trouble connecting to my backend right now." };
      setMessages((prev) => [...prev, aiMsg]);
      speakResponse(aiMsg.text);
    }
  };

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      setAvatarStatus("speaking");
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Load voices. Browsers load them async, so we might have to wait or just use default
      let voices = window.speechSynthesis.getVoices();
      
      const setVoiceAndSpeak = () => {
        voices = window.speechSynthesis.getVoices();
        // Try to explicitly find a female voice (Indian first, then others)
        const femaleVoice = 
            voices.find(v => v.name.includes('Heera')) || // Windows Indian Female
            voices.find(v => v.name.includes('Google हिन्दी')) || // Chrome Indian Female
            voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female')) || 
            voices.find(v => v.name.includes('Zira')) || // Windows US Female
            voices.find(v => v.name.includes('Samantha')) || // Mac US Female
            voices.find(v => v.name.includes('Google UK English Female')) || // Chrome UK Female
            voices.find(v => v.name.includes('Female')) || // Generic Female
            voices.find(v => v.lang.includes('en-IN')) || // Any Indian voice (might be male like Ravi)
            voices[1] || // Often the 2nd default voice is female if 1st is male
            voices[0]; // Absolute fallback
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        utterance.onend = () => {
          setAvatarStatus("idle");
        };
        utterance.onerror = (e) => {
          console.error("Speech synthesis error", e);
          setAvatarStatus("idle");
        };
        
        window.speechSynthesis.speak(utterance);
      };

      if (voices.length === 0) {
        let fired = false;
        window.speechSynthesis.onvoiceschanged = () => {
          if (!fired) {
            fired = true;
            setVoiceAndSpeak();
          }
        };
        // Fallback if event doesn't fire
        setTimeout(() => {
          if (!fired) {
            fired = true;
            setVoiceAndSpeak();
          }
        }, 1000);
      } else {
        setVoiceAndSpeak();
      }
    } else {
      console.warn("Speech Synthesis not supported in this browser.");
      setAvatarStatus("idle");
    }
  };

  const [username, setUsername] = useState<string>("Patient");
  const [showAppointments, setShowAppointments] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.name) {
            setUsername(userObj.name);
          }
        } catch (e) {
          // Fallback if it's just an email string (from previous implementation)
          setUsername(storedUser);
        }
      }
    }
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>🩺</span>
          <h1 className={styles.title}>CardioCare Portal</h1>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            Welcome, <strong>{username}</strong>
          </div>
          <button onClick={() => setShowAppointments(true)} className={styles.appointmentsBtn}>
            📅 My Appointments
          </button>
          <button onClick={() => {
            localStorage.removeItem('currentUser');
            router.push('/');
          }} className={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </header>

      <div className={styles.dashboard}>
        
        {/* Left Side: Avatar & Vitals */}
        <div className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <Avatar status={avatarStatus} />
            <h2 className={styles.doctorName}>Dr. Aisha</h2>
            <p className={styles.doctorTitle}>AI Chief Cardiologist</p>
          </div>

          <div className={styles.vitalsSection}>
            <h3 className={styles.vitalsTitle}>Patient Vitals</h3>
            <div className={styles.vitalCard}>
              <span className={styles.vitalLabel}>Heart Rate</span>
              <span className={styles.vitalValue}>72 BPM <span className={styles.vitalNormal}>(Normal)</span></span>
            </div>
            <div className={styles.vitalCard}>
              <span className={styles.vitalLabel}>Blood Pressure</span>
              <span className={styles.vitalValue}>118/78 <span className={styles.vitalNormal}>(Optimal)</span></span>
            </div>
            <div className={styles.vitalCard}>
              <span className={styles.vitalLabel}>Oxygen</span>
              <span className={styles.vitalValue}>98% <span className={styles.vitalNormal}>(Normal)</span></span>
            </div>
            <button className={styles.findDoctorBtn} onClick={() => setIsBookingModalOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Find Local Cardiologist
            </button>
          </div>
        </div>

        {/* Right Side: Chat Consultation */}
        <div className={styles.chatSection}>
          <div className={styles.chatHeader}>
            <h3>Live Consultation</h3>
            <span className={styles.statusBadge}>Session Active</span>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.chatLog}>
              {messages.map((m) => (
                <div key={m.id} className={`${styles.messageWrapper} ${m.sender === "user" ? styles.userWrapper : styles.aiWrapper}`}>
                  <div className={`${styles.message} ${m.sender === "user" ? styles.userMessage : styles.aiMessage}`}>
                    {m.text}
                    {m.sender === "ai" && (
                      <button 
                        onClick={() => speakResponse(m.text)} 
                        style={{background:'none', border:'none', marginLeft:'10px', cursor:'pointer', fontSize:'1.1rem'}}
                        title="Listen to message"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className={styles.inputArea}>
              <button 
                className={`${styles.voiceBtn} ${isListening ? styles.listening : ""}`} 
                onClick={toggleListen}
                title="Use Voice"
              >
                🎤
              </button>
              <input
                type="text"
                className={styles.input}
                placeholder="Message Dr. Aisha..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className={styles.sendBtn} onClick={() => handleSend()}>
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal onClose={() => setIsBookingModalOpen(false)} />
      )}

      {showAppointments && (
        <div className={styles.modalOverlay} onClick={() => setShowAppointments(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{padding: '2rem', maxWidth: '600px'}}>
            <div className={styles.chatHeader} style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', background:'none', padding:0}}>
              <h2>My Appointments</h2>
              <button onClick={() => setShowAppointments(false)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer'}}>✕</button>
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap:'1rem', maxHeight:'60vh', overflowY:'auto'}}>
              {JSON.parse(localStorage.getItem('appointments') || '[]').length === 0 ? (
                <p style={{color:'#64748b', textAlign:'center', padding:'2rem'}}>You have no booked appointments yet.</p>
              ) : (
                JSON.parse(localStorage.getItem('appointments') || '[]').map((apt: any, i: number) => (
                  <div key={i} style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <h3 style={{margin:0, color:'#0f172a'}}>{apt.doctorName}</h3>
                      <span style={{background:'#e0f2fe', color:'#0369a1', padding:'0.2rem 0.6rem', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold'}}>{apt.time}</span>
                    </div>
                    <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>{apt.specialty}</p>
                    <div style={{marginTop:'1rem', fontSize:'0.85rem', color:'#475569', display:'flex', gap:'1rem'}}>
                      <span>📅 {apt.date}</span>
                      <span>📍 {apt.area}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
