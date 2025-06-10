import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Button } from '../../components/ui/button';
import { Dialog } from '@headlessui/react';

// Dark mode style: n'affiche que villes et quartiers
const darkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'landscape', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] }
];

// Light style: garder par défaut (empty pour style Google natif)
const lightStyle = [{ featureType: 'poi', stylers: [{ visibility: 'off' }] },{ featureType: 'landscape', stylers: [{ visibility: 'off' }] },{ featureType: 'transit', stylers: [{ visibility: 'off' }] }];

// Icônes voitures gratuites
const ICONS = {
  available: 'https://cdn-icons-png.flaticon.com/512/194/194428.png',
  occupied: 'https://cdn-icons-png.flaticon.com/512/194/194443.png'
};

export default function DriverStatusMap({
  googleMapsApiKey = "AIzaSyCTP-h-JraYQO_heWCZ_oLw-OwUJ1nRSIQ",
  initialCenter = { lat: 48.8566, lng: 2.3522 },
  initialZoom = 12,
}) {
  // chargement Google Maps
  const { isLoaded, loadError } = useJsApiLoader({ id: 'gmaps-script', googleMapsApiKey });
  const [drivers, setDrivers] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  // toggle dark/light
  const [isDark, setIsDark] = useState(true);

  // Firestore realtime
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'chauffeur'));
    const unsub = onSnapshot(q,
      snap => setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Firestore error:', err)
    );
    return unsub;
  }, []);

    // Fonction pour calculer la distance (Haversine)
  function getDistanceKm(pos1, pos2) {
    if (!pos1 || !pos2) return null;
    const toRad = x => x * Math.PI / 180;
    const R = 6371; // Rayon Terre en km
    const dLat = toRad(pos2.lat - pos1.lat);
    const dLng = toRad(pos2.lng - pos1.lng);
    const a = Math.sin(dLat/2)**2 +
      Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
      Math.sin(dLng/2)**2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
  }

  // Géolocalisation
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setUserPos({ lat: coords.latitude, lng: coords.longitude }),
      () => console.warn('Géo indisponible')
    );
  }, []);

  if (!googleMapsApiKey) return <div className="p-4 text-yellow-600">⚠️ Clé Google Maps manquante.</div>;
  if (loadError) return <div className="p-4 text-red-600">❌ Erreur de chargement de la carte.</div>;
  if (!isLoaded) return <div className="p-4 text-gray-600">🔄 Chargement de la carte…</div>;

  const center = userPos || initialCenter;
  const mapStyles = isDark ? darkStyle : lightStyle;

  return (
    <div className="relative">
      {/* Toggle button */}
      <div className="absolute top-2 right-2 z-10">
        <Button size="sm" variant="outline" onClick={() => setIsDark(prev => !prev)}>
          {isDark ? 'Passer en clair' : 'Passer en sombre'}
        </Button>
      </div>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={center}
        zoom={initialZoom}
        options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
      >
        {userPos && <Marker position={userPos} label="Vous" />}
        {drivers
          .filter(d => d.position?.latitude && d.position?.longitude)
          .map(d => (
            <Marker
              key={d.id}
              position={{ lat: d.position.latitude, lng: d.position.longitude }}
              icon={{ url: d.statut === 'disponible' ? ICONS.available : ICONS.occupied, scaledSize: new window.google.maps.Size(32, 32) }}
              title={`${d.name} — ${d.statut}`}
              onClick={() => setSelectedDriver(d)} 
            />
        ))}
      </GoogleMap>

        {/* Modal chauffeur */}
      <Dialog open={!!selectedDriver} onClose={() => setSelectedDriver(null)}>
  <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-auto p-6 relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        onClick={() => setSelectedDriver(null)}
        aria-label="Fermer"
      >
        ×
      </button>
      {selectedDriver && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={selectedDriver.photoProfil || ICONS.available} alt="" className="w-14 h-14 rounded-full border" />
            <div>
              <h2 className="text-lg text-white font-bold">{selectedDriver.name}</h2>
              <span className={`inline-block px-2 py-1 rounded text-xs ${selectedDriver.statut === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {selectedDriver.statut}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">
            <div><b>Email:</b> {selectedDriver.email}</div>
            <div><b>Téléphone:</b> {selectedDriver.phone || '—'}</div>
            <div><b>Véhicule:</b>{" "}
    {selectedDriver.voiture
      ? `${selectedDriver.voiture.marque || ''} ${selectedDriver.voiture.modele || ''} (${selectedDriver.voiture.plaque || ''})`
      : '—'}</div>
            <div><b>Dernière position:</b> {selectedDriver.position?.latitude?.toFixed(5)}, {selectedDriver.position?.longitude?.toFixed(5)}</div>
            <div>
              <b>Distance à vous:</b>{" "}
              {userPos && selectedDriver.position
                ? `${getDistanceKm(
                    userPos,
                    { lat: selectedDriver.position.latitude, lng: selectedDriver.position.longitude }
                  )} km`
                : '—'}
            </div>
          </div>

{selectedDriver.photosVehicule && selectedDriver.photosVehicule.length > 0 && (
  <div className="mt-4">
    <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Photos du véhicule :</div>
    <div className="flex gap-2 overflow-x-auto">
      {selectedDriver.photosVehicule.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={`Véhicule ${idx + 1}`}
          className="h-24 w-36 object-cover rounded-lg border shadow-sm flex-shrink-0"
        />
      ))}
    </div>
  </div>
)}
          
          <div className="flex gap-3 mt-4">
  <a
    href={`tel:${selectedDriver.phone || ''}`}
    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition disabled:opacity-50"
    disabled={!selectedDriver.phone}
    title={selectedDriver.phone ? "Appeler le chauffeur" : "Numéro indisponible"}
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2zm14-14a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2z" /></svg>
    Appeler
  </a>
  <a
    href={`mailto:${selectedDriver.email || ''}`}
    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
    disabled={!selectedDriver.email}
    title={selectedDriver.email ? "Envoyer un e-mail" : "E-mail indisponible"}
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v4m0-4V8" /></svg>
    E-mail
  </a>
</div>
        </div>
      )}
    </div>
  </div>
</Dialog>
    </div>
  );
}
