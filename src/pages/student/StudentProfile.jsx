import { useEffect, useState } from "react";
import {
  getStudentProfile,
  saveStudentProfile,
} from "../../services/studentService";

export default function Profile() {
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
        setMessage("No se pudo cargar el perfil");
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
      await saveStudentProfile(profile);
      setMessage("Perfil actualizado correctamente ✅");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "No se pudo guardar el perfil"
      );
    }
  };

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2>Perfil del Estudiante</h2>

      <p>
        <strong>Nombre:</strong> {userInfo.name} {userInfo.lastname}
      </p>
      <p>
        <strong>Email:</strong> {userInfo.email}
      </p>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Créditos aprobados:
          <input
            type="number"
            name="approvedCredits"
            value={profile.approvedCredits}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          Promedio (GPA):
          <input
            type="number"
            step="0.01"
            name="gpa"
            value={profile.gpa}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          Semestre:
          <input
            type="number"
            name="semester"
            value={profile.semester}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          Código estudiantil:
          <input
            type="text"
            name="studentCode"
            value={profile.studentCode}
            onChange={handleChange}
            required
          />
        </label>

        <br />
        <br />

        <button type="submit">Guardar perfil</button>
      </form>
    </div>
  );
}
