"use client";

import React, { useState } from 'react';
import styles from './BookingModal.module.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  lat: number;
  lng: number;
  area: string;
  calculatedDistance?: number;
}

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Safely get a character for the avatar
const getInitials = (name: string) => {
  if (!name) return 'D';
  const parts = name.trim().split(' ');
  if (parts.length > 1 && parts[1].length > 0) {
    return parts[1][0].toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

interface BookingModalProps {
  onClose: () => void;
}

export default function BookingModal({ onClose }: BookingModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookedDoctor, setBookedDoctor] = useState<Doctor | null>(null);
  const [selectedDoctorForSlot, setSelectedDoctorForSlot] = useState<Doctor | null>(null);
  const [bookedSlot, setBookedSlot] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  React.useEffect(() => {
    fetch('https://medical-x8t7.onrender.com/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch doctors", err);
        setLoading(false);
      });
  }, []);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          alert("Error getting location. Please check your browser permissions.");
          console.error(error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Calculate distance for all doctors if location is known
  const doctorsWithDistance = doctors.map(doc => {
    if (userLocation) {
      return { ...doc, calculatedDistance: calculateDistance(userLocation.lat, userLocation.lng, doc.lat, doc.lng) };
    }
    return doc;
  });

  // Filter and Sort
  const filteredDoctors = doctorsWithDistance.filter(doc => 
    doc.area.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    searchTerm.trim() === ''
  ).sort((a, b) => {
    if (a.calculatedDistance && b.calculatedDistance) {
      return a.calculatedDistance - b.calculatedDistance; // Closest first
    }
    return 0;
  });

  const handleBook = (doctor: Doctor) => {
    setSelectedDoctorForSlot(doctor);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        
        {/* Success State */}
        {bookedDoctor ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h2>Appointment Confirmed!</h2>
            <p>Your consultation with <strong>{bookedDoctor.name}</strong> on <strong>{bookedSlot}</strong> has been successfully booked.</p>
            <p>You will receive an SMS with the exact clinic address and timing shortly.</p>
            <button className={styles.doneBtn} onClick={onClose}>Return to Dashboard</button>
          </div>
        ) : selectedDoctorForSlot ? (
          /* Time Slot Selection State */
          <div className={styles.slotSelectionState}>
            <div className={styles.modalHeader}>
              <h2>Select a Time Slot</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedDoctorForSlot(null)}>↩ Back</button>
            </div>
            <div className={styles.slotContent}>
              <div className={styles.doctorHeaderWrapper} style={{ marginBottom: '2rem', justifyContent: 'center' }}>
                <div className={styles.doctorAvatar}>
                  {getInitials(selectedDoctorForSlot.name)}
                </div>
                <div className={styles.doctorInfo}>
                  <h3>{selectedDoctorForSlot.name}</h3>
                  <p>{selectedDoctorForSlot.specialty}</p>
                </div>
              </div>
              
              <h3 className={styles.slotSubtitle}>Available Today</h3>
              <div className={styles.slotGrid}>
                {['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM', '06:30 PM'].map(slot => (
                  <button 
                    key={slot} 
                    className={styles.slotBtn}
                    onClick={() => {
                      setBookedSlot(slot);
                      setBookedDoctor(selectedDoctorForSlot);
                      
                      // Save to LocalStorage
                      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                      savedAppointments.push({
                        doctorName: selectedDoctorForSlot.name,
                        specialty: selectedDoctorForSlot.specialty,
                        area: selectedDoctorForSlot.area,
                        time: slot,
                        date: new Date().toLocaleDateString()
                      });
                      localStorage.setItem('appointments', JSON.stringify(savedAppointments));
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h2>Find a Local Cardiologist</h2>
              <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>
            
            <div className={styles.searchSection}>
              <div className={styles.searchRow}>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="Enter your City, Area, or Pincode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button className={styles.locationBtn} onClick={handleGetLocation}>
                  📍 Use My Location
                </button>
              </div>
            </div>

            <div className={styles.resultsSection}>
              {loading ? (
                <div className={styles.emptyState}>Loading local doctors...</div>
              ) : filteredDoctors.length > 0 ? (
                <div className={styles.doctorGrid}>
                  {filteredDoctors.map(doc => (
                    <div key={doc.id} className={styles.doctorCard}>
                      <div className={styles.doctorHeaderWrapper}>
                        <div className={styles.doctorAvatar}>
                          {getInitials(doc.name)}
                        </div>
                        <div className={styles.doctorInfo}>
                          <h3>{doc.name}</h3>
                          <p>{doc.specialty}</p>
                        </div>
                      </div>
                      <div className={styles.doctorDetails}>
                        <span>📍 {doc.area} </span>
                        <span>🚗 {doc.calculatedDistance ? `${doc.calculatedDistance.toFixed(1)} km` : `Unknown`}</span>
                        <span>⭐ {doc.rating} • 🩺 {doc.experience} exp</span>
                      </div>
                      <button className={styles.bookBtn} onClick={() => handleBook(doc)}>
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No cardiologists found in "{searchTerm}". Try searching a different area.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
