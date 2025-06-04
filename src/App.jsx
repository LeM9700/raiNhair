import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardChauffeur from './pages/chauffeur/DashboardChauffeur';
import ReservationsEnAttente from './pages/chauffeur/ReservationsEnAttente';
import EditChauffeurInfo from './pages/chauffeur/EditChauffeurInfo';
import LoginChauffeur from './pages/LoginChauffeur';
import PrivateRoute from './components/PrivateRoute';
import LayoutChauffeur from './components/chauffeur/LayoutChauffeur';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import LayoutAdmin from './components/admin/LayoutAdmin';
import LayoutClient from './components/client/LayoutClient';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminChauffeurs from './pages/admin/AdminChauffeurs';
import AdminClients from './pages/admin/AdminClients';
import AdminReservationsAttente from './pages/admin/AdminReservationsAttente';
import AdminReservationsAcceptees from './pages/admin/AdminReservationsAcceptees';
import AjouterChauffeurAdmin from './pages/admin/AjouterChauffeurAdmin';
import ReservationsAcceptees from './pages/chauffeur/ReservationsAcceptees';
import ReservationsTerminees from './pages/chauffeur/ReservationsTerminees';
import AdminReservationsTerminees from './pages/admin/AdminReservationsTerminees';

export default function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
    <AuthProvider >
      
      <ToastContainer position="top-right" autoClose={7000} />

      <Routes>
        <Route path="/" element={<LoginChauffeur />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="chauffeur">
              <LayoutChauffeur />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardChauffeur />} />
          <Route path="reservations" element={<ReservationsEnAttente />} />
          <Route path="reservations-accepted" element={<ReservationsAcceptees />} />
          <Route path="reservations-finish" element={<ReservationsTerminees />} />
          <Route path="profil" element={<EditChauffeurInfo />} />
        </Route>

         {/* Admin protected routes */}
          <Route
            path="/admin-panel"
            element={
              <PrivateRoute role="admin">
                <LayoutAdmin />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path='chauffeurs' element={<AdminChauffeurs />} />
            <Route path='clients' element={<AdminClients />} />
            <Route path='reservations-attente' element={<AdminReservationsAttente />} />
            <Route path='reservations-acceptees' element={<AdminReservationsAcceptees />} />
            <Route path='reservations-fini' element={<AdminReservationsTerminees />} />
            <Route path='ajouter-chauffeur' element={<AjouterChauffeurAdmin />} />
            {/* Ajoute ici les pages Admin */}
          </Route>

          {/* Client protected routes */}
          <Route
            path="/client-panel"
            element={
              <PrivateRoute role="client">
                <LayoutClient />
              </PrivateRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            {/* Ajoute ici les pages Client */}
          </Route>

      </Routes>
    
    </AuthProvider>
    </Router>
    
  );
}
