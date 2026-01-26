import { useState } from "react";
import { login as loginService } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

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

      // 🔹 soporta string o { token }
      const token =
        typeof response === "string" ? response : response?.token;

      if (!token) throw new Error("Token inválido");

      // 🔐 guardamos token
      login(token);

      // 🔎 decodificamos JWT
      const decoded = jwtDecode(token);
      console.log("JWT DECODED 👉", decoded);

      let role = null;

      // ✅ Opción 1: role directo
      if (decoded.role) {
        role = decoded.role;
      }

      // ✅ Opción 2: authorities (Spring Security)
      else if (decoded.authorities?.length) {
        role = decoded.authorities[0].replace("ROLE_", "");
      }

      if (!role) {
        throw new Error("Rol no encontrado en el token");
      }

      redirectByRole(role);

    } catch (err) {
      console.error("Login error:", err);
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>

      <p>
        ¿No tienes una cuenta? <Link to="/register">Crea una</Link>
      </p>

      <p>
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </p>
    </div>
  );
}

export default Login;
