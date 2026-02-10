import { useEffect, useState, useRef } from "react";
import {
  getModalidades,
  startModality,
  getStudentProfile,
  getCurrentModalityStatus,
  getModalityById,
} from "../../services/studentService";
import "../../styles/student/modalities.css";

export default function Modalities() {
  const [modalities, setModalities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState("");
  const [modalityMessages, setModalityMessages] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const [studentModalityId, setStudentModalityId] = useState(null);
  const [selectedModalityId, setSelectedModalityId] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalityDetail, setModalityDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingModalityId, setPendingModalityId] = useState(null);

  const modalityRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modalitiesRes = await getModalidades();
        console.log("📋 Modalidades recibidas:", modalitiesRes);
        setModalities(modalitiesRes);

        try {
          const profileRes = await getStudentProfile();
          console.log("👤 Perfil recibido:", profileRes);
          setProfile(profileRes);
        } catch (profileErr) {
          console.warn("⚠️ No se pudo cargar el perfil:", profileErr);
          setProfile(null);
        }

        try {
          const currentModality = await getCurrentModalityStatus();
          if (currentModality) {
            const smId = currentModality.studentModalityId || currentModality.id;
            setStudentModalityId(smId);
            setSelectedModalityId(currentModality.modalityId);
          }
        } catch {
          // No modalidad activa
        }
      } catch (err) {
        console.error("❌ Error al cargar modalidades:", err);
        setGlobalMessage("Error al cargar las modalidades");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isProfileComplete = () => {
    if (!profile) {
      console.log("❌ No hay perfil registrado");
      return false;
    }

    const {
      approvedCredits,
      gpa,
      semester,
      studentCode,
      facultyId,
      academicProgramId,
      faculty,
      academicProgram
    } = profile;

    const hasFaculty = facultyId || faculty;
    const hasProgram = academicProgramId || academicProgram;
    const hasBasicInfo = approvedCredits && gpa && semester && studentCode;

    const isComplete = hasBasicInfo && hasFaculty && hasProgram;

    console.log("🔍 Validación de perfil:", {
      approvedCredits,
      gpa,
      semester,
      studentCode,
      facultyId,
      academicProgramId,
      faculty,
      academicProgram,
      hasFaculty,
      hasProgram,
      hasBasicInfo,
      isComplete
    });

    return isComplete;
  };

  const handleSelectModality = async (modalityId) => {
    if (!isProfileComplete()) {
      setModalityMessages({
        [modalityId]: {
          type: 'error',
          text: 'Debes completar tu perfil antes de seleccionar una modalidad'
        }
      });
      return;
    }

    try {
      setSendingId(modalityId);
      setModalityMessages({});

      const res = await startModality(modalityId);

      setStudentModalityId(res.studentModalityId);
      setSelectedModalityId(modalityId);
     
      setModalityMessages({
        [modalityId]: {
          type: 'success',
          text: res.message || "Modalidad seleccionada correctamente. Ahora puedes subir los documentos en la sección 'Documentos'."
        }
      });

      setShowConfirmModal(false);
      setShowDetailModal(false);

    } catch (err) {
      console.error("❌ Error al iniciar modalidad:", err);
      console.error("❌ Response completa:", err.response);
     
      let errorContent = null;
     
      if (err.response?.data) {
        const errorData = err.response.data;
       
        // Caso 1: Validación de requisitos (objeto con eligible: false y results)
        if (typeof errorData === 'object' && errorData.eligible === false) {
          const validationResults = errorData.results;
         
          if (validationResults && Array.isArray(validationResults)) {
            const failedRequirements = validationResults.filter(r => !r.fulfilled);
           
            if (failedRequirements.length > 0) {
              errorContent = (
                <div className="validation-error-details">
                  <div className="validation-error-header">
                    {errorData.message || "No cumples los requisitos académicos para esta modalidad"}
                  </div>
                  <ul className="validation-error-list">
                    {failedRequirements.map((req, idx) => (
                      <li key={idx} className="validation-error-item">
                        <strong>{req.requirementName}:</strong>
                        <div className="validation-values">
                          <span className="validation-current">Tu valor: {req.studentValue}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else {
              errorContent = errorData.message || "No cumples los requisitos para esta modalidad";
            }
          } else {
            errorContent = errorData.message || "No cumples los requisitos para esta modalidad";
          }
        }
        // Caso 2: String directo del backend
        else if (typeof errorData === 'string') {
          errorContent = errorData;
        }
        // Caso 3: Objeto con propiedad message
        else if (errorData.message) {
          errorContent = errorData.message;
        }
        // Caso 4: Fallback
        else {
          errorContent = "No se pudo iniciar la modalidad";
        }
      } else {
        errorContent = err.message || "No se pudo iniciar la modalidad";
      }
     
      setModalityMessages({
        [modalityId]: {
          type: 'error',
          text: errorContent
        }
      });
     
      setShowConfirmModal(false);
      setShowDetailModal(false);
     
      setTimeout(() => {
        modalityRefs.current[modalityId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } finally {
      setSendingId(null);
    }
  };

  const handleViewDetails = async (modalityId) => {
    try {
      setLoadingDetail(true);
      const detail = await getModalityById(modalityId);
      console.log("📄 Detalle de modalidad:", detail);
      setModalityDetail(detail);
      setShowDetailModal(true);
    } catch (err) {
      console.error("❌ Error al cargar detalles:", err);
      setModalityMessages({
        [modalityId]: {
          type: 'error',
          text: "Error al cargar los detalles de la modalidad"
        }
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="modalities-loading">Cargando modalidades...</div>
    );
  }

  const profileComplete = isProfileComplete();

  return (
    <div className="modalities-container">
      <div className="modalities-header">
        <h2 className="modalities-title">Modalidades de Grado</h2>
        <p className="modalities-subtitle">
          Selecciona la modalidad que mejor se ajuste a tu perfil académico
        </p>
      </div>

      {globalMessage && (
        <div className="modalities-message error">{globalMessage}</div>
      )}

      {!profileComplete && (
        <div className="profile-warning">
          <div className="profile-warning-title">
            <span className="profile-warning-icon">⚠️</span>
            Perfil incompleto
          </div>
          <p className="profile-warning-text">
            Debes completar tu perfil antes de poder seleccionar una modalidad de grado.{' '}
            <a href="/student/profile" style={{ color: '#856404', fontWeight: '600', textDecoration: 'underline' }}>
              Ir a mi perfil
            </a>
          </p>
        </div>
      )}

      {profileComplete && !studentModalityId && (
        <div className="modalities-message success">
          ✅ Tu perfil está completo. Ahora puedes seleccionar una modalidad.
        </div>
      )}

      {/* Mostrar mensaje si ya tiene modalidad seleccionada */}
      {studentModalityId && (
        <div className="modalities-message info">
          ℹ️ Ya tienes una modalidad seleccionada. Puedes subir tus documentos en la sección{' '}
          <a href="/student/documents" style={{ color: '#004085', fontWeight: '600', textDecoration: 'underline' }}>
            Documentos
          </a>
        </div>
      )}

      {/* Lista de modalidades */}
      <ul className="modalities-list">
        {modalities.map((m) => (
          <li
            key={m.id}
            className="modality-card"
            ref={(el) => (modalityRefs.current[m.id] = el)}
          >
            <h3 className="modality-name">{m.name}</h3>
            <p className="modality-description">{m.description}</p>

            <div className="modality-requirements">
              <span className="modality-requirements-label">
                Créditos requeridos:
              </span>
              <span className="modality-requirements-value">
                {m.requiredCredits || 'N/A'}
              </span>
            </div>

            {/* Mensaje específico por modalidad */}
            {modalityMessages[m.id] && (
              <div className={`modality-specific-message ${modalityMessages[m.id].type}`}>
                {modalityMessages[m.id].text}
              </div>
            )}

            <button
              className="modality-button secondary"
              onClick={() => handleViewDetails(m.id)}
            >
              Ver detalles
            </button>
          </li>
        ))}
      </ul>

      {/* MODAL DETALLES */}
      {showDetailModal && modalityDetail && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-detail-header">
              <h3>{modalityDetail.name}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <p>Cargando...</p>
            ) : (
              <>
                <p className="modal-detail-description">
                  {modalityDetail.description}
                </p>

                <div className="modal-detail-info">
                  <strong>Créditos requeridos:</strong>{" "}
                  {modalityDetail.requiredCredits || 'N/A'}
                </div>

                <p style={{
                  fontWeight: '600',
                  color: '#7A1117',
                  fontSize: '1.1rem',
                  marginTop: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  Requisitos
                </p>
                {modalityDetail.requirements && modalityDetail.requirements.length > 0 ? (
                  <ul className="modal-detail-list">
                    {modalityDetail.requirements.map((r) => (
                      <li key={r.id}>
                        <strong>{r.requirementName}</strong>
                        <p>{r.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>
                    No hay requisitos específicos
                  </p>
                )}

                <p style={{
                  fontWeight: '600',
                  color: '#7A1117',
                  fontSize: '1.1rem',
                  marginTop: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  Documentos obligatorios
                </p>
                {modalityDetail.documents && modalityDetail.documents.length > 0 ? (
                  <ul className="modal-detail-list">
                    {modalityDetail.documents.map((d) => (
                      <li key={d.id}>
                        <strong>{d.documentName}</strong>
                        <p>{d.description}</p>
                        <small style={{
                          display: 'block',
                          marginTop: '0.5rem',
                          color: '#888',
                          fontSize: '0.85rem'
                        }}>
                          {d.allowedFormat} · Máx {d.maxFileSizeMB}MB
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>
                    No hay documentos obligatorios
                  </p>
                )}

                <button
                  className="modality-button"
                  disabled={!profileComplete || studentModalityId}
                  onClick={() => {
                    if (!profileComplete) {
                      setModalityMessages({
                        [modalityDetail.id]: {
                          type: 'error',
                          text: 'Completa tu perfil antes de seleccionar una modalidad'
                        }
                      });
                      setShowDetailModal(false);
                      return;
                    }
                    setPendingModalityId(modalityDetail.id);
                    setShowConfirmModal(true);
                  }}
                  title={
                    !profileComplete
                      ? "Completa tu perfil primero"
                      : studentModalityId
                      ? "Ya tienes una modalidad seleccionada"
                      : ""
                  }
                >
                  {studentModalityId ? "Ya tienes una modalidad" : "Seleccionar modalidad"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN */}
      {showConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirmar selección</h3>

            <p>
              ¿Estás seguro que deseas seleccionar esta modalidad de grado?
              <br />
              <strong>Esta acción no se puede deshacer.</strong>
            </p>

            <div className="modal-confirm-actions">
              <button
                className="modality-button secondary"
                disabled={sendingId}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>

              <button
                className={`modality-button ${sendingId ? "loading" : ""}`}
                disabled={sendingId}
                onClick={() => handleSelectModality(pendingModalityId)}
              >
                {sendingId ? "Seleccionando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}