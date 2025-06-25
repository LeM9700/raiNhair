import { useState } from "react";
import { doc, setDoc, serverTimestamp, query, collection, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function AjouterReservation() {
  const [form, setForm] = useState({
    name: "",
    prestation: "",
    date: "",
    time: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
  setSubmitting(true);
  try {
    const { name, prestation, date, time, phone } = form;
    if (!name || !prestation || !date || !time || !phone) {
      alert("Veuillez remplir tous les champs obligatoires.");
      setSubmitting(false);
      return;
    }

    // Créneau choisi en minutes
    const [h, m] = time.split(":").map(Number);
    const selectedMinutes = h * 60 + m;

    // Plage de recherche : 1h avant et 1h après
    const minTime = selectedMinutes - 60;
    const maxTime = selectedMinutes + 60;

    // Récupère toutes les réservations du même jour
    const q = query(
      collection(db, "reservations"),
      where("date", "==", date)
    );
    const snap = await getDocs(q);

    // ...existing code...
// Vérifie s'il y a un conflit d'heure et récupère les réservations concernées
const conflictingReservations = snap.docs
  .map(doc => {
    const t = doc.data().time;
    if (!t) return null;
    const [dh, dm] = t.split(":").map(Number);
    const docMinutes = dh * 60 + dm;
    if (docMinutes >= minTime && docMinutes <= maxTime) {
      return {
        name: doc.data().name,
        time: t,
        prestation: doc.data().prestation,
        phone: doc.data().phone,
      };
    }
    return null;
  })
  .filter(Boolean);

if (conflictingReservations.length > 0) {
  const details = conflictingReservations
    .map(r => `• ${r.time} - ${r.name} (${r.prestation || ""} ${r.phone ? "/ " + r.phone : ""})`)
    .join("\n");
  alert(
    "❌ Il existe déjà une réservation à ce créneau ou à une heure proche :\n\n" +
    details
  );
  setSubmitting(false);
  return;
}
// ...suite du code...

    // Avant la création de la réservation :
const clientRef = doc(db, "clients", phone);
const clientSnap = await getDocs(query(collection(db, "clients"), where("phone", "==", phone)));

if (clientSnap.empty) {
  // Nouveau client
  await setDoc(clientRef, {
    name,
    phone,
    visites: 1,
    createdAt: serverTimestamp(),
  });
} else {
  // Client existant : incrémente le compteur de visites
  await updateDoc(clientRef, {
    visites: increment(1),
    name, // met à jour le nom si besoin
  });
}

// Ensuite, crée la réservation comme avant
const id = uuidv4();
await setDoc(doc(db, "reservations", id), {
  name,
  prestation,
  date,
  time,
  phone,
  sentAt: new Date().toISOString(),
  status: "acceptée",
  createdAt: serverTimestamp(),
    });

    alert("✅ Réservation ajoutée avec succès !");
    setForm({
      name: "",
      prestation: "",
      date: "",
      time: "",
      phone: "",
    });
  } catch (e) {
    alert("❌ Erreur : " + e.message);
  }
  setSubmitting(false);
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            ➕ Ajouter une réservation
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nom du client</Label>
              <Input
                id="name"
                placeholder="Nom complet"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prestation">Prestation</Label>
              <Input
                id="prestation"
                placeholder="Coupe, couleur, etc."
                value={form.prestation}
                onChange={(e) => handleChange("prestation", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time">Heure</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
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
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button variant="default" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enregistrement..." : "Ajouter la réservation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}