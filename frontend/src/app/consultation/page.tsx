"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import Avatar from "../../components/Avatar";
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
      setAvatarStatus("speaking");
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a female Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female')) || 
                          voices.find(v => v.lang.includes('en-IN'));
      if (indianVoice) {
          utterance.voice = indianVoice;
      }

      utterance.onend = () => {
        setAvatarStatus("idle");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setAvatarStatus("idle");
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>🩺</span>
          <h1 className={styles.title}>CardioCare Portal</h1>
        </div>
        <button onClick={() => router.push('/')} className={styles.logoutBtn}>
          Sign Out
        </button>
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
    </main>
  );
}
