import { useEffect, useState } from "react";
import {
  getModalidades,
  startModality,
  getStudentProfile,
} from "../../services/studentService";
import StudentModalityDocuments from "../student/StudentModalityDocuments";

export default function Modalities() {
  const [modalities, setModalities] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingId, setSendingId] = useState(null);

  // 🔹 flujo modalidad
  const [studentModalityId, setStudentModalityId] = useState(null);
  const [selectedModalityId, setSelectedModalityId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modalitiesRes, profileRes] = await Promise.all([
          getModalidades(),
          getStudentProfile(),
        ]);

        setModalities(modalitiesRes);
        setProfile(profileRes);
      } catch (err) {
        console.error(err);
        setMessage("Error al cargar la información");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔒 valida si el perfil está completo
  const isProfileComplete = () => {
    if (!profile) return false;

    const { approvedCredits, gpa, semester, studentCode } = profile;

    return (
      approvedCredits !== null &&
      gpa !== null &&
      semester !== null &&
      studentCode
    );
  };

  // 🔥 solo valida requisitos y crea StudentModality
  const handleSelectModality = async (modalityId) => {
    try {
      setSendingId(modalityId);
      setMessage("");

      const res = await startModality(modalityId);

      // backend manda todo
      setStudentModalityId(res.studentModalityId);
      setSelectedModalityId(modalityId);
      setMessage(res.message);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "No se pudo iniciar la modalidad"
      );
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <p>Cargando modalidades...</p>;

  return (
    <div>
      <h2>Modalidades disponibles</h2>

      {message && <p>{message}</p>}

      {/* ⚠️ PERFIL INCOMPLETO */}
      {!isProfileComplete() && (
        <div
          style={{
            padding: "15px",
            background: "#fff3cd",
            marginBottom: "20px",
            borderRadius: "5px",
          }}
        >
          <strong>⚠️ Perfil incompleto</strong>
          <p>
            Debes completar tu perfil académico antes de iniciar una modalidad
            de grado.
          </p>
        </div>
      )}

      {modalities.length === 0 ? (
        <p>No hay modalidades disponibles</p>
      ) : (
        <ul>
          {modalities.map((m) => (
            <li key={m.id} style={{ marginBottom: "25px" }}>
              <strong>{m.name}</strong>

              {m.description && <p>{m.description}</p>}

              <p>
                <strong>Créditos requeridos:</strong> {m.creditsRequired}
              </p>

              <button
                onClick={() => handleSelectModality(m.id)}
                disabled={sendingId === m.id || !isProfileComplete()}
              >
                {sendingId === m.id
                  ? "Validando requisitos..."
                  : "Seleccionar modalidad"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 🔥 SOLO SI PASÓ LA VALIDACIÓN */}
      {studentModalityId && selectedModalityId && (
        <StudentModalityDocuments
          studentModalityId={studentModalityId}
          modalityId={selectedModalityId}
        />
      )}
    </div>
  );
}
