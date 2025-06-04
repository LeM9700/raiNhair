import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export default function ChauffeurRoute({ children }) {
  const { user, role,  } = useAuth();

 
  if (!user || role !== 'chauffeur') return <Navigate to="/" />;

  return children;
}
