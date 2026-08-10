"use client";

import React from 'react';
import Image from 'next/image';
import styles from './Avatar.module.css';

interface AvatarProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
}

export default function Avatar({ status }: AvatarProps) {
  return (
    <div className={styles.avatarContainer}>
      <div className={`${styles.orb} ${styles[status]}`}>
        <div className={styles.imageWrapper}>
          <Image 
            src="/avatar.png" 
            alt="AI Doctor Avatar" 
            fill 
            className={styles.avatarImage} 
            priority
          />
        </div>
        <div className={styles.ring1}></div>
        <div className={styles.ring2}></div>
        <div className={styles.ring3}></div>
      </div>
      <div className={styles.statusText}>
        {status === 'idle' && "Ready"}
        {status === 'listening' && "Listening..."}
        {status === 'thinking' && "Analyzing..."}
        {status === 'speaking' && "Responding"}
      </div>
    </div>
  );
}
