"use client";

import React, { useState } from 'react';
import styles from './AssessmentCard.module.css';

interface AssessmentCardProps {
  onComplete: (score: number, level: string) => void;
}

export default function AssessmentCard({ onComplete }: AssessmentCardProps) {
  const [painLevel, setPainLevel] = useState(5);
  const [shortnessOfBreath, setShortnessOfBreath] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const calculateRisk = () => {
    let risk = painLevel * 5; // Max 50 from pain
    if (shortnessOfBreath) risk += 25;
    if (dizziness) risk += 25;
    return risk;
  };

  const handleSubmit = () => {
    const calculatedScore = calculateRisk();
    setScore(calculatedScore);
    setSubmitted(true);
    
    let level = "Low Risk";
    if (calculatedScore > 40) level = "Moderate Risk";
    if (calculatedScore > 75) level = "High Risk! Seek Medical Attention.";
    
    // Notify parent component so AI can respond
    setTimeout(() => {
      onComplete(calculatedScore, level);
    }, 1500);
  };

  if (submitted) {
    const isHigh = score > 75;
    const isMed = score > 40 && score <= 75;
    const circleClass = isHigh ? styles.highRisk : (isMed ? styles.medRisk : styles.lowRisk);
    
    return (
      <div className={styles.card}>
        <div className={styles.resultContainer}>
          <div className={`${styles.circle} ${circleClass}`}>
            {score}%
          </div>
          <div className={styles.resultText}>
            Cardiac Risk Score
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Cardiac Symptom Assessment</h4>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Chest Pain Level (1-10)</label>
        <input 
          type="range" 
          min="1" max="10" 
          value={painLevel} 
          onChange={(e) => setPainLevel(parseInt(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.painValue}>{painLevel}</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Shortness of Breath?</label>
        <div className={styles.toggleGroup}>
          <button 
            className={`${styles.toggleBtn} ${shortnessOfBreath ? styles.active : ''}`}
            onClick={() => setShortnessOfBreath(true)}
          >Yes</button>
          <button 
            className={`${styles.toggleBtn} ${!shortnessOfBreath ? styles.active : ''}`}
            onClick={() => setShortnessOfBreath(false)}
          >No</button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Dizziness or Fainting?</label>
        <div className={styles.toggleGroup}>
          <button 
            className={`${styles.toggleBtn} ${dizziness ? styles.active : ''}`}
            onClick={() => setDizziness(true)}
          >Yes</button>
          <button 
            className={`${styles.toggleBtn} ${!dizziness ? styles.active : ''}`}
            onClick={() => setDizziness(false)}
          >No</button>
        </div>
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        Analyze Risk Score
      </button>
    </div>
  );
}
