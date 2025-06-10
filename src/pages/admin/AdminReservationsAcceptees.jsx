// src/pages/admin/AdminReservationsAcceptees.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  BookOpen,
  Clock,
  MapPin,
  Users,
  Phone as PhoneIcon,
  DollarSign,
  CreditCard,
  PhoneCall,
} from "lucide-react";

export default function AdminReservationsAcceptees() {
  const [reservations, setReservations] = useState([]); // toutes les réservations “acceptée”
  const [countByDate, setCountByDate] = useState({}); // ex. { "2025-06-05": 2, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservationsDuJour, setReservationsDuJour] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "reservations"),
      where("status", "==", "acceptée")
    );

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const results = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data() || {};
              let chauffeurData = {};
              if (data.chauffeurId) {
                const chauffeurSnap = await getDoc(
                  doc(db, "users", data.chauffeurId)
                );
                chauffeurData = chauffeurSnap.exists()
                  ? chauffeurSnap.data()
                  : {};
              }
              return {
                id: docSnap.id,
                name: data.name || "Inconnu",
                phone: data.phone || "Non renseigné",
                location: data.location || "Non renseigné",
                destination: data.destination || "Non renseignée",
                date: data.date || "Date inconnue", // YYYY-MM-DD
                time: data.time || "Non renseigné",
                sentAt: data.sentAt || "Non renseigné",
                prix: data.prix || "0",
                serviceType: data.serviceType || "Non renseigné",
                payment: data.payment || "Non renseigné",
                passengers: data.passengers || "Non renseigné",
                status: data.status || "acceptée",
                chauffeur: chauffeurData || {},
              };
            })
          );

          // Calcul du nombre de réservations par date
          const counts = results.reduce((acc, r) => {
            if (!acc[r.date]) acc[r.date] = 0;
            acc[r.date]++;
            return acc;
          }, {});
          setCountByDate(counts);

          setReservations(results);
          setLoading(false);
        } catch (err) {
          console.error("Erreur de mapping :", err);
          setError(true);
        }
      },
      (err) => {
        console.error("Erreur Firestore :", err);
        setError(true);
      }
    );

    return () => unsub();
  }, []);

    function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


  const terminerReservation = async (id) => {
    try {
      const resRef = doc(db, "reservations", id);
      await updateDoc(resRef, {
        status: "terminée",
        dateFin: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Erreur lors de la finalisation :", err);
    }
  };

  const onDateClick = (date) => {
    setSelectedDate(date);
    const jour = formatLocalDate(date);
    const filtered = reservations
      .filter((r) => r.date === jour)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    setReservationsDuJour(filtered);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const jourStr = formatLocalDate(date);
      if (countByDate[jourStr]) {
        return "relative";
      }
    }
    return "";
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const jourStr = formatLocalDate(date);
      const nb = countByDate[jourStr] ?? 0;
      if (nb > 0) {
        return (
          <div className="absolute top-1 right-1">
            <span className="bg-blue-600 text-white text-xs font-semibold px-1 rounded-full">
              {nb}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  if (error)
    return (
      <div className="text-red-600">
        ❌ Erreur de chargement des réservations.
      </div>
    );
  if (loading)
    return (
      <div className="text-gray-600">🔄 Chargement des réservations…</div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Réservations acceptées
      </h2>

      <div className="bg-white shadow-lg rounded-lg p-4">
        <Calendar
          onClickDay={onDateClick}
          tileClassName={tileClassName}
          tileContent={tileContent}
          locale="fr-FR"
          className="max-w-md mx-auto"
        />
      </div>

      {selectedDate && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex justify-between items-center">
            <span>
              Réservations du{" "}
              {selectedDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-gray-600">
              ({reservationsDuJour.length} réservation
              {reservationsDuJour.length > 1 ? "s" : ""})
            </span>
          </h3>

          {reservationsDuJour.length === 0 ? (
            <p className="text-gray-500">Aucune réservation pour cette date.</p>
          ) : (
            <div className="space-y-4">
              {reservationsDuJour.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition p-5 border-l-4 border-blue-500"
                >
                  {/* En-tête de la carte */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-800">
                        {res.name}
                      </h4>
                    </div>
                    <span className="text-sm text-gray-400">{res.sentAt}</span>
                  </div>

                  {/* Contenu en grille */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Heure</p>
                        <p className="text-base text-gray-700">{res.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="text-base text-gray-700">{res.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Passagers</p>
                        <p className="text-base text-gray-700">
                          {res.passengers}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Départ</p>
                        <p className="text-base text-gray-700">{res.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 rotate-180" />
                      <div>
                        <p className="text-sm text-gray-500">Destination</p>
                        <p className="text-base text-gray-700">
                          {res.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Prix</p>
                        <p className="text-base text-gray-700">{res.prix} €</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Paiement</p>
                        <p className="text-base text-gray-700">{res.payment}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="text-base text-gray-700">
                          {res.serviceType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chauffeur assigné */}
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <h4 className="font-semibold mb-1 text-blue-600">
                      Chauffeur assigné :
                    </h4>
                    <p className="text-sm text-gray-700">
                      Nom : {res.chauffeur?.name || "Non renseigné"}
                    </p>
                    <p className="text-sm text-gray-700">
                      Téléphone : {res.chauffeur?.phone || "Non renseigné"}
                    </p>
                    <p className="text-sm text-gray-700">
                      Véhicule : {res.chauffeur?.voiture?.marque || "Non renseigné"}{" "}
                      {res.chauffeur?.voiture?.modele || ""}
                    </p>
                    <p className="text-sm text-gray-700">
                      Plaque : {res.chauffeur?.voiture?.plaque || "Non renseigné"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
                    <a
    href={`tel:${res.chauffeur?.phone}`}
    className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition"
  >
    <PhoneCall className="w-6 h-6" />
    <span className="text-sm font-medium">Appeler Chauffeur</span>
  </a>
  <button
    onClick={() => terminerReservation(res.id)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
  >
    Marquer terminé
  </button>

  <a
    href={`tel:${res.phone}`}
    className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition"
  >
    <PhoneCall className="w-6 h-6" />
    <span className="text-sm font-medium">Appeler Client</span>
  </a>

  
</div>

                   
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
