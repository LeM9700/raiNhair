import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import CreateUserForm from '../components/CreateUserForm';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">👥 Utilisateurs</h2>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Téléphone</th>
            <th className="p-2 border">Rôle</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.phone}</td>
              <td className="p-2 border">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CreateUserForm/>
    </div>
  );
}
