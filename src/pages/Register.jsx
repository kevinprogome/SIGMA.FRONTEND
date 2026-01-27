import { useState } from "react";
import { register } from "../services/authService";
import "../styles/register.css";

function Register() {
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
      alert("Registro exitoso");
    } catch (error) {
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
