"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import Avatar from "../../components/Avatar";
import BookingModal from "../../components/BookingModal";
import AssessmentCard from "../../components/AssessmentCard";
import EKGMonitor from "../../components/EKGMonitor";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
  type?: "text" | "assessment";
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
        reco.lang = "en-US"; // Standard fallback language

        reco.onstart = () => {
          setIsListening(true);
          setAvatarStatus("listening");
        };

        reco.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSend(transcript);
        };

        reco.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            // Silently ignore no-speech errors (happens when user clicks mic but stays quiet)
            console.log("No speech detected. Microphone turned off.");
          } else {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
              alert("Microphone access is blocked! Please check the URL bar of your browser and click the tiny microphone icon to 'Allow' access.");
            } else {
              alert("Microphone error: " + event.error);
            }
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
    if (!recognition) {
      alert("Your browser does not support voice recognition. Please use Google Chrome or Microsoft Edge!");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setAvatarStatus("idle");
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const newMsg: Message = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setAvatarStatus("thinking");
    
    // Intercept Assessment trigger
    const lowerText = text.toLowerCase();
    if (lowerText.includes("assess") || lowerText.includes("risk") || lowerText.includes("check")) {
      setTimeout(() => {
        const aiMsg: Message = { 
          id: Date.now() + 1, 
          sender: "ai", 
          text: "I can help with that. Please complete this quick interactive assessment so I can calculate your risk score.",
          type: "assessment"
        };
        setMessages((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }, 1000);
      return;
    }

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
    } finally {
      setAvatarStatus("idle");
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
  const [showReport, setShowReport] = useState(false);

  // SOS Emergency State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [locatingHospitals, setLocatingHospitals] = useState(false);
  const [emergencyHospitals, setEmergencyHospitals] = useState<any[]>([]);

  const triggerSOS = () => {
    setIsEmergencyMode(true);
    setLocatingHospitals(true);
    
    // Play a siren/alert sound via speech synthesis for dramatic effect
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const alertSpeech = new SpeechSynthesisUtterance("Emergency SOS activated. Locating nearest cardiac hospitals.");
      alertSpeech.rate = 1.2;
      window.speechSynthesis.speak(alertSpeech);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate network delay for dramatic effect
          setTimeout(() => {
            setEmergencyHospitals([
              { name: "City General Hospital (ER)", distance: "1.2 km", time: "4 mins away", phone: "911" },
              { name: "St. Jude Cardiac Center", distance: "2.8 km", time: "8 mins away", phone: "911" },
              { name: "Metro West Emergency", distance: "4.5 km", time: "12 mins away", phone: "911" },
            ]);
            setLocatingHospitals(false);
          }, 2500);
        },
        (error) => {
          // Fallback if location blocked
          setTimeout(() => {
            setEmergencyHospitals([
              { name: "City General Hospital (ER)", distance: "Unknown", time: "Unknown", phone: "911" }
            ]);
            setLocatingHospitals(false);
          }, 2000);
        }
      );
    } else {
      setTimeout(() => {
        setEmergencyHospitals([{ name: "City General Hospital (ER)", distance: "Unknown", time: "Unknown", phone: "911" }]);
        setLocatingHospitals(false);
      }, 2000);
    }
  };
  
  // Calculate some dummy stats for the report
  const patientVitals = {
    hr: "72 BPM",
    bp: "118/78",
    o2: "98%"
  };

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
          <button onClick={triggerSOS} className={styles.sosBtn}>
            🚨 EMERGENCY SOS
          </button>
          <button onClick={() => setShowReport(true)} className={styles.reportBtn}>
            📄 Medical Report
          </button>
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
      
      {/* existing code... */}
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
            <EKGMonitor />
            <div className={styles.vitalCard} style={{marginTop: '1rem'}}>
              <span className={styles.vitalLabel}>Blood Pressure</span>
              <span className={styles.vitalValue}>{patientVitals.bp} <span className={styles.vitalNormal}>(Optimal)</span></span>
            </div>
            <div className={styles.vitalCard}>
              <span className={styles.vitalLabel}>Oxygen</span>
              <span className={styles.vitalValue}>{patientVitals.o2} <span className={styles.vitalNormal}>(Normal)</span></span>
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
                    {m.type === "assessment" && (
                      <AssessmentCard 
                        onComplete={(score, level) => {
                          const aiMsg: Message = { 
                            id: Date.now(), 
                            sender: "ai", 
                            text: `Based on your responses, you have a ${score}% risk score, which indicates a ${level}. I highly recommend clicking 'Find Local Cardiologist' to book an appointment soon. I have also enabled your Medical Report generation.` 
                          };
                          setMessages((prev) => [...prev, aiMsg]);
                          speakResponse(aiMsg.text);
                        }} 
                      />
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

      {/* Auto-Generated Medical Report Modal */}
      {showReport && (
        <div className={styles.modalOverlay} onClick={() => setShowReport(false)}>
          <div className={`${styles.modalContent} printable-report`} onClick={e => e.stopPropagation()} style={{padding: '3rem', maxWidth: '800px', backgroundColor: 'white'}}>
            <div className="no-print" style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem', gap:'1rem'}}>
              <button onClick={() => window.print()} style={{background:'var(--primary)', color:'white', border:'none', padding:'0.8rem 1.5rem', borderRadius:'8px', fontWeight:600, cursor:'pointer'}}>
                📥 Download PDF
              </button>
              <button onClick={() => setShowReport(false)} style={{background:'#f1f5f9', color:'#334155', border:'none', padding:'0.8rem 1.5rem', borderRadius:'8px', fontWeight:600, cursor:'pointer'}}>
                Close
              </button>
            </div>
            
            <div style={{borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem'}}>
              <h1 style={{fontSize: '2.2rem', color: '#0f172a', margin: 0}}>Medical Assessment Report</h1>
              <p style={{color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem'}}>Generated by CardioCare AI Assistant (Dr. Aisha)</p>
            </div>

            <div style={{display: 'flex', gap: '2rem', marginBottom: '2rem'}}>
              <div style={{flex: 1, background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <h3 style={{color: '#334155', marginBottom: '1rem'}}>Patient Details</h3>
                <p><strong>Name:</strong> {username}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
              </div>
              <div style={{flex: 1, background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <h3 style={{color: '#334155', marginBottom: '1rem'}}>Vitals Logged</h3>
                <p><strong>Heart Rate:</strong> {patientVitals.hr}</p>
                <p><strong>Blood Pressure:</strong> {patientVitals.bp}</p>
                <p><strong>Oxygen Level:</strong> {patientVitals.o2}</p>
              </div>
            </div>

            <div style={{marginBottom: '2rem'}}>
              <h3 style={{color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem'}}>Patient Chief Complaints (Transcribed from Audio/Chat)</h3>
              {messages.filter(m => m.sender === 'user').length > 0 ? (
                <ul style={{lineHeight: 1.6, color: '#475569', marginTop: '1rem', paddingLeft: '1.5rem'}}>
                  {messages.filter(m => m.sender === 'user').map((m, i) => (
                    <li key={i} style={{marginBottom: '0.5rem'}}>"{m.text}"</li>
                  ))}
                </ul>
              ) : (
                <p style={{lineHeight: 1.6, color: '#94a3b8', fontStyle: 'italic', marginTop: '1rem'}}>
                  No voice or text complaints recorded in this session.
                </p>
              )}
            </div>

            <div style={{marginBottom: '2rem'}}>
              <h3 style={{color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem'}}>AI Doctor's Assessment</h3>
              <p style={{lineHeight: 1.6, color: '#475569', marginTop: '1rem'}}>
                Based on the real-time interaction and provided vitals (Heart Rate: {patientVitals.hr}), the patient's cardiovascular state appears stable, but preventative care is recommended based on the reported symptoms above.
              </p>
            </div>

            <div style={{marginBottom: '2rem'}}>
              <h3 style={{color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem'}}>Personalized Diet & Lifestyle Plan</h3>
              <ul style={{lineHeight: 1.8, color: '#475569', marginTop: '1rem', paddingLeft: '1.5rem'}}>
                <li><strong>Dietary:</strong> Increase intake of Omega-3 fatty acids (e.g., salmon, walnuts). Reduce sodium intake to &lt;1,500mg per day to maintain optimal blood pressure ({patientVitals.bp}).</li>
                <li><strong>Activity:</strong> 30 minutes of moderate aerobic exercise (brisk walking) 5 days a week.</li>
                <li><strong>Monitoring:</strong> Continue monitoring resting heart rate and schedule a follow-up with a local cardiologist.</li>
              </ul>
            </div>
            
            <div style={{marginTop: '4rem', paddingTop: '2rem', borderTop: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem'}}>
              <p>This report is generated by Artificial Intelligence for informational purposes and does not constitute a formal medical diagnosis. Please consult a registered physician for medical advice.</p>
            </div>
          </div>
        </div>
      )}
      {/* Emergency SOS Modal */}
      {isEmergencyMode && (
        <div className={styles.sosOverlay}>
          <div className={styles.sosContent}>
            <div className={styles.sosHeader}>
              <span style={{fontSize: '2.5rem'}}>🚨</span>
              <h2>EMERGENCY LOCKDOWN</h2>
            </div>
            
            {locatingHospitals ? (
              <div className={styles.sosLoading}>
                <h3 style={{animation: 'pulse 1.5s infinite'}}>Locating GPS Position...</h3>
                <p>Searching for nearest cardiac emergency centers...</p>
              </div>
            ) : (
              <>
                <h3 style={{color: '#f8fafc', marginBottom: '1rem'}}>Nearest Emergency Centers</h3>
                <div className={styles.hospitalList}>
                  {emergencyHospitals.map((hosp, i) => (
                    <div key={i} className={styles.hospitalCard}>
                      <div className={styles.hospitalInfo}>
                        <h3>{hosp.name}</h3>
                        <p>Distance: {hosp.distance}</p>
                        <span className={styles.distanceBadge}>ETA: {hosp.time}</span>
                      </div>
                      <div className={styles.actionBtns}>
                        <button className={styles.callBtn} onClick={() => alert(`Calling ${hosp.phone} for ${hosp.name}...`)}>📞 Call</button>
                        <button className={styles.navBtn} onClick={() => alert(`Opening Google Maps navigation to ${hosp.name}...`)}>🗺️ Navigate</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <button className={styles.cancelSos} onClick={() => setIsEmergencyMode(false)}>
              Cancel Emergency Mode
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
