import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav style={{ display: "flex", gap: "15px", padding: "15px", background: "#1e293b", color: "white" }}>
      <Link to="/student" style={{ color: "white" }}>Perfil</Link>
      <Link to="/student/modalities" style={{ color: "white" }}>Modalidades</Link>
      <Link to="/student/status" style={{ color: "white" }}>Estado</Link>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </nav>
  );
}
