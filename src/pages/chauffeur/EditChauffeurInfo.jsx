// src/pages/chauffeur/EditChauffeurInfo.jsx
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function EditChauffeurInfo() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    telephone: "",
    voiture: "",
    plaque: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Firebase update logic ici
    console.log("Formulaire envoyé", form);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Modifier mes informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Indicators */}
            <div className="flex justify-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 1 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 2 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemple@mail.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    placeholder="06 XX XX XX XX"
                    value={form.telephone}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="default" onClick={nextStep}>
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="voiture">Marque &amp; Modèle</Label>
                  <Input
                    id="voiture"
                    name="voiture"
                    type="text"
                    placeholder="Peugeot 208"
                    value={form.voiture}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="plaque">Plaque</Label>
                  <Input
                    id="plaque"
                    name="plaque"
                    type="text"
                    placeholder="AB-123-CD"
                    value={form.plaque}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Retour
                  </Button>
                  <Button variant="default" type="submit">
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
