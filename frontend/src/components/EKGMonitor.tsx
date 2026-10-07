"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './EKGMonitor.module.css';

export default function EKGMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bpm, setBpm] = useState(72);
  const [isConnected, setIsConnected] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [isRealDevice, setIsRealDevice] = useState(false);

  useEffect(() => {
    if (!isConnected || isRealDevice) return;
    
    // Fluctuate BPM slightly
    const interval = setInterval(() => {
      setBpm(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        let newBpm = prev + change;
        if (newBpm < 65) newBpm = 65;
        if (newBpm > 85) newBpm = 85;
        return newBpm;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    
    // Create an array to hold the Y values
    const data: number[] = new Array(width).fill(height / 2);
    
    let time = 0;
    let animationFrameId: number;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Shift data to the left
      data.shift();
      
      // Generate new point on the right
      time++;
      const cycle = time % 100;
      let y = height / 2;
      
      // Simulate ECG waveform
      if (cycle === 10) y = height / 2 - 5; // P wave
      else if (cycle === 15) y = height / 2 + 2;
      else if (cycle === 25) y = height / 2 + 10; // Q wave
      else if (cycle === 28) y = height / 4 - 20; // R wave (spike up)
      else if (cycle === 31) y = height - 10; // S wave (spike down)
      else if (cycle === 35) y = height / 2;
      else if (cycle === 50) y = height / 2 - 8; // T wave
      else if (cycle === 55) y = height / 2;
      
      // Add slight noise
      if (y === height / 2) {
        y += (Math.random() - 0.5) * 2;
      }

      data.push(y);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(0, data[0]);
      for (let i = 1; i < width; i++) {
        ctx.lineTo(i, data[i]);
      }
      
      ctx.strokeStyle = '#10b981'; // Emerald color
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isConnected]);

  const handleConnect = async () => {
    setIsPairing(true);
    
    try {
      if (navigator.bluetooth) {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }]
        });
        
        console.log("Connected to Bluetooth Device:", device.name);
        
        // Connect to GATT Server to stream live real data!
        const server = await device.gatt?.connect();
        if (server) {
          const service = await server.getPrimaryService('heart_rate');
          const characteristic = await service.getCharacteristic('heart_rate_measurement');
          
          await characteristic.startNotifications();
          
          characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            // Parse standard BLE Heart Rate Measurement format
            const flags = value.getUint8(0);
            const rate16Bits = flags & 0x1;
            const currentBpm = rate16Bits ? value.getUint16(1, true) : value.getUint8(1);
            setBpm(currentBpm);
          });
          
          setIsRealDevice(true);
          setIsPairing(false);
          setIsConnected(true);
          return;
        }
      }
      throw new Error("Web Bluetooth not supported or failed");
    } catch (error) {
      console.log("Bluetooth connection failed or cancelled. Using simulated device data.", error);
      setIsRealDevice(false);
      setTimeout(() => {
        setIsPairing(false);
        setIsConnected(true);
      }, 1500);
    }
  };

  return (
    <div className={styles.monitorContainer}>
      <div className={styles.gridOverlay}></div>
      <div className={styles.header}>
        <span className={styles.title}>Live Heart Rate</span>
        <div className={styles.status}>
          {isConnected ? (
            <>
              <div className={styles.statusIndicator}></div>
              Connected
            </>
          ) : (
            <span style={{color: '#64748b', animation: isPairing ? 'pulse 1s infinite' : 'none'}}>
              {isPairing ? 'Pairing...' : 'Disconnected'}
            </span>
          )}
        </div>
      </div>
      
      {isConnected ? (
        <>
          <div className={styles.bpmContainer}>
            <span className={styles.bpmValue}>{bpm}</span>
            <span className={styles.bpmLabel}>BPM</span>
          </div>
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={80} 
            className={styles.canvas}
          />
        </>
      ) : (
        <div className={styles.connectOverlay}>
          <button 
            className={styles.connectBtn} 
            onClick={handleConnect}
            disabled={isPairing}
          >
            {isPairing ? 'Searching for device...' : 'Pair Smartwatch'}
          </button>
        </div>
      )}
    </div>
  );
}
