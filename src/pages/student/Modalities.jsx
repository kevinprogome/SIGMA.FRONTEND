import { useEffect, useState, useRef } from "react";
import {
  getModalidades,
  startModality,
  getStudentProfile,
  getCurrentModalityStatus,
  getModalityById,
} from "../../services/studentService";
import {
  startGroupModality,
  getEligibleStudents,
  inviteStudent,
} from "../../services/ModalitiesGroupService";
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

  // ✅ NUEVOS ESTADOS PARA FLUJO GRUPAL
  const [showModalityTypeModal, setShowModalityTypeModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingModalityId, setPendingModalityId] = useState(null);
  const [modalityType, setModalityType] = useState(null); // "INDIVIDUAL" | "GROUP"
  
  // Estados para formulario grupal
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [groupStudentModalityId, setGroupStudentModalityId] = useState(null);

  const modalityRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modalitiesRes = await getModalidades();
        setModalities(modalitiesRes);

        try {
          const profileRes = await getStudentProfile();
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
    if (!profile) return false;

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

    return hasBasicInfo && hasFaculty && hasProgram;
  };

  // ✅ PASO 1: Mostrar modal de tipo de modalidad
  const handleStartModalitySelection = (modalityId) => {
    if (!isProfileComplete()) {
      setModalityMessages({
        [modalityId]: {
          type: 'error',
          text: 'Debes completar tu perfil antes de seleccionar una modalidad'
        }
      });
      return;
    }

    setPendingModalityId(modalityId);
    setShowDetailModal(false);
    setShowModalityTypeModal(true);
  };

  // ✅ PASO 2A: Si selecciona INDIVIDUAL
  const handleSelectIndividual = () => {
    setModalityType("INDIVIDUAL");
    setShowModalityTypeModal(false);
    setShowConfirmModal(true);
  };

  // ✅ PASO 2B: Si selecciona GRUPAL
  const handleSelectGroup = async () => {
    setModalityType("GROUP");
    setShowModalityTypeModal(false);
    
    try {
      // ✅ SOLO cargar estudiantes elegibles, NO iniciar modalidad aún
      await loadEligibleStudents();
      
      // Mostrar formulario de invitación
      setShowGroupFormModal(true);
    } catch (err) {
      console.error("❌ Error al cargar estudiantes:", err);
      setModalityMessages({
        [pendingModalityId]: {
          type: 'error',
          text: 'Error al cargar estudiantes disponibles'
        }
      });
    }
  };

  // ✅ Cargar estudiantes elegibles
  const loadEligibleStudents = async (filter = "") => {
    try {
      setLoadingStudents(true);
      const students = await getEligibleStudents(filter);
      setEligibleStudents(students);
    } catch (err) {
      console.error("❌ Error al cargar estudiantes:", err);
      setEligibleStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // ✅ Buscar estudiantes
  const handleSearchStudents = (e) => {
    const value = e.target.value;
    setSearchFilter(value);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      loadEligibleStudents(value);
    }, 300);
  };

  // ✅ Seleccionar/deseleccionar estudiante
  const handleToggleStudent = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.find(s => s.userId === student.userId);
      if (isSelected) {
        return prev.filter(s => s.userId !== student.userId);
      } else {
        if (prev.length >= 2) {
          alert("Máximo 2 estudiantes adicionales");
          return prev;
        }
        return [...prev, student];
      }
    });
  };

  // ✅ PASO 3: Enviar invitaciones
  const handleSendInvitations = async () => {
    if (selectedStudents.length === 0) {
      alert("Debes seleccionar al menos 1 estudiante");
      return;
    }

    // Pasar a confirmación sin enviar nada aún
    setShowGroupFormModal(false);
    setShowConfirmModal(true);
  };

  // ✅ PASO 4: Confirmación final
  const handleFinalConfirm = async () => {
    if (modalityType === "INDIVIDUAL") {
      await handleSelectIndividualModality(pendingModalityId);
    } else {
      // ✅ AHORA SÍ iniciar modalidad grupal y enviar invitaciones
      try {
        setSendingId(pendingModalityId);
        
        // 1. Iniciar modalidad grupal
        const res = await startGroupModality(pendingModalityId);
        const studentModalityId = res.studentModalityId;
        
        // 2. Enviar invitaciones
        for (const student of selectedStudents) {
          await inviteStudent(studentModalityId, student.userId);
        }
        
        // 3. Actualizar estado
        setStudentModalityId(studentModalityId);
        setSelectedModalityId(pendingModalityId);
        
        setModalityMessages({
          [pendingModalityId]: {
            type: 'success',
            text: `Modalidad grupal iniciada. Invitaciones enviadas a ${selectedStudents.length} estudiante(s). Esperando sus respuestas.`
          }
        });
        
        setShowConfirmModal(false);
        resetGroupFlow();
        
      } catch (err) {
        console.error("❌ Error al iniciar modalidad grupal:", err);
        handleModalityError(pendingModalityId, err);
        setShowConfirmModal(false);
      } finally {
        setSendingId(null);
      }
    }
  };

  // Función auxiliar para iniciar modalidad individual
  const handleSelectIndividualModality = async (modalityId) => {
    try {
      setSendingId(modalityId);
      const res = await startModality(modalityId);

      setStudentModalityId(res.studentModalityId);
      setSelectedModalityId(modalityId);
     
      setModalityMessages({
        [modalityId]: {
          type: 'success',
          text: res.message || "Modalidad seleccionada correctamente."
        }
      });

      setShowConfirmModal(false);
    } catch (err) {
      console.error("❌ Error al iniciar modalidad:", err);
      handleModalityError(modalityId, err);
    } finally {
      setSendingId(null);
    }
  };

  // Manejar errores de modalidad
  const handleModalityError = (modalityId, err) => {
    let errorContent = null;
     
    if (err.response?.data) {
      const errorData = err.response.data;
     
      if (typeof errorData === 'object' && errorData.eligible === false) {
        const validationResults = errorData.results;
       
        if (validationResults && Array.isArray(validationResults)) {
          const failedRequirements = validationResults.filter(r => !r.fulfilled);
         
          if (failedRequirements.length > 0) {
            errorContent = (
              <div className="validation-error-details">
                <div className="validation-error-header">
                  {errorData.message || "No cumples los requisitos académicos"}
                </div>
                <ul className="validation-error-list">
                  {failedRequirements.map((req, idx) => (
                    <li key={idx} className="validation-error-item">
                      <strong>{req.requirementName}:</strong>
                      <div className="validation-values">
                        <span>Tu valor: {req.studentValue}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          } else {
            errorContent = errorData.message;
          }
        } else {
          errorContent = errorData.message;
        }
      } else if (typeof errorData === 'string') {
        errorContent = errorData;
      } else if (errorData.message) {
        errorContent = errorData.message;
      } else {
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
    setShowModalityTypeModal(false);
    setShowGroupFormModal(false);
  };

  // Resetear flujo grupal
  const resetGroupFlow = () => {
    setModalityType(null);
    setSelectedStudents([]);
    setEligibleStudents([]);
    setSearchFilter("");
    setGroupStudentModalityId(null);
  };

  const handleViewDetails = async (modalityId) => {
    try {
      setLoadingDetail(true);
      const detail = await getModalityById(modalityId);
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
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-detail-header">
              <h3>{modalityDetail.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <p>Cargando...</p>
            ) : (
              <>
                <p className="modal-detail-description">{modalityDetail.description}</p>

                <div className="modal-detail-info">
                  <strong>Créditos requeridos:</strong> {modalityDetail.requiredCredits || 'N/A'}
                </div>

                <p className="section-title-modal">Requisitos</p>
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

                <p className="section-title-modal">Documentos obligatorios</p>
                {modalityDetail.documents && modalityDetail.documents.length > 0 ? (
                  <ul className="modal-detail-list">
                    {modalityDetail.documents.map((d) => (
                      <li key={d.id}>
                        <strong>{d.documentName}</strong>
                        <p>{d.description}</p>
                        <small className="doc-format-info">
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
                  onClick={() => handleStartModalitySelection(modalityDetail.id)}
                >
                  {studentModalityId ? "Ya tienes una modalidad" : "Seleccionar modalidad"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ✅ NUEVO: MODAL SELECCIÓN TIPO */}
      {showModalityTypeModal && (
        <div className="modal-overlay" onClick={() => setShowModalityTypeModal(false)}>
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Tipo de Modalidad</h3>
            <p>¿Deseas realizar esta modalidad de forma individual o grupal?</p>

            <div className="modality-type-options">
              <button
                className="modality-type-btn individual"
                onClick={handleSelectIndividual}
                disabled={sendingId}
              >
                <span className="type-icon">👤</span>
                <span className="type-label">Individual</span>
                <span className="type-description">Trabajarás solo en esta modalidad</span>
              </button>

              <button
                className="modality-type-btn group"
                onClick={handleSelectGroup}
                disabled={sendingId}
              >
                <span className="type-icon">👥</span>
                <span className="type-label">Grupal</span>
                <span className="type-description">Hasta 3 integrantes (incluido tú)</span>
              </button>
            </div>

            <button
              className="modality-button secondary"
              onClick={() => {
                setShowModalityTypeModal(false);
                resetGroupFlow();
              }}
              disabled={sendingId}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ✅ NUEVO: MODAL FORMULARIO GRUPAL */}
      {showGroupFormModal && (
        <div className="modal-overlay" onClick={() => setShowGroupFormModal(false)}>
          <div className="modal-group-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-detail-header">
              <h3>Invitar Compañeros</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowGroupFormModal(false);
                  resetGroupFlow();
                }}
              >
                ✕
              </button>
            </div>

            <p className="group-form-subtitle">
              Selecciona hasta 2 compañeros para formar tu grupo (máximo 3 integrantes en total)
            </p>

            {/* Buscador */}
            <input
              type="text"
              className="student-search-input"
              placeholder="Buscar por nombre..."
              value={searchFilter}
              onChange={handleSearchStudents}
            />

            {/* Estudiantes seleccionados */}
            {selectedStudents.length > 0 && (
              <div className="selected-students-summary">
                <h4>Seleccionados ({selectedStudents.length}/2):</h4>
                <ul>
                  {selectedStudents.map(s => (
                    <li key={s.userId}>
                      {s.fullName}
                      <button onClick={() => handleToggleStudent(s)}>✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lista de estudiantes */}
            <div className="eligible-students-list">
              {loadingStudents ? (
                <p>Cargando estudiantes...</p>
              ) : eligibleStudents.length === 0 ? (
                <p className="no-students">No hay estudiantes disponibles</p>
              ) : (
                eligibleStudents.map(student => {
                  const isSelected = selectedStudents.find(s => s.userId === student.userId);
                  return (
                    <div
                      key={student.userId}
                      className={`student-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleStudent(student)}
                    >
                      <div className="student-info">
                        <h4>{student.fullName}</h4>
                        <p>{student.academicProgramName}</p>
                        <small>Semestre {student.currentSemester}</small>
                      </div>
                      <div className="student-checkbox">
                        {isSelected && "✓"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="modal-confirm-actions">
              <button
                className="modality-button secondary"
                onClick={() => {
                  setShowGroupFormModal(false);
                  resetGroupFlow();
                }}
              >
                Cancelar
              </button>

              <button
                className="modality-button"
                onClick={handleSendInvitations}
                disabled={selectedStudents.length === 0 || sendingId}
              >
                {sendingId ? "Enviando..." : `Invitar (${selectedStudents.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL CONFIRMACIÓN FINAL */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar selección</h3>

            {modalityType === "INDIVIDUAL" ? (
              <p>
                ¿Estás seguro que deseas seleccionar esta modalidad de forma <strong>individual</strong>?
                <br />
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
            ) : (
              <>
                <p>
                  Has invitado a <strong>{selectedStudents.length} compañero(s)</strong>:
                </p>
                <ul className="invited-students-list">
                  {selectedStudents.map(s => (
                    <li key={s.userId}>• {s.fullName}</li>
                  ))}
                </ul>
                <p>
                  Las invitaciones serán enviadas. Una vez que acepten, podrán trabajar juntos.
                </p>
              </>
            )}

            <div className="modal-confirm-actions">
              <button
                className="modality-button secondary"
                disabled={sendingId}
                onClick={() => {
                  setShowConfirmModal(false);
                  resetGroupFlow();
                }}
              >
                Cancelar
              </button>

              <button
                className={`modality-button ${sendingId ? "loading" : ""}`}
                disabled={sendingId}
                onClick={handleFinalConfirm}
              >
                {sendingId ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}