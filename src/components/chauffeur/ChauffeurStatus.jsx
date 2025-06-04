import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const statuses = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'occupé', label: 'Occupé', color: 'red' },
  { value: 'indisponible', label: 'Indisponible', color: 'gray' },
];

export default function ChauffeurStatus() {
  const [statut, setStatut] = useState('indisponible');
  const [position, setPosition] = useState(null);
  const uid = auth.currentUser?.uid;

  // Changer statut chauffeur
  const handleChangeStatut = async (e) => {
    const newStatus = e.target.value;
    setStatut(newStatus);
    if (uid) {
      await updateDoc(doc(db, 'chauffeurs', uid), { statut: newStatus });
    }
  };

  // Suivi position toutes les 60s
  useEffect(() => {
    const updatePosition = (pos) => {
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setPosition(coords);

      if (uid) {
        updateDoc(doc(db, 'chauffeurs', uid), {
          position: coords,
          updatedAt: new Date(),
        });
      }
    };

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(updatePosition, console.error, {
        enableHighAccuracy: true,
      });
    };

    // Appel initial
    getLocation();

    // Appel toutes les 60 secondes
    const interval = setInterval(() => {
      getLocation();
    }, 60000);

    return () => clearInterval(interval);
  }, [uid]);

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-2">Statut & Position</h2>

      <label className="block mb-2 text-sm text-gray-700">Changer le statut :</label>
      <select
        value={statut}
        onChange={handleChangeStatut}
        className="w-full p-2 border rounded mb-3"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="text-sm text-gray-600">
        Position actuelle :
        {position ? (
          <span className="ml-1">
            {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
          </span>
        ) : (
          <span className="ml-1 text-red-500">Non disponible</span>
        )}
      </div>
    </div>
  );
}
