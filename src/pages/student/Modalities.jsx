import { useEffect, useState, useRef } from "react";
import {
  getModalidades,
  startModality,
  getStudentProfile,
  getCurrentModalityStatus,
  getModalityById,
} from "../../services/studentService";
import StudentModalityDocuments from "../student/StudentModalityDocuments";
import "../../styles/student/modalities.css";

export default function Modalities() {
  const [modalities, setModalities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState(""); // Mensaje global
  const [modalityMessages, setModalityMessages] = useState({}); // Mensajes por modalidad
  const [sendingId, setSendingId] = useState(null);

  const [studentModalityId, setStudentModalityId] = useState(null);
  const [selectedModalityId, setSelectedModalityId] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalityDetail, setModalityDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingModalityId, setPendingModalityId] = useState(null);

  const documentsRef = useRef(null);
  const modalityRefs = useRef({}); // Referencias a cada tarjeta de modalidad

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modalitiesRes, profileRes] = await Promise.all([
          getModalidades(),
          getStudentProfile(),
        ]);

        console.log("📋 Modalidades recibidas:", modalitiesRes); // ✅ Debug

        setModalities(modalitiesRes);
        setProfile(profileRes);

        try {
          const currentModality = await getCurrentModalityStatus();
          if (currentModality) {
            const smId =
              currentModality.studentModalityId || currentModality.id;

            setStudentModalityId(smId);
            setSelectedModalityId(currentModality.modalityId);
          }
        } catch {
          // No modalidad activa
        }
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        setGlobalMessage("Error al cargar la información");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isProfileComplete = () => {
    if (!profile) return false;
    const { approvedCredits, gpa, semester, studentCode, facultyId, academicProgramId } = profile;
    return approvedCredits && gpa && semester && studentCode && facultyId && academicProgramId;
  };

  const handleSelectModality = async (modalityId) => {
    try {
      setSendingId(modalityId);
      setModalityMessages({}); // Limpiar mensajes anteriores

      const res = await startModality(modalityId);

      setStudentModalityId(res.studentModalityId);
      setSelectedModalityId(modalityId);
      
      // Mensaje de éxito específico para esta modalidad
      setModalityMessages({ [modalityId]: { type: 'success', text: res.message } });

      setShowConfirmModal(false);
      setShowDetailModal(false);

      // Scroll automático a documentos
      setTimeout(() => {
        documentsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "No se pudo iniciar la modalidad";
      
      // Mensaje de error específico para esta modalidad
      setModalityMessages({ [modalityId]: { type: 'error', text: errorMessage } });
      
      // Scroll a la tarjeta de la modalidad con error
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
      console.log("📄 Detalle de modalidad:", detail); // ✅ Debug
      setModalityDetail(detail);
      setShowDetailModal(true);
    } catch (err) {
      console.error("❌ Error al cargar detalles:", err);
      setModalityMessages({ [modalityId]: { type: 'error', text: "Error al cargar los detalles de la modalidad" } });
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="modalities-loading">Cargando modalidades...</div>
    );
  }

  return (
    <div className="modalities-container">
      <div className="modalities-header">
        <h2 className="modalities-title">Modalidades de Grado</h2>
        <p className="modalities-subtitle">
          Selecciona la modalidad que mejor se ajuste a tu perfil académico
        </p>
      </div>

      {/* Mensaje global (solo para errores generales) */}
      {globalMessage && (
        <div className="modalities-message error">{globalMessage}</div>
      )}

      {/* ✅ Verificar si el perfil está completo */}
      {!isProfileComplete() && (
        <div className="modalities-message warning">
          ⚠️ Completa tu perfil antes de seleccionar una modalidad. 
          <a href="/student/profile" style={{ marginLeft: '0.5rem', textDecoration: 'underline' }}>
            Ir a mi perfil
          </a>
        </div>
      )}

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
                {/* ✅ Cambio aquí: requiredCredits en lugar de creditsRequired */}
                {m.requiredCredits || 'N/A'}
              </span>
            </div>

            {/* Mensaje específico de esta modalidad */}
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

      {/* DOCUMENTOS */}
      {studentModalityId && selectedModalityId && (
        <div ref={documentsRef}>
          <StudentModalityDocuments
            studentModalityId={studentModalityId}
            modalityId={selectedModalityId}
          />
        </div>
      )}

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
                  {/* ✅ Cambio aquí también */}
                  {modalityDetail.requiredCredits || 'N/A'}
                </div>

                <h4>Requisitos</h4>
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
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No hay requisitos específicos</p>
                )}

                <h4>Documentos obligatorios</h4>
                {modalityDetail.documents && modalityDetail.documents.length > 0 ? (
                  <ul className="modal-detail-list">
                    {modalityDetail.documents.map((d) => (
                      <li key={d.id}>
                        <strong>{d.documentName}</strong>
                        <p>{d.description}</p>
                        <small>
                          {d.allowedFormat} · Máx {d.maxFileSizeMB}MB
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No hay documentos obligatorios</p>
                )}

                <button
                  className="modality-button"
                  disabled={!isProfileComplete() || studentModalityId}
                  onClick={() => {
                    setPendingModalityId(modalityDetail.id);
                    setShowConfirmModal(true);
                  }}
                  title={
                    !isProfileComplete() 
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
                className={`modality-button ${
                  sendingId ? "loading" : ""
                }`}
                disabled={sendingId}
                onClick={() =>
                  handleSelectModality(pendingModalityId)
                }
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