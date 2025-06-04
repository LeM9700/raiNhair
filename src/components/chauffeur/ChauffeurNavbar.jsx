import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ChauffeurNavbar({ toggleSidebar, sidebarOpen }) {
  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-md sticky top-0 z-30">
      <div className='relative'>

        <button onClick={toggleSidebar} className="md:hidden relative z-40">
        {sidebarOpen ? (
          <XMarkIcon className="h-8 w-8 text-gray-700" />
        ) : (
          <Bars3Icon className="h-8 w-8 text-gray-700" />
        )}
      </button>

      </div>

      <h1 className="text-green-600 font-bold text-lg">Tableau de bord</h1>
    </header>
  );
}
