// src/pages/admin/AdminReservationsAttente.jsx
import { useEffect, useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css"; // l’import CSS de base
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
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function AdminReservationsAttente() {
  const [reservations, setReservations] = useState([]);
  const [countByDate, setCountByDate] = useState({}); // { "2025-06-05": 3, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservationsDuJour, setReservationsDuJour] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "reservations"),
      where("status", "==", "en attente")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const pending = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() || {};
            return {
              id: docSnap.id,
              name: data.name || "Inconnu",
              phone: data.phone || "Non renseigné",
              location: data.location || "Non renseigné",
              destination: data.destination || "Non renseignée",
              date: data.date || "Date inconnue", // Format YYYY-MM-DD
              time: data.time || "Non renseigné",
              sentAt: data.sentAt || "Non renseigné",
              prix: data.prix || "0",
              serviceType: data.serviceType || "Non renseigné",
              payment: data.payment || "Non renseigné",
              passengers: data.passengers || "Non renseigné",
              status: data.status || "en attente",
            };
          });

          // Calcul du nombre de réservations par date
          const counts = pending.reduce((acc, r) => {
            if (!acc[r.date]) acc[r.date] = 0;
            acc[r.date]++;
            return acc;
          }, {});
          setCountByDate(counts);

          setReservations(pending);
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

  // Lorsqu’un jour du calendrier est cliqué
  const onDateClick = (date) => {
    setSelectedDate(date);
    const jour = formatLocalDate(date);
    const filtered = reservations
      .filter((r) => r.date === jour)
      .sort((a, b) => {
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      });
    setReservationsDuJour(filtered);
  };

  // tileClassName permet d’ajouter une classe Tailwind selon la date
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

  const accepterReservation = async (id) => {
    try {
      const resRef = doc(db, "reservations", id);
      await updateDoc(resRef, {
        status: "acceptée",
        dateAcceptation: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Erreur lors de l’acceptation :", err);
    }
  };

  if (error)
    return (
      <div className="text-red-600">❌ Erreur de chargement des réservations.</div>
    );
  if (loading)
    return <div className="text-gray-600">🔄 Chargement des réservations…</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">
        Réservations en attente (Admin)
      </h2>

      {/* === Conteneur du calendrier === */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <Calendar
          onClickDay={onDateClick}
          tileClassName={tileClassName}
          tileContent={tileContent}
          locale="fr-FR"
          className="max-w-md mx-auto"
        />
      </div>

      {/* === Liste des réservations du jour sélectionné === */}
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
            <p className="text-gray-500">
              Aucune réservation enregistrée pour cette date.
            </p>
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

                  {/* Actions */}
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => accepterReservation(res.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Accepter la réservation
                    </button>
                    <a
                      href={`tel:${res.phone}`}
                      className="flex items-center space-x-1 text-blue-600 hover:underline"
                    >
                      <PhoneCall className="w-5 h-5" />
                      <span className="text-sm">Appeler</span>
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
