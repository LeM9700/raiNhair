import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import LayoutAdmin from './components/admin/LayoutAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReservationsAttente from './pages/admin/AdminReservationsAttente';
import AdminReservationsAcceptees from './pages/admin/AdminReservationsAcceptees';
import AdminReservationsTerminees from './pages/admin/AdminReservationsTerminees';
import AjouterReservation from './pages/admin/AjouterReservation';
import ListClients from './pages/admin/ListClients';
import Login from './pages/Login';

export default function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={7000} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <LayoutAdmin />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="list-clients" element={<ListClients />} />
            <Route path="reservations" element={<AdminReservationsAttente />} />
            <Route path="reservations-accepted" element={<AdminReservationsAcceptees />} />
            <Route path="reservations-finish" element={<AdminReservationsTerminees />} />
            <Route path="ajouter-reservation" element={<AjouterReservation />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
    
  );
}
