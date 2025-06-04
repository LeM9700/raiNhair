import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function AdminClients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce client ?')) {
      await deleteDoc(doc(db, 'clients', id));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Liste des Clients</h2>
      {clients.map((c) => (
        <div key={c.id} className="bg-white p-4 shadow rounded mb-3">
          <h3 className="font-semibold">{c.name}</h3>
          <p>{c.email} | {c.phone}</p>
          <button onClick={() => handleDelete(c.id)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">Supprimer</button>
        </div>
      ))}
    </div>
  );
}
