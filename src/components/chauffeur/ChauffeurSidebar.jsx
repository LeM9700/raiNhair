import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Tableau de bord', path: '/dashboard', icon: HomeIcon },
  { name: 'Réservations en attente', path: '/dashboard/reservations', icon: ClipboardDocumentListIcon },
  { name: 'Réservations Acceptées', path: '/dashboard/reservations-accepted', icon: ClipboardDocumentListIcon },
  { name: 'Réservations Terminées', path: '/dashboard/reservations-finish', icon: ClipboardDocumentListIcon },
  { name: 'Modifier Infos', path: '/dashboard/profil', icon: Cog6ToothIcon },
  { name: 'Déconnexion', path: '/', icon: ArrowRightOnRectangleIcon },
];


export default function ChauffeurSidebar({ isOpen, toggleSidebar,newReservation  }) {
  const location = useLocation();

  return (
    <aside
      className="h-full w-64 bg-white shadow-lg p-4 flex flex-col"
    >
      <div className="text-green-600 text-xl font-bold text-center mb-8">
        VTCLAND
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={toggleSidebar}
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-green-100 transition ${
              location.pathname === item.path ? 'bg-green-50 font-semibold' : ''
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
            {item.path === '/dashboard/reservations' && newReservation && (
              <span className="ml-auto bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs animate-ping">
                !
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
