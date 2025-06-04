import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ReservationsTerminees() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, 'reservations'),
      where('status', '==', 'terminée'),
      where('chauffeurId', '==', uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => {
          const res = doc.data();
          return {
            id: doc.id,
            name: res.name ?? "Inconnu",
            phone: res.phone ?? "Non renseigné",
            location: res.location ?? "Non renseigné",
            destination: res.destination ?? "Non renseignée",
            date: res.date ?? "Date inconnue",
            time: res.time ?? "Non renseigné",
            sentAt: res.sentAt ?? "Non renseigné",
            passengers: res.passengers ?? "Non renseigné",
            payment: res.payment ?? "Non renseigné",
            prix: res.prix ?? "0",
            serviceType: res.serviceType ?? "Non renseigné",
          };
        }).sort((a, b) =>
          a.sentAt.localeCompare(b.sentAt) ||
          a.date.localeCompare(b.date) ||
          a.time.localeCompare(b.time)
        );
        setReservations(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }, err => {
      console.error(err);
      setError(true);
    });

    return () => unsub();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur de chargement</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mes réservations terminées</h2>
      {reservations.length === 0 ? (
        <p>Aucune réservation terminée</p>
      ) : reservations.map(res => (
        <div key={res.id} className="bg-white p-4 shadow rounded">
          <p>Client : {res.name}</p>
          <p>Départ : {res.location}</p>
          <p>Destination : {res.destination}</p>
          <p>Heure : {res.date} {res.time}</p>
          <p>Passagers : {res.passengers}</p>
          <p>Prix : {res.prix} €</p>
        </div>
      ))}
    </div>
  );
}
