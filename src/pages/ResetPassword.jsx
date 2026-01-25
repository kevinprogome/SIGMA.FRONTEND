import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      setSuccess("Contraseña cambiada correctamente ✅");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Código inválido o expirado");
    }
  };

  return (
    <div>
      <h2>Restablecer contraseña</h2>

      <p>
        Te enviamos un <b>código</b> a tu correo.  
        Cópialo y pégalo aquí 👇
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Código recibido"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit">Cambiar contraseña</button>
      </form>
    </div>
  );
}
