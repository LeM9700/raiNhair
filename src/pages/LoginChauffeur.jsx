import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginChauffeur() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
       const userCredential = await signInWithEmailAndPassword(auth, email, password);
       const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;

        if (role === 'chauffeur') {
          navigate('/dashboard');
        } else if (role === 'admin') {
          navigate('/admin-panel');
        } else if (role === 'client') {
          navigate('/client-panel');
        } else {
          alert("Rôle inconnu");
        }
      } else {
        alert("Aucun profil Firestore associé !");
      }
    } catch (err) {
      alert(err.message);
    }
  };
      
     
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Connexion Chauffeur</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-700">Adresse e-mail</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm text-gray-700">Mot de passe</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Connexion
        </button>
      </form>
    </div>
  );
}
