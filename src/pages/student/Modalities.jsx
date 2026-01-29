import { useEffect, useState } from "react";
import {
  getModalidades,
  startModality,
  getStudentProfile,
  getCurrentModalityStatus,
  getModalityById, // 👈 Si tienes este servicio
} from "../../services/studentService";
import StudentModalityDocuments from "../student/StudentModalityDocuments";
import "../../styles/student/modalities.css";

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

        // 🔥 Verificar si el estudiante ya tiene una modalidad activa
        try {
          const currentModality = await getCurrentModalityStatus();
          console.log("📌 MODALIDAD ACTUAL COMPLETA:", currentModality);
          
          if (currentModality) {
            const smId = currentModality.studentModalityId || currentModality.id;
            
            if (smId) {
              setStudentModalityId(smId);
              
              // 🔍 OPCIÓN 1: Buscar por nombre de modalidad
              if (currentModality.modalityName) {
                const foundModality = modalitiesRes.find(
                  m => m.name === currentModality.modalityName
                );
                if (foundModality) {
                  console.log("✅ Modalidad encontrada por nombre:", foundModality.id);
                  setSelectedModalityId(foundModality.id);
                  
                  // Scroll automático
                  setTimeout(() => {
                    const documentsSection = document.querySelector('.documents-container');
                    if (documentsSection) {
                      documentsSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }
                  }, 500);
                }
              }
              // 🔍 OPCIÓN 2: Si viene modalityId directamente
              else if (currentModality.modalityId) {
                console.log("✅ ModalityId directo:", currentModality.modalityId);
                setSelectedModalityId(currentModality.modalityId);
                
                setTimeout(() => {
                  const documentsSection = document.querySelector('.documents-container');
                  if (documentsSection) {
                    documentsSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }
                }, 500);
              }
            }
          }
        } catch (err) {
          console.log("ℹ️ No hay modalidad activa:", err);
        }
        
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
      
      // 🔥 Scroll automático suave hacia la sección de documentos
      setTimeout(() => {
        const documentsSection = document.querySelector('.documents-container');
        if (documentsSection) {
          documentsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 400);
      
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
              className={`modality-card ${!isProfileComplete() || studentModalityId ? "disabled" : ""}`}
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
                disabled={sendingId === m.id || !isProfileComplete() || studentModalityId}
              >
                {studentModalityId 
                  ? "Ya tienes una modalidad activa"
                  : sendingId === m.id
                  ? "Validando requisitos..."
                  : "Seleccionar modalidad"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {studentModalityId && selectedModalityId && (
        <StudentModalityDocuments
          studentModalityId={studentModalityId}
          modalityId={selectedModalityId}
        />
      )}
    </div>
  );
}