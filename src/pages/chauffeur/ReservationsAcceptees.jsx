import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function ReservationsAcceptees() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, 'reservations'),
      where('status', '==', 'acceptée'),
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

  const terminerReservation = async (id) => {
      const resRef = doc(db, 'reservations', id);
      await updateDoc(resRef, {
        status: 'terminée',
        dateFin: new Date().toISOString(),
      });
    };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mes réservations acceptées</h2>
      {reservations.length === 0 ? (
        <p>Aucune réservation acceptée</p>
      ) : reservations.map(res => (
       <div key={res.id} className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800">{res.name}</h3>
              <span className="text-sm text-gray-400">{res.sentAt}</span>
            </div>
            <p><strong>Date :</strong> {res.date}</p>
            <p><strong>Heure :</strong> {res.time}</p>
            <p><strong>Téléphone :</strong> {res.phone}</p>
            <p><strong>Adresse départ :</strong> {res.location}</p>
            <p><strong>Destination :</strong> {res.destination}</p>
            <p><strong>Passagers :</strong> {res.passengers}</p>
            <p><strong>Service :</strong> {res.serviceType}</p>
            <p><strong>Prix :</strong> {res.prix}€</p>
            <p><strong>Paiement :</strong> {res.payment}</p>

            {/* Chauffeur associé */}
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <h4 className="font-semibold mb-1 text-green-600">Chauffeur assigné :</h4>
              <p>Nom : {res.chauffeur?.name ?? "Non renseigné"}</p>
              <p>Téléphone : {res.chauffeur?.phone ?? "Non renseigné"}</p>
              <p>Véhicule : {res.chauffeur?.voiture?.marque ?? "Non renseigné"} {res.chauffeur?.voiture?.modele ?? ""}</p>
              <p>Plaque : {res.chauffeur?.voiture?.plaque ?? "Non renseigné"}</p>
            </div>

            <button
              onClick={() => terminerReservation(res.id)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Marquer terminé
            </button>
          </div>
        ))
      }

      
    </div>
  );
}
