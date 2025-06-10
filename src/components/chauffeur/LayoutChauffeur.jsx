// src/components/layouts/LayoutChauffeur.jsx
import { useState } from "react";
import ChauffeurSidebar from "../chauffeur/ChauffeurSidebar";
import ChauffeurNavbar from "../chauffeur/ChauffeurNavbar";
import ChauffeurStatus from "../chauffeur/ChauffeurStatus";
import { Outlet } from "react-router-dom";
import useReservationNotifications from "../../hooks/useReservationNotifications";

export default function LayoutChauffeur() {
  const { hasNewReservation, setHasNewReservation } = useReservationNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed z-40 inset-y-0 left-0 transform 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:flex-shrink-0
          transition-transform duration-300 ease-in-out
          w-64
        `}
      >
        <ChauffeurSidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          newReservation={hasNewReservation}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <ChauffeurNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ChauffeurStatus />
          <Outlet context={{ setHasNewReservation }} />
        </main>
      </div>
    </div>
  );
}
