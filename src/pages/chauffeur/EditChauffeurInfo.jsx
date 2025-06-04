import { useState } from 'react';

export default function EditChauffeurInfo() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    telephone: '',
    voiture: '',
    plaque: '',
    photo: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Firebase update logic ici
    console.log('Formulaire envoyé', form);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Modifier mes informations</h2>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">E-mail</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>
            <button type="button" onClick={nextStep} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Suivant</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Marque & Modèle</label>
              <input
                type="text"
                name="voiture"
                value={form.voiture}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Plaque</label>
              <input
                type="text"
                name="plaque"
                value={form.plaque}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="bg-gray-400 text-white px-4 py-2 rounded">Retour</button>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
