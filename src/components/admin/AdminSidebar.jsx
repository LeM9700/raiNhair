import { Link, useLocation } from 'react-router-dom';
import {
  UsersIcon, ClipboardDocumentListIcon, PlusCircleIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Chauffeurs', path: '/admin-panel/chauffeurs', icon: UsersIcon },
  { name: 'Clients', path: '/admin-panel/clients', icon: UsersIcon },
  { name: 'Réservations (en attente)', path: '/admin-panel/reservations-attente', icon: ClipboardDocumentListIcon },
  { name: 'Réservations (acceptées)', path: '/admin-panel/reservations-acceptees', icon: ClipboardDocumentListIcon },
  { name: 'Réservations (terminées)', path: '/admin-panel/reservations-fini', icon: ClipboardDocumentListIcon },
  { name: 'Ajouter Chauffeur', path: '/admin-panel/ajouter-chauffeur', icon: PlusCircleIcon },
  { name: 'Déconnexion', path: '/', icon: ArrowRightOnRectangleIcon }
];

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  return (
    <aside className={`bg-white shadow-md w-64 h-full`}>
      <div className="p-4 border-b text-green-600 font-bold text-xl text-center">
        Admin Panel
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.name}
            to={item.path}
            onClick={toggleSidebar}
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-green-100 transition ${location.pathname === item.path ? 'bg-green-50 font-semibold' : ''}`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
