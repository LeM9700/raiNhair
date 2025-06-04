import { useState } from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import AdminNavbar from '../admin/AdminNavbar';
import { Outlet } from 'react-router-dom';

export default function LayoutAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`fixed z-40 inset-y-0 left-0 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64`}>
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex flex-col flex-1 w-full">
        <AdminNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
