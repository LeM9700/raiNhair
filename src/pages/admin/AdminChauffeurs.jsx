import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function AdminChauffeurs() {
  const [chauffeurs, setChauffeurs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setChauffeurs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce chauffeur ?')) {
      await deleteDoc(doc(db, 'chauffeurs', id));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Liste des Chauffeurs</h2>
      {chauffeurs.map((c) => (
        <div key={c.id} className="bg-white p-4 shadow rounded mb-3">
          <h3 className="font-semibold">{c.name}</h3>
          <p>{c.email} | {c.phone}</p>
          <p>Véhicule: {c.voiture?.marque} {c.voiture?.modele} ({c.voiture?.plaque})</p>
          <p>Statut : {c.statut}</p>
          <p>Position: {c.position?.latitude ?? 'N/A'}, {c.position?.longitude ?? 'N/A'}</p>
          <button onClick={() => handleDelete(c.id)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">Supprimer</button>
        </div>
      ))}
    </div>
  );
}
