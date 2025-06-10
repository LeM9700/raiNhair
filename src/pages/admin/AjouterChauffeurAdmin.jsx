// src/pages/admin/AjouterChauffeurAdmin.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

function generatePassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export default function AjouterChauffeurAdmin() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    voiture: { marque: "", modele: "", plaque: "" },
    prixKm: "",
    capacite: "",
  });
  const [photoProfil, setPhotoProfil] = useState(null);
  const [photosVehicule, setPhotosVehicule] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [group, key] = field.split(".");
      setForm((prev) => ({
        ...prev,
        [group]: { ...prev[group], [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { email, password, name, phone, voiture, prixKm,capacite } = form;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      if (
        !email ||
        !password ||
        !name ||
        !phone ||
        !voiture.marque ||
        !voiture.modele ||
        !voiture.plaque ||
        !prixKm ||
        !capacite
      ) {
        alert("Veuillez remplir tous les champs obligatoires.");
        setSubmitting(false);
        return;
      }

      await setDoc(doc(db, "users", uid), {
        role: "chauffeur",
        createdAt: serverTimestamp(),
      });

      let photoProfilUrl = "";
      if (photoProfil) {
        const profilRef = ref(storage, `chauffeurs/${uid}/photo-profil.jpg`);
        await uploadBytes(profilRef, photoProfil);
        photoProfilUrl = await getDownloadURL(profilRef);
      }

      const photoVehiculeUrls = [];
      for (let i = 0; i < photosVehicule.length; i++) {
        const file = photosVehicule[i];
        const photoRef = ref(storage, `chauffeurs/${uid}/vehicule-${uuidv4()}.jpg`);
        await uploadBytes(photoRef, file);
        const url = await getDownloadURL(photoRef);
        photoVehiculeUrls.push(url);
      }

      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        name,
        phone,
        voiture,
        prixKm,
        capacite,
        statut: "indisponible",
        role:"chauffeur",
        position: { latitude: null, longitude: null },
        createdAt: serverTimestamp(),
        photoProfil: photoProfilUrl,
        photosVehicule: photoVehiculeUrls,
      });

      alert("✅ Chauffeur ajouté avec succès");
      setForm({
        name: "",
        phone: "",
        email: "",
        password: "",
        voiture: { marque: "", modele: "", plaque: "" },
      });
      setPhotoProfil(null);
      setPhotosVehicule([]);
    } catch (e) {
      alert("❌ Erreur : " + e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            ➕ Ajouter un chauffeur
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="06 XX XX XX XX"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@mail.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="password"
                  type="text"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <Button
                  variant="outline"
                  onClick={() => handleChange("password", generatePassword())}
                  disabled={submitting}
                >
                  Générer
                </Button>
              </div>
            </div>
          </div>

          <h3 className="mt-8 mb-3 text-lg font-medium text-gray-700">🚗 Informations véhicule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label htmlFor="marque">Marque</Label>
              <Input
                id="marque"
                placeholder="Peugeot"
                value={form.voiture.marque}
                onChange={(e) => handleChange("voiture.marque", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="modele">Modèle</Label>
              <Input
                id="modele"
                placeholder="208"
                value={form.voiture.modele}
                onChange={(e) => handleChange("voiture.modele", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="plaque">Plaque</Label>
              <Input
                id="plaque"
                placeholder="AB-123-CD"
                value={form.voiture.plaque}
                onChange={(e) => handleChange("voiture.plaque", e.target.value)}
                required
              />
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  <div className="space-y-1">
    <Label htmlFor="prixKm">Prix €/km</Label>
    <Input
      id="prixKm"
      type="number"
      min="0"
      step="0.01"
      placeholder="1.20"
      value={form.prixKm}
      onChange={(e) => handleChange("prixKm", e.target.value)}
      required
    />
  </div>
  <div className="space-y-1">
    <Label htmlFor="capacite">Capacité passagers</Label>
    <Input
      id="capacite"
      type="number"
      min="1"
      max="9"
      placeholder="4"
      value={form.capacite}
      onChange={(e) => handleChange("capacite", e.target.value)}
      required
    />
  </div>
</div>

          <div className="mt-8 space-y-1">
            <Label htmlFor="photoProfil">📸 Photo de profil</Label>
            <input
              id="photoProfil"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoProfil(e.target.files[0])}
              className="block w-full text-sm text-gray-700"
              required
            />
            {photoProfil && (
              <img
                src={URL.createObjectURL(photoProfil)}
                alt="Prévisualisation profil"
                className="mt-2 w-24 h-24 object-cover rounded-full border"
              />
            )}
          </div>

          <div className="mt-6 space-y-1">
            <Label htmlFor="photosVehicule">🚗 Photos du véhicule (max 3)</Label>
            <input
              id="photosVehicule"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotosVehicule([...e.target.files].slice(0, 3))}
              className="block w-full text-sm text-gray-700"
              required
            />
            {photosVehicule.length > 0 && (
              <div className="mt-2 flex space-x-2">
                {photosVehicule.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`Prévisualisation véhicule ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
        

        <CardFooter className="flex justify-end">
          <Button variant="default" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enregistrement..." : "Ajouter Chauffeur"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
