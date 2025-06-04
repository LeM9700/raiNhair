import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function AdminReservationsTerminees() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reservations'), where('status', '==', 'terminée'));

    const unsub = onSnapshot(q, async (snapshot) => {
      try {
        const results = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() ?? {};
          let chauffeur = null;
          if (data.chauffeurId) {
            const chauffeurSnap = await getDoc(doc(db, 'chauffeurs', data.chauffeurId));
            chauffeur = chauffeurSnap.exists() ? chauffeurSnap.data() : null;
          }
          return {
            id: docSnap.id,
            name: data.name ?? "Inconnu",
            phone: data.phone ?? "Non renseigné",
            location: data.location ?? "Non renseigné",
            destination: data.destination ?? "Non renseignée",
            date: data.date ?? "Date inconnue",
            time: data.time ?? "Non renseigné",
            sentAt: data.sentAt ?? "Non renseigné",
            prix: data.prix ?? "0",
            serviceType: data.serviceType ?? "Non renseigné",
            chauffeur: chauffeur ?? {},
          };
        }));

        const sorted = results.sort((a, b) =>
          a.sentAt.localeCompare(b.sentAt) ||
          a.date.localeCompare(b.date) ||
          a.time.localeCompare(b.time)
        );

        setReservations(sorted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur de chargement</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Toutes les réservations terminées</h2>
      {reservations.length === 0 ? (
        <p>Aucune réservation terminée</p>
      ) : reservations.map(res => (
        <div key={res.id} className="bg-white p-4 shadow rounded">
          <p>Client : {res.name}</p>
          <p>Départ : {res.location}</p>
          <p>Destination : {res.destination}</p>
          <p>Heure : {res.date} {res.time}</p>
          <p>Prix : {res.prix} €</p>
          <div className="mt-3 bg-gray-100 p-2 rounded">
            <p className="font-semibold text-green-600">Chauffeur :</p>
            <p>Nom : {res.chauffeur?.name ?? "N/A"}</p>
            <p>Téléphone : {res.chauffeur?.phone ?? "N/A"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
