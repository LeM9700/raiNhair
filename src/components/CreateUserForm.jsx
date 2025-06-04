import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export default function CreateUserForm() {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: 'chauffeur' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email: form.email,
        name: form.name,
        phone: form.phone,
        role: form.role,
        createdAt: serverTimestamp(),
      });

      alert('✅ Utilisateur créé avec succès !');
      setForm({ email: '', password: '', name: '', phone: '', role: 'chauffeur' });
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3">Créer un utilisateur</h3>
      <div className="space-y-3">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" className="input" />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="input" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" className="input" />
        <select name="role" value={form.role} onChange={handleChange} className="input">
          <option value="chauffeur">Chauffeur</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={handleSubmit} className="bg-green-600 text-white p-2 rounded">Créer</button>
      </div>
    </div>
  );
}
