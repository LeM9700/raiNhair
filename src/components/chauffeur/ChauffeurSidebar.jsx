// src/components/chauffeur/ChauffeurSidebar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const navItems = [
  { name: "Tableau de bord", path: "/dashboard", icon: HomeIcon },
  {
    name: "Réservations en attente",
    path: "/dashboard/reservations",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Réservations Acceptées",
    path: "/dashboard/reservations-accepted",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Réservations Terminées",
    path: "/dashboard/reservations-finish",
    icon: ClipboardDocumentListIcon,
  },
  { name: "Modifier Infos", path: "/dashboard/profil", icon: Cog6ToothIcon },
];

export default function ChauffeurSidebar({ isOpen, toggleSidebar, newReservation }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        // Mettre à jour le statut à "indisponible" dans la collection users
        await updateDoc(doc(db, "users", uid), { statut: "indisponible" });
      }
      // Puis, déconnecter l'utilisateur Firebase
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-green-600">
        <HomeIcon className="h-6 w-6 text-white" />
        <span className="ml-2 text-xl font-bold text-white">VTCLAND</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={toggleSidebar}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${active
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${
                  active ? "text-green-700" : "text-gray-500"
                }`}
              />
              <span className="ml-3">{item.name}</span>
              {item.path === "/dashboard/reservations" && newReservation && (
                <span className="ml-auto bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs animate-ping">
                  !
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout at bottom */}
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />
          <span className="ml-3">{loggingOut ? "Déconnexion..." : "Déconnexion"}</span>
        </button>
      </div>
    </aside>
  );
}
