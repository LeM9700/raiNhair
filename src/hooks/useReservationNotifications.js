import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';


export default function useReservationNotifications() {
  const isFirstLoad = useRef(true);
  const [hasNewReservation, setHasNewReservation] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('../../public/sounds/notification.mp3');
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reservations'), where('status', '==', 'en attente'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setNotifications(snapshot.docs.map(doc => ({
          id: doc.id,
          title: `Réservation de ${doc.data().name}`,
          text: doc.data().prestation || '',
          date: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        })));
        setUnreadCount(snapshot.size);
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          toast.info(`🚕 Nouvelle réservation de ${data.name} !`);
          setHasNewReservation(true);

          // Ajoute la notification à la liste
          setNotifications(prev => [
            {
              id: change.doc.id,
              title: `Réservation de ${data.name}`,
              text: data.prestation || '',
              date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            },
            ...prev,
          ]);
          setUnreadCount(prev => prev + 1);

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

  return { hasNewReservation, setHasNewReservation, notifications, unreadCount };
}