import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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

      const id = uuidv4();
      await setDoc(doc(db, "reservations", id), {
        name,
        prestation,
        date,
        time,
        phone,
        sentAt: new Date().toISOString(),
        status: "acceptée", // Par défaut, on considère la réservation acceptée
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