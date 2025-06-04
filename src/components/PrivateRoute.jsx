import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children,role }) {
  const { currentUser, role : userRole } = useAuth();

  if (!currentUser || userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
