import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/login");
    } catch (error) {
      // El backend ya maneja estos mensajes:
      // - "Todos los campos son obligatorios..."
      // - "El correo debe ser institucional con dominio @usco.edu.co"
      // - "Este correo ya está en uso"
      alert(error.response?.data || "Error al registrarse");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <div className="register-header">
          <h1>Registro</h1>
          <p>Crea tu cuenta para acceder al sistema SIGMA</p>
        </div>

        <div className="register-body">
          <form className="register-form" onSubmit={handleSubmit}>

            <div className="register-group full">
              <input
                name="name"
                placeholder="Nombre"
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-group full">
              <input
                name="lastName"
                placeholder="Apellido"
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-group full">
              <input
                name="email"
                placeholder="Correo institucional"
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-group full">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                onChange={handleChange}
                required
              />
            </div>

            <button className="register-button" type="submit">
              Registrarse
            </button>
          </form>

          <div className="register-footer">
            ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;