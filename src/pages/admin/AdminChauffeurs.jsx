// src/pages/admin/AdminChauffeurs.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { PhoneCall, User, Car, MapPin, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export default function AdminChauffeurs() {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "chauffeur"),
      
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
      <h2 className="text-3xl font-semibold text-gray-800">Liste des Chauffeurs</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chauffeurs.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Aucun chauffeur enregistré.
          </p>
        ) : (
          chauffeurs.map((c) => (
            <Card key={c.id} className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex items-center justify-between space-x-2 pb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-gray-600" />
                  <CardTitle className="text-lg font-medium text-gray-800">{c.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-sm">
                  {c.statut}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-red-600" />
                  <a
                    href={`tel:${c.phone}`}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition"
                  >
                    {c.phone}
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Position :{" "}
                    {c.position?.latitude != null && c.position?.longitude != null
                      ? `${c.position.latitude.toFixed(5)}, ${c.position.longitude.toFixed(5)}`
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Véhicule : {c.voiture?.marque || "–"} {c.voiture?.modele || ""} (
                    {c.voiture?.plaque || "–"})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-500">
                    Enregistré le :{" "}
                    {c.createdAt
                      ? new Date(c.createdAt.toDate()).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Date inconnue"}
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
