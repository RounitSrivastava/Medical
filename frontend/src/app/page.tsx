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
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🩺</span>
          <span className={styles.logoText}>CardioCare AI</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#about">Our Technology</a>
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
            className={styles.bgImage}
            priority
          />
          <div className={styles.overlay}></div>
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.badge}>State-of-the-art AI Healthcare</div>
          <h1 className={styles.title}>
            The Future of <br />
            <span className={styles.highlight}>Cardiac Consultations</span>
          </h1>
          <p className={styles.subtitle}>
            Connect with Dr. Aisha, your highly advanced AI Cardiologist. Get instant, accurate, and empathetic medical guidance backed by verified clinical datasets.
          </p>
          <div className={styles.ctaGroup}>
            <button 
              className={styles.primaryBtn}
              onClick={() => router.push('/login')}
            >
              Start Consultation
            </button>
            <button className={styles.secondaryBtn}>
              Learn How It Works
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className={styles.trustBar}>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>24/7</span>
              <span className={styles.trustLabel}>Availability</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>99.9%</span>
              <span className={styles.trustLabel}>RAG Accuracy</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>HIPAA</span>
              <span className={styles.trustLabel}>Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why Choose CardioCare AI?</h2>
          <p>We combine cutting-edge artificial intelligence with deep medical knowledge to provide unparalleled cardiac support.</p>
        </div>
        
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🧠</span>
            </div>
            <h3>Advanced AI RAG</h3>
            <p>Powered by the latest LangChain models and grounded strictly in verified cardiac datasets. Zero hallucinations, 100% data-driven answers.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🎙️</span>
            </div>
            <h3>Native Voice Interaction</h3>
            <p>Speak naturally. Our system understands your voice and responds conversationally with a calming, empathetic AI voice.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🔒</span>
            </div>
            <h3>Bank-Grade Security</h3>
            <p>Your medical data and consultation logs are encrypted end-to-end. We adhere to the absolute highest standards of medical privacy.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🏥</span>
            </div>
            <h3>Book Local Specialists</h3>
            <p>Seamlessly transition from AI advice to real-world care. Our platform instantly connects you with top-rated cardiologists in your local area for in-person appointments.</p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className={styles.demoSection}>
        <div className={styles.demoContent}>
          <h2>Meet Dr. Aisha</h2>
          <p>Experience a truly interactive consultation. Dr. Aisha doesn't just read data—she listens to you, analyzes your symptoms in real-time, and guides you through your health journey with a personalized dashboard.</p>
          <ul className={styles.benefitList}>
            <li>✔️ Real-time vitals integration</li>
            <li>✔️ Speech-to-text enabled</li>
            <li>✔️ Beautiful, intuitive dashboard</li>
          </ul>
        </div>
        <div className={styles.demoImage}>
          <div className={styles.demoMockup}>
            {/* Visual representation of the dashboard */}
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDot}></div>
              <div className={styles.mockupDot}></div>
              <div className={styles.mockupDot}></div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupSidebar}></div>
              <div className={styles.mockupMain}>
                 <div className={styles.mockupMsgLeft}></div>
                 <div className={styles.mockupMsgRight}></div>
                 <div className={styles.mockupInput}></div>
              </div>
            </div>
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
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Medical Disclaimer</a>
          </div>
        </div>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} CardioCare AI. All rights reserved. For informational purposes only, not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
