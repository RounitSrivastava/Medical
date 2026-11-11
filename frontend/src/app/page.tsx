"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './landing.module.css';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className={styles.logoIcon}>🩺</span>
          <span className={styles.logoText}>CardioCare AI</span>
        </div>
        <div className={styles.navRight}>
          <div className={styles.navLinks}>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }}>Live Preview</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Our Technology</a>
          </div>
          <button
            className={styles.loginBtn}
            onClick={() => router.push('/login')}
          >
            Patient Portal Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/hero-bg.png"
            alt="Modern Hospital"
            fill
            sizes="100vw"
            className={styles.bgImage}
            priority
          />
          <div className={styles.overlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>Autonomous AI Cardiology Kiosk</div>
          <h1 className={styles.title}>
            The Future of <br />
            <span className={styles.highlight}>Cardiac Consultations</span>
          </h1>
          <p className={styles.subtitle}>
            Connect with Dr. Aisha, your intelligent AI Cardiologist. Get instant symptom triage, live Bluetooth smartwatch EKG monitoring, prescription OCR safety checks, and immediate doctor escalation.
          </p>
          <div className={styles.ctaGroup}>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push('/login')}
            >
              Start Consultation →
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => scrollToSection('features')}
            >
              Learn How It Works
            </button>
          </div>

          {/* Trust Indicators */}
          <div className={styles.trustBar}>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>24/7</span>
              <span className={styles.trustLabel}>Instant Triage</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>&lt; 500ms</span>
              <span className={styles.trustLabel}>AI Response Time</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>60 FPS</span>
              <span className={styles.trustLabel}>Live BLE EKG</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>100%</span>
              <span className={styles.trustLabel}>Private Browser OCR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>CAPABILITIES</span>
          <h2>Why Choose CardioCare AI?</h2>
          <p>Combining clinical cardiology prompts, live wearable sensors, and touchless voice interaction for accessible heart care.</p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🧠</span>
            </div>
            <h3>Dual-Tier Cardiac AI</h3>
            <p>Powered by a 27B clinical Qwen model with sub-second Groq Cloud LPU failover for reliable, empathetic cardiac guidance.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🎙️</span>
            </div>
            <h3>Hands-Free Voice AI</h3>
            <p>Step up and say &ldquo;Hello Doctor&rdquo; to begin a natural voice consultation—designed for effortless, touchless kiosk accessibility.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>⌚</span>
            </div>
            <h3>Live Smartwatch EKG</h3>
            <p>Pairs directly with standard Bluetooth heart-rate wearables to stream live BPM readings and a real-time 60 FPS EKG waveform.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>💊</span>
            </div>
            <h3>Prescription OCR &amp; Care</h3>
            <p>Scans paper prescriptions privately in your browser, flags cardiac contraindications, and matches nearby specialists when needed.</p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className={styles.demoWrapper}>
        <div className={styles.demoSection}>
          <div className={styles.demoContent}>
            <span className={styles.sectionEyebrow}>LIVE WORKSPACE</span>
            <h2>Meet Dr. Aisha</h2>
            <p>Experience an interactive cardiac consultation. Dr. Aisha listens to your symptoms, monitors live pulse telemetry, evaluates medications, and escalates urgent cases to local doctors.</p>
            <ul className={styles.benefitList}>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Real-time Bluetooth vitals &amp; EKG waveform
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Hands-free wake word &amp; spoken guidance
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Instant Emergency SOS &amp; medical reports
              </li>
            </ul>
            <button
              className={styles.demoCtaBtn}
              onClick={() => router.push('/login')}
            >
              Try Consultation Portal →
            </button>
          </div>

          <div className={styles.demoImage}>
            <div className={styles.demoMockup}>
              {/* Window Top Bar */}
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDots}>
                  <span className={styles.mockupDot}></span>
                  <span className={styles.mockupDot}></span>
                  <span className={styles.mockupDot}></span>
                </div>
                <span className={styles.mockupTitle}>CardioCare Consultation</span>
                <span className={styles.mockupBadge}>
                  <span className={styles.mockupBadgeDot}></span>
                  Live
                </span>
              </div>

              {/* Realistic Consultation Preview Body */}
              <div className={styles.mockupBody}>
                {/* Left Mini Sidebar */}
                <div className={styles.mockupSidebar}>
                  <div className={styles.mockupDoctorCard}>
                    <div className={styles.mockupAvatarRing}>
                      <Image
                        src="/avatar.png"
                        alt="Dr. Aisha"
                        width={52}
                        height={52}
                        className={styles.mockupAvatarImg}
                      />
                    </div>
                    <div className={styles.mockupDoctorName}>Dr. Aisha</div>
                    <div className={styles.mockupDoctorRole}>AI Cardiologist</div>
                    <span className={styles.mockupReadyPill}>READY</span>
                  </div>

                  <div className={styles.mockupVitalBox}>
                    <div className={styles.mockupVitalTop}>
                      <span>Heart Rate</span>
                      <strong>72 BPM</strong>
                    </div>
                    <svg className={styles.mockupEkgSvg} viewBox="0 0 140 34" fill="none" aria-hidden="true">
                      <path
                        d="M0 18 L24 18 L30 14 L36 18 L44 18 L48 22 L54 4 L60 30 L65 18 L76 18 L84 12 L92 18 L140 18"
                        stroke="#10b981"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className={styles.mockupMiniStats}>
                    <div>
                      <span>BP</span>
                      <strong>118/78</strong>
                    </div>
                    <div>
                      <span>SpO₂</span>
                      <strong>98%</strong>
                    </div>
                  </div>
                </div>

                {/* Right Mini Chat Panel */}
                <div className={styles.mockupMain}>
                  <div className={styles.mockupChatMessages}>
                    <div className={styles.mockupMsgLeft}>
                      <p>Namaste! I&apos;m Dr. Aisha. How is your heart feeling today?</p>
                    </div>
                    <div className={styles.mockupMsgRight}>
                      <p>Mild chest tightness after climbing stairs.</p>
                    </div>
                    <div className={styles.mockupMsgLeft}>
                      <p>Your live pulse is steady at <strong>72 BPM</strong>. Let&apos;s scan your prescription and check your cardiac risk score.</p>
                      <div className={styles.mockupChipRow}>
                        <span className={styles.mockupChip}>💊 Rx OCR Ready</span>
                        <span className={styles.mockupChip}>📊 Risk Check</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.mockupInputBar}>
                    <span className={styles.mockupMiniIcon}>🎙️</span>
                    <span className={styles.mockupMiniIcon}>💊</span>
                    <span className={styles.mockupPlaceholder}>Message Dr. Aisha...</span>
                    <span className={styles.mockupSendIcon}>➤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Technology Section */}
      <section id="about" className={styles.techSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>ARCHITECTURE</span>
          <h2>Built for Speed, Reliability &amp; Privacy</h2>
          <p>Engineered to run smoothly across village kiosks and personal devices with resilient cloud-edge failover.</p>
        </div>

        <div className={styles.techGrid}>
          <div className={styles.techCard}>
            <div className={styles.techTag}>AI / Inference</div>
            <h3>Qwen 27B + Groq Fallback</h3>
            <p>Primary GPU clinical inference backed by an instant Groq Cloud LPU circuit-breaker so consultations never stall on poor networks.</p>
          </div>

          <div className={styles.techCard}>
            <div className={styles.techTag}>IoT Telemetry</div>
            <h3>Web Bluetooth GATT 0x180D</h3>
            <p>Connects directly from browser to consumer wearables without proprietary drivers, rendering live heart waveforms on HTML5 Canvas.</p>
          </div>

          <div className={styles.techCard}>
            <div className={styles.techTag}>On-Device Vision</div>
            <h3>Client-Side Tesseract WASM</h3>
            <p>Reads prescription photos completely inside browser memory so sensitive medical slips never leave the patient&apos;s device.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.logoIcon}>🩺</span> CardioCare AI
          </div>
          <div className={styles.footerLinks}>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }}>Live Preview</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Technology</a>
            <a href="/login" onClick={(e) => { e.preventDefault(); router.push('/login'); }}>Patient Login</a>
          </div>
        </div>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} CardioCare AI. All rights reserved. For informational purposes only, not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
