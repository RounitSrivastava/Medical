"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './landing.module.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🩺</span>
          <span className={styles.logoText}>CardioCare AI</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button 
            className={styles.loginBtn}
            onClick={() => router.push('/login')}
          >
            Patient Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Next-Gen Healthcare</div>
          <h1 className={styles.title}>
            Your Personal AI <br />
            <span className={styles.highlight}>Cardiologist</span>
          </h1>
          <p className={styles.subtitle}>
            Experience the future of heart health. Get instant, accurate consultations, analyze your symptoms, and monitor your vitals with our state-of-the-art AI assistant, Dr. Aisha.
          </p>
          <div className={styles.ctaGroup}>
            <button 
              className={styles.primaryBtn}
              onClick={() => router.push('/login')}
            >
              Start Consultation
            </button>
            <button className={styles.secondaryBtn}>
              Learn More
            </button>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          {/* A stylized abstract representation of heart/health */}
          <div className={styles.abstractArt}>
            <div className={styles.circle1}></div>
            <div className={styles.circle2}></div>
            <div className={styles.heartPulse}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose CardioCare AI?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🧠</div>
            <h3>Advanced AI RAG</h3>
            <p>Powered by the latest LangChain models, trained on extensive, verified cardiac datasets for unparalleled accuracy.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎙️</div>
            <h3>Voice Enabled</h3>
            <p>Speak naturally. Our system understands your voice and responds conversationally, just like a real doctor.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Secure & Private</h3>
            <p>Your medical data is encrypted and strictly confidential. We adhere to the highest standards of medical privacy.</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} CardioCare AI. All rights reserved. For informational purposes only.</p>
      </footer>
    </div>
  );
}
