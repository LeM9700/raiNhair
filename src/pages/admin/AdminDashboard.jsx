import useReservationNotifications from "../../hooks/useReservationNotifications";


export default function AdminDashboard() {

  useReservationNotifications();

  return (<div><h1>🎯 Tableau de bord ADMIN</h1></div>);
  
}
