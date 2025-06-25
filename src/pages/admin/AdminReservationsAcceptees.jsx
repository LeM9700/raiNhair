import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  increment,
} from "firebase/firestore";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  BookOpen,
  Clock,
  Phone as PhoneIcon,
  PhoneCall,
  Scissors,
} from "lucide-react";

export default function AdminReservationsAcceptees() {
  const [reservations, setReservations] = useState([]);
  const [countByDate, setCountByDate] = useState({});
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
      (snapshot) => {
        try {
          const results = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() || {};
            return {
              id: docSnap.id,
              name: data.name || "Inconnu",
              prestation: data.prestation || "Non renseignée",
              date: data.date || "Date inconnue", // YYYY-MM-DD
              time: data.time || "Non renseigné",
              phone: data.phone || "Non renseigné",
              sentAt: data.sentAt || "Non renseigné",
              status: data.status || "acceptée",
            };
          });

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

  const annulerReservation = async (res) => {
  if (!window.confirm("Annuler cette réservation ?")) return;
  try {
    // Supprime la réservation
    await deleteDoc(doc(db, "reservations", res.id));
    // Décrémente visites du client sans descendre sous 0
    const clientRef = doc(db, "clients", res.phone);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      const visites = clientSnap.data().visites || 0;
      if (visites > 0) {
        await updateDoc(clientRef, { visites: visites - 1 });
      }
    }
  } catch (err) {
    alert("Erreur lors de l'annulation : " + err.message);
  }
};

  const onDateClick = (date) => {
    setSelectedDate(date);
    const jour = formatLocalDate(date);
    const filtered = reservations
      .filter((r) => r.date === jour)
      .sort((a, b) => a.time.localeCompare(b.time));
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
                      <Scissors className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Prestation</p>
                        <p className="text-base text-gray-700">{res.prestation}</p>
                      </div>
                    </div>
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
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
                    <a
                      href={`tel:${res.phone}`}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition"
                    >
                      <PhoneCall className="w-6 h-6" />
                      <span className="text-sm font-medium">Appeler</span>
                    </a>
                    <button
                      onClick={() => terminerReservation(res.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Marquer terminé
                    </button>
                    <button
                      onClick={() => annulerReservation(res)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Annuler
                    </button>
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