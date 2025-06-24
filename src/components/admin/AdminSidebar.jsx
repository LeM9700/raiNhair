// src/components/admin/AdminSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  
  { name: "Clients", path: "/dashboard/list-clients", icon: UsersIcon },
  {
    name: "Réservations en attente",
    path: "/dashboard/reservations",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Réservations acceptées",
    path: "/dashboard/reservations-accepted",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Réservations terminées",
    path: "/dashboard/reservations-finish",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Ajouter Reservation",
    path: "/dashboard/ajouter-reservation",
    icon: PlusCircleIcon,
  },
];

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  return (
    <aside className="flex flex-col h-full bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-red-600">
        <HomeIcon className="h-6 w-6 text-white" />
        <span className="ml-2 text-xl font-bold text-white">Raï'N'hair</span>
      </div>
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
                  ? "bg-red-100 text-red-700"
                  : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${
                  active ? "text-red-700" : "text-gray-500"
                }`}
              />
              <span className="ml-3">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <Link
          to="/"
          className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />
          <span className="ml-3">Déconnexion</span>
        </Link>
      </div>
    </aside>
  );
}
