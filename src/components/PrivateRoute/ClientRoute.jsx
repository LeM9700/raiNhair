import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export default function ClientRoute({ children }) {
  const { user, role,  } = useAuth();

 
  if (!user || role !== 'client') return <Navigate to="/" />;

  return children;
}
