"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './EKGMonitor.module.css';

interface EKGMonitorProps {
  onBpmChange?: (bpm: number) => void;
}

export default function EKGMonitor({ onBpmChange }: EKGMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bpm, setBpm] = useState(0);
  const [isBluetooth, setIsBluetooth] = useState(false);
  const [deviceName, setDeviceName] = useState<string>("");
  const [isPairing, setIsPairing] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);

  const onBpmChangeRef = useRef(onBpmChange);
  useEffect(() => {
    onBpmChangeRef.current = onBpmChange;
  });

  // Notify parent on BPM change safely
  useEffect(() => {
    onBpmChangeRef.current?.(bpm);
  }, [bpm]);

  // Removed simulated BPM fluctuation to require real Bluetooth connection

  // Dynamic EKG Canvas Waveform Animation
  useEffect(() => {
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
      
      time++;
      let y = height / 2;
      
      if (bpm > 0 && isBluetooth) {
        // Dynamically calculate ECG spike cycle based on current BPM
        const cycleLength = Math.max(40, Math.floor(5400 / bpm));
        const cycle = time % cycleLength;
        
        // Simulate physiological ECG waveform (P-Q-R-S-T complexes)
        if (cycle === 8) y = height / 2 - 4; // P wave
        else if (cycle === 12) y = height / 2 + 2;
        else if (cycle === 18) y = height / 2 + 8; // Q wave
        else if (cycle === 20) y = height / 4 - 18; // R wave (sharp systolic spike)
        else if (cycle === 22) y = height - 12; // S wave (diastolic rebound)
        else if (cycle === 25) y = height / 2;
        else if (cycle === 35) y = height / 2 - 6; // T wave
        else if (cycle === 38) y = height / 2;
      }
      
      // Add slight baseline drift noise
      if (y === height / 2) {
        y += (Math.random() - 0.5) * 1.5;
      }

      data.push(y);

      // Draw ECG line
      ctx.beginPath();
      ctx.moveTo(0, data[0]);
      for (let i = 1; i < width; i++) {
        ctx.lineTo(i, data[i]);
      }
      
      ctx.strokeStyle = isBluetooth ? '#38bdf8' : '#64748b'; // Electric blue for BT, Slate for Disconnected
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.shadowColor = isBluetooth ? 'rgba(56, 189, 248, 0.6)' : 'rgba(100, 116, 139, 0.2)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [bpm, isBluetooth]);

  // Connect to Real Bluetooth Heart Rate Sensor (Smartwatch / Fitness Band)
  const handleConnectBluetooth = async () => {
    if (typeof window === "undefined") return;

    if (!(navigator as any).bluetooth) {
      alert("Web Bluetooth is supported on Google Chrome, Microsoft Edge, and Opera.\n\nTip: On mobile devices, ensure Bluetooth is turned on in your device settings.");
      return;
    }

    setIsPairing(true);

    try {
      // Request standard Bluetooth GATT Heart Rate service (0x180D)
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information']
      });

      setDeviceName(device.name || "Bluetooth Heart Sensor");
      setBluetoothDevice(device);

      // Connect to GATT Server
      const server = await device.gatt.connect();

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setIsBluetooth(false);
        setDeviceName("");
        setBluetoothDevice(null);
        setBpm(0);
        console.log("Bluetooth device disconnected");
      });

      // Get Heart Rate Service & Characteristic
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      // Start receiving live heart rate notifications
      await characteristic.startNotifications();

      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value as DataView;
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        let heartRate = 0;

        if (rate16Bits) {
          heartRate = value.getUint16(1, /*littleEndian=*/true);
        } else {
          heartRate = value.getUint8(1);
        }

        if (heartRate > 0 && heartRate < 250) {
          setBpm(heartRate);
        }
      });

      setIsBluetooth(true);
      setIsPairing(false);
    } catch (error: any) {
      console.log("Bluetooth pair cancelled or unavailable:", error);
      setIsPairing(false);
      // Gracefully maintain simulated live stream if user cancelled picker
    }
  };

  const handleDisconnect = () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setIsBluetooth(false);
    setDeviceName("");
    setBluetoothDevice(null);
    setBpm(0);
  };

  return (
    <div className={styles.monitorContainer}>
      <div className={styles.gridOverlay}></div>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>Live Cardiac EKG</span>
        </div>
        
        <div className={`${styles.status} ${isBluetooth ? styles.statusBt : ""}`}>
          <div className={`${styles.statusIndicator} ${isBluetooth ? styles.statusIndicatorBt : ""}`}></div>
          <span>{isBluetooth ? "Bluetooth Stream" : "Disconnected"}</span>
        </div>
      </div>
      
      {/* BPM Counter */}
      <div className={styles.bpmContainer}>
        <span className={styles.heartPulseIcon}>❤️</span>
        <span className={`${styles.bpmValue} ${isBluetooth ? styles.bpmValueBt : ""}`}>{bpm > 0 ? bpm : "--"}</span>
        <span className={styles.bpmLabel}>BPM</span>
      </div>
      
      {/* Live Waveform Canvas */}
      <canvas 
        ref={canvasRef} 
        width={310} 
        height={80} 
        className={styles.canvas}
      />

      {/* Bluetooth Controls Footer */}
      <div className={styles.bluetoothFooter}>
        <div className={styles.deviceInfo}>
          {isBluetooth ? (
            <>
              <span>⚡</span>
              <span>{deviceName || "Heart Rate Watch"}</span>
            </>
          ) : (
            <span>📡 Waiting for Device</span>
          )}
        </div>

        {isBluetooth ? (
          <button 
            className={`${styles.btBtn} ${styles.disconnectBtn}`}
            onClick={handleDisconnect}
            title="Disconnect Bluetooth sensor"
          >
            Disconnect
          </button>
        ) : (
          <button 
            className={styles.btBtn} 
            onClick={handleConnectBluetooth}
            disabled={isPairing}
            title="Connect Apple Watch, Wear OS, Garmin, Polar, or Bluetooth Fitness Tracker"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17" />
            </svg>
            <span>{isPairing ? "Searching..." : "Pair Bluetooth"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
