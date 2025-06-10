// src/pages/chauffeur/ReservationsEnAttente.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useOutletContext } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  PhoneIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function ReservationsEnAttente() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const { setHasNewReservation } = useOutletContext();

  // Map dates to arrays of reservations
  const datesMap = reservations.reduce((acc, r) => {
    const d = r.date; // "YYYY-MM-DD"
    if (!acc[d]) acc[d] = [];
    acc[d].push(r);
    return acc;
  }, {});

  // Fournit "YYYY-MM-DD" à partir d’un objet Date en heure locale
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


  // Badge inside calendar cell
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const d = formatLocalDate(date);
      if (datesMap[d]?.length) return "relative";
    }
    return "";
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const d = formatLocalDate(date);;
      const count = datesMap[d]?.length || 0;
      if (count > 0) {
        return (
          <div className="absolute bottom-1 right-1">
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-green-600 rounded-full">
              {count}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  const onDateClick = (date) => {
    const d = formatLocalDate(date);;
    setSelectedDate(d);
    setFiltered(datesMap[d] || []);
  };

  useEffect(() => {
    setHasNewReservation(false);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "reservations"), where("status", "==", "en attente"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const pending = snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data() || {};
              return {
                id: docSnap.id,
                name: data.name || "Inconnu",
                phone: data.phone || "Non renseigné",
                location: data.location || "Non renseigné",
                destination: data.destination || "Non renseignée",
                date: data.date || "Date inconnue",
                time: data.time || "Non renseigné",
                sentAt: data.sentAt || "Non renseigné",
                passengers: data.passengers || "Non renseigné",
                payment: data.payment || "Non renseigné",
                prix: data.prix || "0",
                serviceType: data.serviceType || "Non renseigné",
                status: data.status || "en attente",
              };
            })
            .sort((a, b) =>
              a.sentAt.localeCompare(b.sentAt) ||
              a.date.localeCompare(b.date) ||
              a.time.localeCompare(b.time)
            );
          setReservations(pending);
          setLoading(false);
        } catch (err) {
          console.error("Erreur mapping Firestore:", err);
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

  const accepterReservation = async (id) => {
    const uid = auth.currentUser?.uid;
    const resRef = doc(db, "reservations", id);
    await updateDoc(resRef, {
      status: "acceptée",
      dateAcceptation: new Date().toISOString(),
      chauffeurId: uid,
    });
  };

  if (error) return <div className="text-red-600">❌ Erreur de chargement.</div>;
  if (loading) return <div className="text-gray-600">🔄 Chargement...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Réservations en attente</h2>

      <div className="bg-white shadow rounded-lg p-4 max-w-md mx-auto">
        <Calendar
          onClickDay={onDateClick}
          tileClassName={tileClassName}
          tileContent={tileContent}
          locale="fr-FR"
          className="w-full"
        />
      </div>

      <div className="space-y-6">
        {selectedDate ? (
          <h3 className="text-lg font-semibold text-gray-700">
            Réservations du{" "}
            {new Date(selectedDate).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </h3>
        ) : (
          <h3 className="text-lg font-semibold text-gray-700">Toutes les réservations</h3>
        )}
        {(selectedDate ? filtered : reservations).length === 0 ? (
          <p className="text-gray-500">Aucune réservation à afficher.</p>
        ) : (
          (selectedDate ? filtered : reservations).map((res) => (
            <Card key={res.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">{res.name}</span>
                  <span className="text-sm text-gray-400">{res.sentAt}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {res.date} à {res.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-5 w-5 text-gray-500" />
                    <a
                      href={`tel:${res.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {res.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{res.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500 rotate-90" />
                    <span className="text-sm text-gray-700">{res.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{res.passengers} passager(s)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{res.payment}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Service : {res.serviceType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Prix : {res.prix} €</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row md:justify-between space-y-2 md:space-y-0">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-2"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          res.location
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    <MapPinIcon className="h-5 w-5" />
                    <span>Voir sur la carte</span>
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 flex items-center justify-center space-x-2"
                    onClick={() => accepterReservation(res.id)}
                  >
                    <span>Accepter</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
