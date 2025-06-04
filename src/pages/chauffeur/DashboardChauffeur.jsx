import useReservationNotifications from "../../hooks/useReservationNotifications";

export default function DashboardChauffeur() {

  useReservationNotifications();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bienvenue sur votre espace chauffeur 🚗</h1>
    </div>
  );
}
