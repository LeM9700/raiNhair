import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useOutletContext } from 'react-router-dom';

export default function ReservationsEnAttente() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setHasNewReservation } = useOutletContext();

  useEffect(() => {
    setHasNewReservation(false);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'reservations'),
      (snapshot) => {
        try {
          const pending = snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data() ?? {};
              return {
                id: docSnap.id,
                name: data.name ?? "Inconnu",
                phone: data.phone ?? "Non renseigné",
                location: data.location ?? "Non renseigné",
                destination: data.destination ?? "Non renseignée",
                date: data.date ?? "Date inconnue",
                passengers: data.passengers ?? "Non renseigné",
                payment: data.payment ?? "Non renseigné",
                time: data.time ?? "Non renseigné",
                sentAt : data.sentAt ?? "Non renseigné",
                prix: data.prix ?? "0",
                serviceType: data.serviceType ?? "Non renseigné",
                status: data.status ?? "en attente",
              };
            })
            .filter((res) => res.status === 'en attente')
            .sort((a, b) => {
              return a.sentAt.localeCompare(b.sentAt)
                || a.date.localeCompare(b.date)
                || a.time.localeCompare(b.time);
            });
          
          setReservations(pending);
          setLoading(false);
        } 
        catch (err) {
          console.error("Erreur lors du mapping Firestore:", err);
          setError(true);
        }
      },
      (err) => {
        console.error("Erreur Firestore:", err);
        setError(true);
      }
    );

    return () => unsub();
  }, []);

  const accepterReservation = async (id) => {
    const uid = auth.currentUser?.uid;
    const resRef = doc(db, 'reservations', id);
    await updateDoc(resRef, {
      status: 'acceptée',
      dateAcceptation: new Date().toISOString(),
      chauffeurId: uid
    });
  };

  if (error) return <div>❌ Erreur de chargement des réservations.</div>;
  if (loading) return <div>🔄 Chargement des réservations...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Réservations en attente</h2>
      {reservations.length === 0 ? (
        <p className="text-gray-500">Aucune réservation en attente.</p>
      ) : (
        reservations.map((res) => (
          <div key={res.id} className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800">{res.name}</h3>
              <span className="text-sm text-gray-400">{res.sentAt}</span>
            </div>
            <p><strong>Date de réservation :</strong> {res.date}</p>
            <p><strong>Heure de réservation :</strong> {res.time}</p>
            <p><strong>Téléphone :</strong> {res.phone}</p>
            <p><strong>Adresse :</strong> {res.location}</p>
            <p><strong>Destination :</strong> {res.destination}</p>
            <p><strong>Nombre de passagers :</strong> {res.passengers}</p>
            <p><strong>Type de service :</strong> {res.serviceType}</p>
            <p><strong>Prix :</strong> {res.prix}€</p>
            <p><strong>Mode de paiement :</strong> {res.payment}</p>

            <button
              onClick={() => accepterReservation(res.id)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Accepter
            </button>
          </div>
        ))
      )}
    </div>
  );
}
