import { useEffect, useState } from "react";
import {
  getStudentProfile,
  saveStudentProfile,
} from "../../services/studentService";
import "../../styles/student/studentProfile.css";

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    approvedCredits: "",
    gpa: "",
    semester: "",
    studentCode: "",
  });

  const [userInfo, setUserInfo] = useState({
    name: "",
    lastname: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStudentProfile();

        setUserInfo({
          name: data.name,
          lastname: data.lastname,
          email: data.email,
        });

        setProfile({
          approvedCredits: data.approvedCredits ?? "",
          gpa: data.gpa ?? "",
          semester: data.semester ?? "",
          studentCode: data.studentCode ?? "",
        });
      } catch (err) {
        console.error(err);
        // El backend maneja: "Usuario no encontrado"
        setMessage(err.response?.data || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await saveStudentProfile(profile);
      // El backend devuelve: "Datos de perfil de estudiante actualizados correctamente"
      setMessage(response.data || "Perfil actualizado correctamente");
    } catch (err) {
      console.error(err);
      // El backend maneja estos mensajes:
      // - "El semestre debe estar entre 1 y 10."
      // - "La nota promedio debe estar entre 0.0 y 5.0."
      // - "El número máximo de créditos aprobados es 180."
      // - "Usuario no encontrado"
      setMessage(err.response?.data || "No se pudo guardar el perfil");
    }
  };

  if (loading) {
    return <p className="profile-loading">Cargando perfil...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Perfil del Estudiante</h1>
          <p>Consulta y actualiza tu información académica</p>
        </div>

        <div className="profile-body">
          {/* INFO USUARIO */}
          <div className="profile-info">
            <p>
              <strong>Nombre:</strong> {userInfo.name} {userInfo.lastname}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email}
            </p>
          </div>

          {message && <div className="profile-message">{message}</div>}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="profile-group">
              <label>Créditos aprobados</label>
              <input
                type="number"
                name="approvedCredits"
                value={profile.approvedCredits}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-group">
              <label>Promedio (GPA)</label>
              <input
                type="number"
                step="0.01"
                name="gpa"
                value={profile.gpa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-group">
              <label>Semestre</label>
              <input
                type="number"
                name="semester"
                value={profile.semester}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-group">
              <label>Código estudiantil</label>
              <input
                type="text"
                name="studentCode"
                value={profile.studentCode}
                onChange={handleChange}
                required
              />
            </div>

            <button className="profile-button" type="submit">
              Guardar perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}