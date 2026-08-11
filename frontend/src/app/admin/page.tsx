"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  lat: number;
  lng: number;
  area: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [area, setArea] = useState('');

  const fetchDoctors = () => {
    fetch('https://medical-x8t7.onrender.com/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error("Failed to fetch doctors", err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDoc = { 
      name, 
      specialty, 
      experience, 
      rating, 
      lat: parseFloat(lat), 
      lng: parseFloat(lng), 
      area 
    };
    
    try {
      const res = await fetch('https://medical-x8t7.onrender.com/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      
      if (res.ok) {
        // Reset form
        setName('');
        setSpecialty('');
        setExperience('');
        setRating('');
        setLat('');
        setLng('');
        setArea('');
        
        // Refresh table
        fetchDoctors();
      }
    } catch (err) {
      console.error("Failed to add doctor", err);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>⚙️</span>
          <h1 className={styles.title}>CardioCare Admin</h1>
        </div>
        <div className={styles.navBtns}>
          <button onClick={() => router.push('/consultation')} className={styles.btn}>Go to Dashboard</button>
          <button onClick={() => router.push('/')} className={styles.btn}>Sign Out</button>
        </div>
      </header>

      <div className={styles.container}>
        {/* Add Doctor Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Add New Doctor</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input type="text" className={styles.input} required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Jane Smith" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Specialty</label>
              <input type="text" className={styles.input} required value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. Senior Cardiologist" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Experience</label>
              <input type="text" className={styles.input} required value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 10 Years" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Rating</label>
              <input type="text" className={styles.input} required value={rating} onChange={e => setRating(e.target.value)} placeholder="e.g. 4.9 ⭐" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location / Area</label>
              <input type="text" className={styles.input} required value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Downtown" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Latitude</label>
              <input type="number" step="any" className={styles.input} required value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 40.7128" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Longitude</label>
              <input type="number" step="any" className={styles.input} required value={lng} onChange={e => setLng(e.target.value)} placeholder="e.g. -74.0060" />
            </div>
            
            <button type="submit" className={styles.submitBtn}>+ Add Doctor to Registry</button>
          </form>
        </div>

        {/* Doctors List */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Registered Doctors Registry</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Area</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td><strong>{doc.name}</strong></td>
                    <td><span className={styles.badge}>{doc.specialty}</span></td>
                    <td>{doc.area}</td>
                    <td>{doc.rating}</td>
                  </tr>
                ))}
                {doctors.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No doctors registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
