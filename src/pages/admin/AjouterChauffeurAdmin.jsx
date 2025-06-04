import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

export default function AjouterChauffeurAdmin() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    voiture: { marque: '', modele: '', plaque: '' },
  });

  const [photoProfil, setPhotoProfil] = useState(null);
  const [photosVehicule, setPhotosVehicule] = useState([]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [group, key] = field.split('.');
      setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const { email, password, name, phone, voiture } = form;

      // Création de l'utilisateur Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Création du document Firestore Users pour stocker le rôle
      await setDoc(doc(db, 'users', uid), { role: 'chauffeur', createdAt: serverTimestamp() });

      // Upload photo de profil
      let photoProfilUrl = '';
      if (photoProfil) {
        const profilRef = ref(storage, `chauffeurs/${uid}/photo-profil.jpg`);
        await uploadBytes(profilRef, photoProfil);
        photoProfilUrl = await getDownloadURL(profilRef);
      }

      // Upload photos véhicule
      const photoVehiculeUrls = [];
      for (let i = 0; i < photosVehicule.length; i++) {
        const file = photosVehicule[i];
        const photoRef = ref(storage, `chauffeurs/${uid}/vehicule-${uuidv4()}.jpg`);
        await uploadBytes(photoRef, file);
        const url = await getDownloadURL(photoRef);
        photoVehiculeUrls.push(url);
      }

      // Enregistrement dans la collection chauffeurs
      await setDoc(doc(db, 'chauffeurs', uid), {
        uid,
        email,
        name,
        phone,
        voiture,
        statut: 'indisponible',
        position: { latitude: null, longitude: null },
        createdAt: serverTimestamp(),
        photoProfil: photoProfilUrl,
        photosVehicule: photoVehiculeUrls
      });

      alert('✅ Chauffeur ajouté avec succès');
      setForm({ name: '', phone: '', email: '', password: '', voiture: { marque: '', modele: '', plaque: '' } });
      setPhotoProfil(null);
      setPhotosVehicule([]);
    } catch (e) {
      alert('❌ Erreur : ' + e.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">➕ Ajouter un chauffeur</h2>

      <input placeholder="Nom" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input" />
      <input placeholder="Téléphone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="input" />
      <input placeholder="Email" value={form.email} type="email" onChange={(e) => handleChange('email', e.target.value)} className="input" />
      <input placeholder="Mot de passe" value={form.password} type="password" onChange={(e) => handleChange('password', e.target.value)} className="input" />
      <input placeholder="Marque" value={form.voiture.marque} onChange={(e) => handleChange('voiture.marque', e.target.value)} className="input" />
      <input placeholder="Modèle" value={form.voiture.modele} onChange={(e) => handleChange('voiture.modele', e.target.value)} className="input" />
      <input placeholder="Plaque" value={form.voiture.plaque} onChange={(e) => handleChange('voiture.plaque', e.target.value)} className="input" />

      <label className="block my-2">📸 Photo de Profil :</label>
      <input type="file" accept="image/*" onChange={(e) => setPhotoProfil(e.target.files[0])} />

      <label className="block my-2">🚗 Photos du Véhicule (max 3) :</label>
      <input type="file" accept="image/*" multiple onChange={(e) => setPhotosVehicule([...e.target.files].slice(0, 3))} />

      <button onClick={handleSubmit} className="w-full mt-4 bg-green-600 text-white p-2 rounded hover:bg-green-700">
        Ajouter Chauffeur
      </button>
    </div>
  );
}
