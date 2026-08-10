"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect to consultation
    router.push('/consultation');
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.icon}>🩺</div>
          <h1 className={styles.title}>Cardio AI Portal</h1>
          <p className={styles.subtitle}>Sign in to access your medical consultation</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className={styles.loginBtn}>
            Secure Login
          </button>
        </form>

        <div className={styles.footer}>
          <p>Need an account? <a href="#">Register as a new patient</a></p>
          <p className={styles.disclaimer}>
            Access to this portal is restricted to authorized patients and medical personnel.
          </p>
        </div>
      </div>
    </main>
  );
}
