import { Link, useLocation } from 'react-router-dom';
import {
  ClockIcon, CalendarIcon, UserIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Suivi réservation', path: '/client-panel/suivi-reservation', icon: ClockIcon },
  { name: 'Historique', path: '/client-panel/historique', icon: CalendarIcon },
  { name: 'Nouvelle réservation', path: '/client-panel/nouvelle-reservation', icon: UserIcon },
  { name: 'Déconnexion', path: '/', icon: ArrowRightOnRectangleIcon }
];

export default function ClientSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  return (
    <aside className={`bg-white shadow-md w-64 h-full`}>
      <div className="p-4 border-b text-green-600 font-bold text-xl text-center">
        Espace Client
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
