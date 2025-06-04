import { useState } from 'react';
import ChauffeurSidebar from './ChauffeurSidebar';
import ChauffeurNavbar from './ChauffeurNavbar';
import ChauffeurStatus from './ChauffeurStatus';
import { Outlet } from 'react-router-dom';
import useReservationNotifications from '../../hooks/useReservationNotifications';

export default function LayoutChauffeur() {
  const { hasNewReservation, setHasNewReservation } = useReservationNotifications();  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
       
      <div className={`fixed z-40 inset-y-0 left-0 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64`}> 
      <ChauffeurSidebar 
      isOpen={sidebarOpen} 
      toggleSidebar={toggleSidebar} 
      newReservation={hasNewReservation}
      />
      </div>

      <div className="flex flex-col flex-1 w-full">
        <ChauffeurNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}  />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Statut toujours présent */}
          <ChauffeurStatus />

          {/* Les pages enfants s'affichent ici */}
          <Outlet context={{ setHasNewReservation }} />
        </main>
      </div>
    </div>
  );
}
