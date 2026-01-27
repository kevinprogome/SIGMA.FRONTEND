import { useEffect, useState } from "react";
import {
  getModalidades,
  startModality,
  getStudentProfile,
} from "../../services/studentService";
import StudentModalityDocuments from "../student/StudentModalityDocuments";
import "../../styles/student/modalities.css"; // 👈 Importa el CSS

export default function Modalities() {
  const [modalities, setModalities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingId, setSendingId] = useState(null);
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

  const handleSelectModality = async (modalityId) => {
    try {
      setSendingId(modalityId);
      setMessage("");
      const res = await startModality(modalityId);
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

  if (loading) return <div className="modalities-loading">Cargando modalidades...</div>;

  return (
    <div className="modalities-container">
      <div className="modalities-header">
        <h2 className="modalities-title">Modalidades de Grado</h2>
        <p className="modalities-subtitle">Selecciona la modalidad que mejor se ajuste a tu perfil académico</p>
      </div>

      {message && (
        <div className={`modalities-message ${message.includes("Error") || message.includes("No se pudo") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {!isProfileComplete() && (
        <div className="profile-warning">
          <div className="profile-warning-title">
            <span className="profile-warning-icon">⚠️</span>
            Perfil incompleto
          </div>
          <p className="profile-warning-text">
            Debes completar tu perfil académico antes de iniciar una modalidad de grado.
          </p>
        </div>
      )}

      {modalities.length === 0 ? (
        <div className="modalities-empty">
          <div className="modalities-empty-icon">📚</div>
          <p className="modalities-empty-text">No hay modalidades disponibles</p>
        </div>
      ) : (
        <ul className="modalities-list">
          {modalities.map((m) => (
            <li 
              key={m.id} 
              className={`modality-card ${!isProfileComplete() ? "disabled" : ""}`}
            >
              <h3 className="modality-name">{m.name}</h3>
              
              {m.description && (
                <p className="modality-description">{m.description}</p>
              )}

              <div className="modality-requirements">
                <span className="modality-requirements-label">Créditos requeridos:</span>
                <span className="modality-requirements-value">{m.creditsRequired}</span>
              </div>

              <button
                className={`modality-button ${sendingId === m.id ? "loading" : ""}`}
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

      {studentModalityId && selectedModalityId && (
        <div className="documents-section">
          <StudentModalityDocuments
            studentModalityId={studentModalityId}
            modalityId={selectedModalityId}
          />
        </div>
      )}
    </div>
  );
}