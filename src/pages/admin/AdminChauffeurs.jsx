import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  PhoneCall,
  User,
  Car,
  MapPin,
  Calendar,
  Map as MapIcon,
  X,
} from "lucide-react";
import DriverStatusMap from "../../components/admin/DriverStatusMap";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export default function AdminChauffeurs() {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [adminPos, setAdminPos] = useState(null);
  const [adresses, setAdresses] = useState({});

async function getAddressFromLatLng(lat, lng) {
  const apiKey = "AIzaSyCTP-h-JraYQO_heWCZ_oLw-OwUJ1nRSIQ";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=fr`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      // Cherche la ville dans address_components
      const components = data.results[0].address_components;
      const cityObj = components.find(comp =>
        comp.types.includes("locality")
      );
      return cityObj ? cityObj.long_name : "Ville inconnue";
    }
    return "Ville inconnue";
  } catch {
    return "Ville inconnue";
  }
}



  function getDistanceKm(pos1, pos2) {
    if (!pos1 || !pos2) return Infinity;
    const toRad = x => x * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(pos2.lat - pos1.lat);
    const dLng = toRad(pos2.lng - pos1.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(pos1.lat)) *
        Math.cos(toRad(pos2.lat)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }


  // Récupère les adresses des chauffeurs
  useEffect(() => {
  async function fetchAdresses() {
    const newAdresses = {};
    for (const c of chauffeurs) {
      if (
        c.position?.latitude != null &&
        c.position?.longitude != null &&
        !adresses[c.id]
      ) {
        newAdresses[c.id] = await getAddressFromLatLng(
          c.position.latitude,
          c.position.longitude
        );
      }
    }
    setAdresses((prev) => ({ ...prev, ...newAdresses }));
  }
  if (chauffeurs.length > 0) fetchAdresses();
  // eslint-disable-next-line
}, [chauffeurs]);

  // Récupère la position de l'admin au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setAdminPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => setAdminPos(null)
      );
    }
  }, []);


  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "chauffeur")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const list = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() || {};
            return {
              id: docSnap.id,
              name: data.name || "–",
              email: data.email || "–",
              phone: data.phone || "–",
              voiture: data.voiture || {},
              statut: data.statut || "–",
              position: data.position || {},
              createdAt: data.createdAt || null,
            };
          });
          setChauffeurs(list);
          setLoading(false);
        } catch (err) {
          console.error("Erreur de mapping des chauffeurs :", err);
          setError(true);
        }
      },
      (err) => {
        console.error("Erreur Firestore chauffeurs :", err);
        setError(true);
      }
    );

    return () => unsub();
  }, []);


   // Trie les chauffeurs par distance (le plus proche en premier)
  const chauffeursTries = adminPos
    ? [...chauffeurs].sort((a, b) => {
        const distA = a.position?.latitude && a.position?.longitude
          ? getDistanceKm(adminPos, { lat: a.position.latitude, lng: a.position.longitude })
          : Infinity;
        const distB = b.position?.latitude && b.position?.longitude
          ? getDistanceKm(adminPos, { lat: b.position.latitude, lng: b.position.longitude })
          : Infinity;
        return distA - distB;
      })
    : chauffeurs;

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce chauffeur ?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) {
        console.error("Échec suppression chauffeur :", err);
      }
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        ❌ Impossible de charger les chauffeurs.
      </div>
    );
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        🔄 Chargement des chauffeurs…
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-800">Liste des Chauffeurs</h2>
        <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
          {showMap ? (
            <>
              <X className="w-4 h-4 mr-1" /> Masquer la carte
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4 mr-1" /> Voir la carte
            </>
          )}
        </Button>
      </div>

      {showMap && (
        <div className="w-full h-96 mb-6 rounded-lg overflow-hidden shadow">
          <DriverStatusMap />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chauffeursTries.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Aucun chauffeur enregistré.
          </p>
        ) : (
          chauffeursTries.map((c) => (
            <Card key={c.id} className="hover:shadow-xl transition-shadow relative pt-10">
              {/* Badge distance en haut à droite */}
                <div className="absolute top-3 right-3 z-10">
                  {adminPos && c.position?.latitude && c.position?.longitude && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-600 text-white shadow-lg border-2 border-white">
                      {getDistanceKm(
                        adminPos,
                        { lat: c.position.latitude, lng: c.position.longitude }
                      ).toFixed(2)} km
                    </span>
                  )}
                </div>
              <CardHeader className="flex items-center justify-between space-x-2 pb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-gray-600" />
                  <CardTitle className="text-lg font-medium text-gray-800">{c.name}</CardTitle>
                </div>
                {/* Badge statut en haut à gauche */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={
                        "px-3 py-1 rounded-full text-xs font-bold shadow " +
                        (c.statut === "disponible"
                          ? "bg-green-500 text-white"
                          : c.statut === "occupé"
                          ? "bg-red-500 text-white"
                          : "bg-gray-400 text-white opacity-40")
                      }
                    >
                      {c.statut}
                    </span>
                  </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-green-600" />
                  <a
                    href={`tel:${c.phone}`}
                    className="text-sm font-medium text-green-600 hover:text-green-800 transition"
                  >
                    {c.phone}
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Position :{' '}
                  {c.position?.latitude != null && c.position?.longitude != null
                    ? adresses[c.id] || "Recherche de l'adresse..."
                    : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Véhicule : {c.voiture?.marque || '–'} {c.voiture?.modele || ''} (
                    {c.voiture?.plaque || '–'})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-500">
                    Enregistré le :{' '}
                    {c.createdAt
                      ? new Date(c.createdAt.toDate()).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Date inconnue'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Email :</span>
                  <span className="text-sm text-gray-700">{c.email}</span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
