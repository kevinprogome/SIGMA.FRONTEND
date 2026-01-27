import { useState } from "react";
import { login as loginService } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectByRole = (role) => {
    switch (role) {
      case "SUPERADMIN":
        navigate("/admin", { replace: true });
        break;
      case "SECRETARY":
        navigate("/secretary", { replace: true });
        break;
      case "COUNCIL":
        navigate("/council", { replace: true });
        break;
      case "STUDENT":
        navigate("/student", { replace: true });
        break;
      case "PROJECT_DIRECTOR":
        navigate("/project-director", { replace: true });
        break;
      default:
        navigate("/login", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginService({ email, password });
      const token = typeof response === "string" ? response : response?.token;

      if (!token) throw new Error("Token inválido");

      login(token);

      const decoded = jwtDecode(token);
      let role = decoded.role || decoded.authorities?.[0]?.replace("ROLE_", "");

      if (!role) throw new Error("Rol no encontrado");

      redirectByRole(role);
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  return (
  <div className="login-container">
    <div className="login-card">

      <div className="login-header">
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus credenciales para acceder al sistema</p>
      </div>

      <div className="login-body">

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-group">
            <input
              type="email"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-forgot">
            <Link to="/forgot-password">¿Olvidó la contraseña?</Link>
          </div>

          <button className="login-button" type="submit">
            Ingresar
          </button>
        </form>

        <div className="login-footer">
          <Link to="/register">Crear cuenta</Link>
        </div>
      </div>
    </div>
  </div>
);

}

export default Login;
