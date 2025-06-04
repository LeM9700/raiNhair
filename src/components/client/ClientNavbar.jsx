import { Bars3Icon } from '@heroicons/react/24/outline';

export default function ClientNavbar({ toggleSidebar }) {
  return (
    <header className="flex md:hidden items-center justify-between px-4 h-16 bg-white shadow-md">
      <button onClick={toggleSidebar}>
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      </button>
      <h1 className="text-lg font-semibold text-green-600">Espace Client</h1>
    </header>
  );
}
