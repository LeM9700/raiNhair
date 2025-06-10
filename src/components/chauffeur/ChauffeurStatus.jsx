// src/components/chauffeur/ChauffeurStatus.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { MapPinIcon } from "@heroicons/react/24/outline";

export default function ChauffeurStatus() {
  const [statut, setStatut] = useState("indisponible");
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const uid = auth.currentUser?.uid;



   // Charger le statut depuis Firestore au montage
  useEffect(() => {
    const fetchStatut = async () => {
      if (uid) {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().statut) {
          setStatut(userSnap.data().statut);
        }
      }
    };
    fetchStatut();
  }, [uid]);

  // Toggle status
  const handleToggle = async () => {
    const newStatus = statut === "disponible" ? "occupé" : "disponible";
    setStatut(newStatus);
    if (uid) {
      await updateDoc(doc(db, "users", uid), { statut: newStatus });
    }
  };

  // Reverse geocode coordinates to address
  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error("Erreur géocodage");
      const data = await response.json();
      setAddress(data.display_name || "");
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      setAddress("");
    }
  };

  // Geolocation tracking
  useEffect(() => {
    const updatePosition = (pos) => {
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setPosition(coords);
      if (uid) {
        updateDoc(doc(db, "users", uid), {
          position: coords,
          updatedAt: new Date(),
        });
      }
      fetchAddress(coords.latitude, coords.longitude);
    };

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(updatePosition, console.error, {
        enableHighAccuracy: true,
      });
    };

    getLocation();
    const interval = setInterval(getLocation, 60000);
    return () => clearInterval(interval);
  }, [uid]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row md:items-start md:justify-between space-y-6 md:space-y-0">
      {/* Status Section */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Statut du chauffeur
        </h2>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 rounded-full text-white font-semibold text-sm ${
              statut === "disponible"
                ? "bg-green-600"
                : statut === "occupé"
                ? "bg-red-600"
                : "bg-gray-500"
            }`}
          >
            {statut.charAt(0).toUpperCase() + statut.slice(1)}
          </span>
          <button
            onClick={handleToggle}
            className={`
              relative inline-flex items-center h-7 w-14 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                statut === "disponible"
                  ? "bg-green-500 hover:bg-green-600 focus:ring-green-300"
                  : "bg-red-500 hover:bg-red-600 focus:ring-red-300"
              }
            `}
          >
            <span
              className={`
                block w-6 h-6 bg-white rounded-full transform transition-transform ${
                  statut === "disponible" ? "translate-x-7" : "translate-x-1"
                }
              `}
            />
          </button>
        </div>
      </div>

      {/* Position Section */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Position actuelle
        </h2>
        <div className="flex items-start space-x-4">
          <MapPinIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            {address ? (
              <p className="text-gray-700 text-sm leading-relaxed">{address}</p>
            ) : position ? (
              <p className="text-gray-700 text-sm">
                {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="text-red-500 text-sm">Non disponible</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
