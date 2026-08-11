"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

export default function Register() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('https://medical-x8t7.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age: parseInt(age) || 0,
          gender,
          email,
          password
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Automatically login the user and save profile
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        router.push('/consultation');
      } else {
        setError(data.detail || 'Registration failed');
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
      <div className={styles.registerCard}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>🩺</span>
          <h1 className={styles.title}>CardioCare Portal</h1>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label className={styles.label}>Age</label>
              <input 
                type="number" 
                className={styles.input} 
                placeholder="e.g. 45"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label className={styles.label}>Gender</label>
              <select className={styles.select} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Register as Patient'}
          </button>
        </form>
        
        <div className={styles.loginLink}>
          Already have an account? 
          <Link href="/login" className={styles.link}>
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
