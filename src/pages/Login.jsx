import { useState } from "react";
import { login as loginService } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginService({ email, password });

      // 🧠 Soportamos ambos formatos
      const token =
        typeof response === "string" ? response : response?.token;

      if (!token) {
        throw new Error("Token inválido");
      }

      // Guardamos en contexto + localStorage
      login(token);

      // Redirección limpia
      navigate("/student", { replace: true });

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
