import { useState } from "react";
import { register } from "../services/authService";

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
      const token = await register(form);
      localStorage.setItem("token", token);
      alert("Registro exitoso");
      localStorage.setItem(
      "studentBasicInfo",
      JSON.stringify({
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email,
      })
    );

    } catch (error) {
      alert(error.response?.data || "Error al registrarse");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro SIGMA</h2>

      <input name="name" placeholder="Nombre" onChange={handleChange} />
      <input name="lastName" placeholder="Apellido" onChange={handleChange} />
      <input name="email" placeholder="Correo institucional" onChange={handleChange} />
      <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />

      <button type="submit">Registrarse</button>
    </form>
  );
}

export default Register;
