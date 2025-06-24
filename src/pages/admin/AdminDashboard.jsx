import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import useReservationNotifications from "../../hooks/useReservationNotifications";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  useReservationNotifications();

  const [clientsCount, setClientsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [nextReservations, setNextReservations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Récupération des données Firestore
  useEffect(() => {
    // Nombre de clients
    getDocs(collection(db, "clients")).then((snap) => setClientsCount(snap.size));
    // Réservations par statut
    getDocs(query(collection(db, "reservations"), where("status", "==", "en attente"))).then((snap) => setPendingCount(snap.size));
    getDocs(query(collection(db, "reservations"), where("status", "==", "acceptée"))).then((snap) => setAcceptedCount(snap.size));
    getDocs(query(collection(db, "reservations"), where("status", "==", "terminée"))).then((snap) => setFinishedCount(snap.size));
    // Prochains rendez-vous (ex : 5 prochains)
    getDocs(query(collection(db, "reservations"), where("status", "in", ["en attente", "acceptée"]), orderBy("date"), limit(5)))
      .then((snap) => {
        setNextReservations(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      });
    // Alertes (ex : réservations en attente depuis plus de 2 jours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    getDocs(query(collection(db, "reservations"), where("status", "==", "en attente"), where("date", "<", twoDaysAgo)))
      .then((snap) => {
        setAlerts(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      });
    // Graphique d'évolution (ex : nombre de réservations par mois)
    getDocs(collection(db, "reservations")).then((snap) => {
      const byMonth = {};
      snap.docs.forEach((doc) => {
        const d = doc.data();
        const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        byMonth[key] = (byMonth[key] || 0) + 1;
      });
      const data = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }));
      setChartData(data);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">🎯 Tableau de bord ADMIN</h1>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link to="/dashboard/list-clients" className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-gray-50 transition">
          <span className="text-3xl font-bold text-red-600">{clientsCount}</span>
          <span className="mt-2 text-gray-700">Clients</span>
        </Link>
        <Link to="/dashboard/reservations" className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-gray-50 transition">
          <span className="text-3xl font-bold text-yellow-500">{pendingCount}</span>
          <span className="mt-2 text-gray-700">Réservations en attente</span>
        </Link>
        <Link to="/dashboard/reservations-accepted" className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-gray-50 transition">
          <span className="text-3xl font-bold text-blue-500">{acceptedCount}</span>
          <span className="mt-2 text-gray-700">Réservations acceptées</span>
        </Link>
        <Link to="/dashboard/reservations-finish" className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-gray-50 transition">
          <span className="text-3xl font-bold text-green-600">{finishedCount}</span>
          <span className="mt-2 text-gray-700">Réservations terminées</span>
        </Link>
      </div>
      {/* Graphique d'évolution */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Évolution des réservations (par mois)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Prochains rendez-vous */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Prochains rendez-vous</h2>
        <ul>
          {nextReservations.length === 0 ? (
            <li className="text-gray-500">Aucun rendez-vous à venir.</li>
          ) : (
            nextReservations.map((r) => (
              <li key={r.id} className="mb-2">
                <span className="font-medium">{r.clientName || "Client"}</span> —{" "}
                {r.date?.toDate
                  ? r.date.toDate().toLocaleString("fr-FR")
                  : new Date(r.date).toLocaleString("fr-FR")}{" "}
                <span className="text-xs text-gray-500">({r.status})</span>
              </li>
            ))
          )}
        </ul>
      </div>
      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
          <strong>Alertes :</strong>
          <ul className="list-disc pl-6">
            {alerts.map((a) => (
              <li key={a.id}>
                Réservation en attente pour <span className="font-medium">{a.clientName || "Client"}</span> depuis plus de 2 jours.
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Raccourcis actions */}
      <div className="flex flex-wrap gap-4 mt-4">
        <Link to="/dashboard/ajouter-reservation" className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
          Ajouter une réservation
        </Link>
        <Link to="/dashboard/list-clients" className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition">
          Ajouter un client
        </Link>
        {/* Ajoute d'autres raccourcis ici */}
      </div>
    </div>
  );
}