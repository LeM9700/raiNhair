import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';

export default function useReservationNotifications() {
  const isFirstLoad = useRef(true);
  const [hasNewReservation, setHasNewReservation] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reservations'), where('status', '==', 'en attente'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          toast.info(`🚕 Nouvelle réservation de ${data.name} !`);
          setHasNewReservation(true);

          if (document.hidden) {  // veille onglet inactif
          playNotification();
        }

          // Son
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          // Vibration
          if (navigator.vibrate) {
            navigator.vibrate([300, 200, 300]);
          }
        }
      });
    });


    return () => unsubscribe();
  }, []);

    const playNotification = () => {
    const audio = new Audio('/sounds/notification.mp3'); 
    audio.play();
  };

  return { hasNewReservation, setHasNewReservation };
}
