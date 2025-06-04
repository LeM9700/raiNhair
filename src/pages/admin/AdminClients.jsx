// src/pages/admin/AdminClients.jsx
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
import { PhoneCall, User, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Filtre role == "client" et tri par createdAt asc
    const q = query(
      collection(db, "users"),
      where("role", "==", "client"),
      orderBy("createdAt", "asc")
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
              createdAt: data.createdAt || null,
            };
          });
          setClients(list);
          setLoading(false);
        } catch (err) {
          console.error("Erreur de mapping des clients :", err);
          setError(true);
        }
      },
      (err) => {
        console.error("Erreur Firestore clients :", err);
        setError(true);
      }
    );

    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) {
        console.error("Échec suppression client :", err);
      }
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        ❌ Impossible de charger les clients.
      </div>
    );
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        🔄 Chargement des clients…
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Liste des Clients</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Aucun client enregistré.
          </p>
        ) : (
          clients.map((c) => (
            <Card key={c.id} className="hover:shadow-2xl transition-shadow">
              <CardHeader className="flex justify-between items-center pb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-gray-600" />
                  <CardTitle className="text-xl font-medium text-gray-800">
                    {c.name}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-sm">
                  Client
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
                  <CalendarIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-500">
                    Enregistré le :{" "}
                    {c.createdAt
                      ? new Date(c.createdAt.toDate()).toLocaleDateString("fr-FR", {
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
                  className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
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
