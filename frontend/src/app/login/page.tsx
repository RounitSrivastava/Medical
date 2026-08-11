"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          router.push('/consultation');
        }
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.icon}>🩺</div>
          <h1 className={styles.title}>Cardio AI Portal</h1>
          <p className={styles.subtitle}>Sign in to access your medical consultation</p>
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email or Username</label>
            <input 
              type="text" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com or admin"
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
          
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Need an account? <a href="/register">Register as a new patient</a></p>
          <p className={styles.disclaimer}>
            Access to this portal is restricted to authorized patients and medical personnel.
          </p>
        </div>
      </div>
    </main>
  );
}
