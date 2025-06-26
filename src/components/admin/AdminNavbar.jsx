// src/components/admin/AdminNavbar.jsx
import { useState } from "react";
import { Bars3Icon, XMarkIcon, BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import useReservationNotifications from "../../hooks/useReservationNotifications";
import { Link } from "react-router-dom";

export default function AdminNavbar({ toggleSidebar, sidebarOpen }) {
  const [notifOpen, setNotifOpen] = useState(false);
  // Provide default values in case hook returns undefined initially
  const {
    notifications = [],
    unreadCount = 0,
    setNotifications,
    setUnreadCount,
  } = useReservationNotifications() || {};

  // Fonction pour supprimer une notification (la marquer comme lue)
  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <header className="flex items-center justify-between bg-white shadow-md h-16 px-4 md:px-6 relative z-20">
      {/* Sidebar toggle (mobile) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition"
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Logo / Title */}
      <div className="hidden md:flex items-center">
        <span className="text-xl font-semibold text-red-600">Admin Panel</span>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right side (notifications + user) */}
      <div className="flex items-center space-x-4">
        <div className="relative">
      <button
        onClick={() => setNotifOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex h-3 w-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Notifications</span>
            <button
              onClick={() => setNotifOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <ul>
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-500 text-sm">Aucune nouvelle notification.</li>
            ) : (
              notifications.map((notif) => (
                <li
                  key={notif.id}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">{notif.title}</div>
                    <div className="mt-1 text-xs text-gray-600">{notif.text}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(notif.date).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(notif.id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    title="Marquer comme lue"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
        <Link to="/dashboard" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition">
          <UserCircleIcon className="h-8 w-8 text-gray-600" />
          <span className="hidden sm:block text-gray-700 font-medium">Admin</span>
        </Link>
      </div>
    </header>
  );
}
