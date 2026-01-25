import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/forgot-password", { email });
      setMsg("Te enviamos un código a tu correo 📩");

      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
    } catch (err) {
      setMsg("Error enviando el correo");
    }
  };

  return (
    <div>
      <h2>Recuperar contraseña</h2>

      {msg && <p>{msg}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Enviar código</button>
      </form>
    </div>
  );
}
