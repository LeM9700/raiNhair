import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';

export default function AdminReservationsAcceptees() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reservations'), where('status', '==', 'acceptée'));

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const results = await Promise.all(snapshot.docs.map( async(docSnap) => {
            const data = docSnap.data() ?? {};
             let chauffeur = null;
        if (data.chauffeurId) {
          const chauffeurSnap = await getDoc(doc(db, 'chauffeurs', data.chauffeurId));
          chauffeur = chauffeurSnap.exists() ? chauffeurSnap.data() : null;}
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
              sentAt: data.sentAt ?? "Non renseigné",
              prix: data.prix ?? "0",
              serviceType: data.serviceType ?? "Non renseigné",
              chauffeur: data.chauffeur ?? {}, // object chauffeur s'il existe
              status: data.status ?? "acceptée",
              chauffeur : chauffeur ?? {}
            };
          }));
          const accepted = results.sort((a, b) =>
        a.sentAt.localeCompare(b.sentAt) || a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
      );
      
          setReservations(accepted);
          setLoading(false);
        } catch (err) {
          console.error("Erreur de mapping:", err);
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

  const terminerReservation = async (id) => {
    const resRef = doc(db, 'reservations', id);
    await updateDoc(resRef, {
      status: 'terminée',
      dateFin: new Date().toISOString(),
    });
  };

  if (error) return <div>❌ Erreur de chargement des réservations.</div>;
  if (loading) return <div>🔄 Chargement des réservations...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Réservations acceptées</h2>
      {reservations.length === 0 ? (
        <p className="text-gray-500">Aucune réservation acceptée.</p>
      ) : (
        reservations.map((res) => (
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
      )}
    </div>
  );
}
