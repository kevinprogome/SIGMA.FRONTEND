import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentModalityProfile,
  reviewDocumentCommittee,
  approveCommittee,
  getDocumentBlobUrl,
  getModalityDetails,
  closeModalityByCommittee,
} from "../../services/committeeService";
import AssignDirectorModal from "../../components/committee/AssignDirectorModal";
import AssignExaminersModal from "../../components/committee/AssignExaminerModal";
import ModalityDetailsModal from "../../components/committee/ModalityDetailsModal";
import ChangeDirectorModal from "../../components/committee/ChangeDirectorModal";
import FinalDecisionModal, { isFinalDecisionModality } from "../../components/committee/FinalDecisionModal";
import "../../styles/council/studentprofile.css";

export default function CommitteeStudentProfile() {
  const { studentModalityId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewingDocId, setReviewingDocId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(null);

  // Estados para modales
  const [showChangeDirectorModal, setShowChangeDirectorModal] = useState(false);
  const [showAssignDirectorModal, setShowAssignDirectorModal] = useState(false);
  const [showAssignExaminersModal, setShowAssignExaminersModal] = useState(false);
  const [showModalityDetailsModal, setShowModalityDetailsModal] = useState(false);
  const [showCloseModalityModal, setShowCloseModalityModal] = useState(false);
  const [showFinalDecisionModal, setShowFinalDecisionModal] = useState(false);
  const [modalityDetails, setModalityDetails] = useState(null);
  const [closeReason, setCloseReason] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [studentModalityId]);

  const fetchProfile = async () => {
    try {
      const res = await getStudentModalityProfile(studentModalityId);
      console.log("RESPUESTA BACKEND (comité):", res);
      setProfile(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo cargar la información del estudiante");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (studentDocumentId) => {
    setLoadingDoc(studentDocumentId);
    try {
      const blobUrl = await getDocumentBlobUrl(studentDocumentId);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar el documento");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoadingDoc(null);
    }
  };

  const handleReviewDocument = async (studentDocumentId) => {
    if (!selectedStatus) {
      setError("Por favor selecciona un estado");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!notes.trim()) {
      setError("Por favor agrega un comentario");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSubmitting(true);
    try {
      await reviewDocumentCommittee(studentDocumentId, { status: selectedStatus, notes: notes.trim() });
      setSuccessMessage("✅ Documento revisado exitosamente");
      setTimeout(() => setSuccessMessage(""), 5000);
      await fetchProfile();
      setReviewingDocId(null);
      setSelectedStatus("");
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al revisar el documento");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveModality = async () => {
    const mandatoryDocs = profile.documents.filter(d => d.mandatory);
    const uploadedMandatory = mandatoryDocs.filter(d => d.uploaded);
    const allMandatoryAccepted = uploadedMandatory.every(
      (d) => d.status === "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW"
    );
    if (uploadedMandatory.length < mandatoryDocs.length) {
      setError("El estudiante debe cargar todos los documentos obligatorios");
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (!allMandatoryAccepted) {
      setError("Debes aceptar todos los documentos obligatorios antes de aprobar la modalidad");
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (!window.confirm("¿Estás seguro de aprobar esta modalidad? Esta acción es definitiva.")) return;
    setSubmitting(true);
    try {
      await approveCommittee(studentModalityId);
      setSuccessMessage("✅ Modalidad aprobada exitosamente");
      setTimeout(() => navigate("/comite"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al aprobar la modalidad");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModality = async (e) => {
    e.preventDefault();
    if (!closeReason.trim()) {
      setError("Debe proporcionar el motivo del cierre");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSubmitting(true);
    try {
      const response = await closeModalityByCommittee(studentModalityId, closeReason);
      setSuccessMessage(`✅ ${response.message || "Modalidad cerrada exitosamente"}`);
      setShowCloseModalityModal(false);
      setCloseReason("");
      await fetchProfile();
      setTimeout(() => setSuccessMessage(""), 10000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al cerrar la modalidad");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewModalityDetails = async () => {
    try {
      const details = await getModalityDetails(profile.modalityId);
      setModalityDetails(details);
      setShowModalityDetailsModal(true);
    } catch (err) {
      setError("Error al cargar detalles de la modalidad");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleModalSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
    fetchProfile();
  };

  const canEditDocument = (doc) => doc.status !== "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW";

  const getStatusBadgeClass = (status) => {
    if (status === "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW") return "accepted";
    if (status === "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW") return "rejected";
    if (status === "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE") return "corrections";
    if (status === "ACCEPTED_FOR_PROGRAM_HEAD_REVIEW") return "accepted";
    if (status === "REJECTED_FOR_PROGRAM_HEAD_REVIEW") return "rejected";
    if (status === "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD") return "corrections";
    return "pending";
  };

  const getStatusLabel = (status) => {
    const labels = {
      "PENDING": "Pendiente",
      "ACCEPTED_FOR_PROGRAM_HEAD_REVIEW": "Aceptado por Jefe de Programa",
      "REJECTED_FOR_PROGRAM_HEAD_REVIEW": "Rechazado por Jefe de Programa",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD": "Correcciones solicitadas por Jefe",
      "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW": "Aceptado por Comité",
      "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW": "Rechazado por Comité",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE": "Correcciones solicitadas por Comité",
      "CORRECTION_RESUBMITTED": "Corrección reenviada",
    };
    return labels[status] || status;
  };

  if (loading) return <div className="student-profile-loading">Cargando perfil del estudiante...</div>;

  if (error && !profile) {
    return (
      <div className="student-profile-error">
        <p>{error}</p>
        <button onClick={() => navigate("/comite")} className="back-btn">← Volver al listado</button>
      </div>
    );
  }

  if (!profile) return <div className="student-profile-no-data">No hay información disponible</div>;

  const mandatoryDocs = profile.documents.filter(d => d.mandatory);
  const uploadedDocs = profile.documents.filter((d) => d.uploaded);
  const uploadedMandatory = mandatoryDocs.filter(d => d.uploaded);
  const allMandatoryAccepted = uploadedMandatory.every(
    (d) => d.status === "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW"
  );
  const isModalityClosed = profile.currentStatus === "MODALITY_CLOSED";

  // ✅ Solo aplica para: Posgrado, Seminario de Grado, Producción Académica de Alto Nivel
  const isFinalDecision = isFinalDecisionModality(profile.modalityName);

  return (
    <div className="student-profile-container">

      {/* Header */}
      <div className="student-profile-header">
        <h2 className="student-profile-title">Perfil del Estudiante - Comité de Currículo</h2>
        <p className="student-profile-subtitle">Revisa documentos y gestiona la modalidad de grado</p>
      </div>

      {/* Student Info */}
      <div className="student-info-card">
        <h3 className="card-section-title">👤 Información del Estudiante</h3>
        <div className="student-info-grid">
          <div className="student-info-item">
            <span className="student-info-label">Nombre Completo</span>
            <span className="student-info-value">{profile.studentName} {profile.studentLastName}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Email</span>
            <span className="student-info-value email">{profile.studentEmail}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Código Estudiantil</span>
            <span className="student-info-value">{profile.studentCode || "N/A"}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Programa Académico</span>
            <span className="student-info-value">{profile.academicProgramName}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Facultad</span>
            <span className="student-info-value">{profile.facultyName}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Créditos Aprobados</span>
            <span className="student-info-value">{profile.approvedCredits || "N/A"}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Promedio (GPA)</span>
            <span className="student-info-value">{profile.gpa || "N/A"}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Semestre</span>
            <span className="student-info-value">{profile.semester || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Modality Info */}
      <div className="student-info-card">
        <h3 className="card-section-title">📚 Información de la Modalidad</h3>
        <div className="student-info-grid">
          <div className="student-info-item">
            <span className="student-info-label">Modalidad</span>
            <span className="student-info-value">{profile.modalityName}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Estado Actual</span>
            <span className={`student-info-value status ${isModalityClosed ? "closed" : ""}`}>
              {isModalityClosed && "🔒 "}{profile.currentStatusDescription}
            </span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Última Actualización</span>
            <span className="student-info-value">
              {profile.lastUpdatedAt
                ? new Date(profile.lastUpdatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
                : "N/A"}
            </span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Créditos Requeridos</span>
            <span className="student-info-value">{profile.creditsRequired || "N/A"}</span>
          </div>
          {profile.projectDirectorName && (
            <>
              <div className="student-info-item">
                <span className="student-info-label">Director de Proyecto</span>
                <span className="student-info-value">{profile.projectDirectorName}</span>
              </div>
              <div className="student-info-item">
                <span className="student-info-label">Email del Director</span>
                <span className="student-info-value email">{profile.projectDirectorEmail}</span>
              </div>
            </>
          )}
          {profile.defenseDate && (
            <>
              <div className="student-info-item">
                <span className="student-info-label">Fecha de Sustentación</span>
                <span className="student-info-value">
                  {new Date(profile.defenseDate).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}
                </span>
              </div>
              <div className="student-info-item">
                <span className="student-info-label">Lugar de Sustentación</span>
                <span className="student-info-value">{profile.defenseLocation || "N/A"}</span>
              </div>
            </>
          )}
          {profile.academicDistinction && (
            <div className="student-info-item">
              <span className="student-info-label">Resultado</span>
              <span className="student-info-value distinction">{profile.academicDistinction}</span>
            </div>
          )}
        </div>
        {profile.modalityId && (
          <div className="modality-details-btn-container">
            <button onClick={handleViewModalityDetails} className="btn-view-modality-details">
              📋 Ver Detalles Completos de la Modalidad
            </button>
          </div>
        )}
      </div>

      {/* Documents Stats */}
      <div className="documents-stats-card">
        <h3 className="card-section-title">📊 Estadísticas de Documentos</h3>
        <div className="stats-grid">
          <div className="stat-item total" style={{ background: '#a01a1f', borderRadius: '12px' }}>
            <div className="stat-number">{profile.totalDocuments || 0}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item approved" style={{ background: '#a01a1f', borderRadius: '12px' }}>
            <div className="stat-number">{profile.approvedDocuments || 0}</div>
            <div className="stat-label">Aprobados</div>
          </div>
          <div className="stat-item pending" style={{ background: '#a01a1f', borderRadius: '12px' }}>
            <div className="stat-number">{profile.pendingDocuments || 0}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-item rejected" style={{ background: '#a01a1f', borderRadius: '12px' }}>
            <div className="stat-number">{profile.rejectedDocuments || 0}</div>
            <div className="stat-label">Rechazados</div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="documents-section">
        <h3 className="documents-section-title">📄 Documentos</h3>
        {uploadedDocs.length === 0 ? (
          <div className="documents-empty">
            <div className="documents-empty-icon">📭</div>
            <p className="documents-empty-text">El estudiante aún no ha cargado documentos</p>
          </div>
        ) : (
          <>
            <div className="documents-table-wrapper">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Obligatorio</th>
                    <th>Estado</th>
                    <th>Notas</th>
                    <th>Última actualización</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedDocs.map((doc) => (
                    <tr key={doc.studentDocumentId || doc.documentName}>
                      <td><strong className="document-name">{doc.documentName}</strong></td>
                      <td>
                        <span className={`mandatory-badge ${doc.mandatory ? "yes" : "no"}`}>
                          {doc.mandatory ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>
                        <span className={`doc-status-badge ${getStatusBadgeClass(doc.status)}`}>
                          {getStatusLabel(doc.status)}
                        </span>
                      </td>
                      <td>
                        <span className={`doc-notes ${!doc.notes ? "empty" : ""}`}>
                          {doc.notes || "Sin comentarios"}
                        </span>
                      </td>
                      <td>
                        <span className="doc-date">
                          {doc.lastUpdate
                            ? new Date(doc.lastUpdate).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
                            : "-"}
                        </span>
                      </td>
                      <td>
                        <div className="doc-actions">
                          <button
                            onClick={() => handleViewDocument(doc.studentDocumentId)}
                            disabled={loadingDoc === doc.studentDocumentId}
                            className={`doc-btn doc-btn-view ${loadingDoc === doc.studentDocumentId ? "loading" : ""}`}
                          >
                            {loadingDoc === doc.studentDocumentId ? "Cargando..." : "Ver documento"}
                          </button>
                          {canEditDocument(doc) ? (
                            <button
                              onClick={() => {
                                if (reviewingDocId === doc.studentDocumentId) {
                                  setReviewingDocId(null); setSelectedStatus(""); setNotes("");
                                } else {
                                  setReviewingDocId(doc.studentDocumentId); setSelectedStatus(""); setNotes("");
                                }
                              }}
                              className={`doc-btn ${reviewingDocId === doc.studentDocumentId ? "doc-btn-cancel" : "doc-btn-review"}`}
                            >
                              {reviewingDocId === doc.studentDocumentId ? "Cancelar" : "Cambiar estado"}
                            </button>
                          ) : (
                            <span className="locked-badge">🔒 Aprobado</span>
                          )}
                        </div>
                        {reviewingDocId === doc.studentDocumentId && canEditDocument(doc) && (
                          <div className="review-panel">
                            <h4 className="review-panel-title">Revisión de documento</h4>
                            <div className="review-form-group">
                              <label className="review-label">Nuevo estado:</label>
                              <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="review-select"
                              >
                                <option value="">Seleccionar estado</option>
                                <option value="ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW">✅ Aceptado</option>
                                <option value="REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW">❌ Rechazado</option>
                                <option value="CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE">🔄 Requiere correcciones</option>
                              </select>
                            </div>
                            <div className="review-form-group">
                              <label className="review-label">Comentario:</label>
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="review-textarea"
                                placeholder="Escribe aquí el motivo de tu decisión..."
                                rows={4}
                              />
                            </div>
                            <button
                              onClick={() => handleReviewDocument(doc.studentDocumentId)}
                              disabled={submitting}
                              className="review-submit-btn"
                            >
                              {submitting ? "Guardando..." : "Guardar revisión"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón aprobar — solo para modalidades que NO son de decisión final */}
            {!isFinalDecision && (
              <div className="approve-all-section">
                <div className="approve-all-content">
                  <button
                    onClick={handleApproveModality}
                    disabled={!allMandatoryAccepted || submitting || uploadedMandatory.length < mandatoryDocs.length}
                    className={`approve-all-btn ${allMandatoryAccepted && uploadedMandatory.length === mandatoryDocs.length ? "enabled" : "disabled"}`}
                  >
                    {submitting ? "Procesando..." : "Aprobar Modalidad Para Inicio"}
                  </button>
                  {uploadedMandatory.length < mandatoryDocs.length && (
                    <div className="approve-warning">
                      ⚠️ El estudiante debe cargar todos los documentos obligatorios ({uploadedMandatory.length}/{mandatoryDocs.length})
                    </div>
                  )}
                  {uploadedMandatory.length === mandatoryDocs.length && !allMandatoryAccepted && (
                    <div className="approve-warning">
                      ⚠️ Debes aceptar todos los documentos obligatorios antes de aprobar la modalidad
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Committee Actions */}
      <div className="council-actions-section">
        <h3 className="section-title">Acciones del Comité de Currículo</h3>
        <div className="council-actions-grid">

          {/* ✅ Decisión Final — SOLO para Posgrado, Seminario de Grado, Producción Académica */}
          {isFinalDecision && !isModalityClosed && (
            <button
              onClick={() => setShowFinalDecisionModal(true)}
              className="council-action-btn"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
            >
              <span className="action-icon">⚖️</span>
              <span className="action-text">Decisión Final del Comité</span>
            </button>
          )}

          {/* Asignar Director — solo si NO tiene director y NO es de decisión final */}
          {!profile.projectDirectorName && !isFinalDecision && (
            <button
              onClick={() => setShowAssignDirectorModal(true)}
              className="council-action-btn assign-director"
            >
              <span className="action-icon">👨‍🏫</span>
              <span className="action-text">Asignar Director</span>
            </button>
          )}

          {/* Cambiar Director — solo si NO es de decisión final */}
          {profile.projectDirectorName && !isModalityClosed && !isFinalDecision && (
            <button
              onClick={() => setShowChangeDirectorModal(true)}
              className="council-action-btn change-director"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
            >
              <span className="action-icon">🔄</span>
              <span className="action-text">Cambiar Director</span>
            </button>
          )}

          {/* Asignar Jueces — solo si DEFENSE_SCHEDULED y NO es de decisión final */}
          {profile.currentStatus === "DEFENSE_SCHEDULED" && !isFinalDecision && (
            <button
              onClick={() => setShowAssignExaminersModal(true)}
              className="council-action-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" }}
            >
              <span className="action-icon">👨‍⚖️</span>
              <span className="action-text">Asignar Jueces de Sustentación</span>
            </button>
          )}

          {/* Cerrar Modalidad — siempre disponible */}
          {!isModalityClosed && (
            <button
              onClick={() => setShowCloseModalityModal(true)}
              className="council-action-btn close-modality"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
            >
              <span className="action-icon">🔒</span>
              <span className="action-text">Cerrar Modalidad</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert-message error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} className="alert-close">✕</button>
        </div>
      )}
      {successMessage && (
        <div className="alert-message success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="alert-close">✕</button>
        </div>
      )}

      {/* Back */}
      <div className="back-button-section">
        <button onClick={() => navigate("/comite")} className="back-btn">← Volver al listado</button>
      </div>

      {/* ======= MODALES ======= */}
      {showAssignDirectorModal && (
        <AssignDirectorModal
          studentModalityId={studentModalityId}
          onClose={() => setShowAssignDirectorModal(false)}
          onSuccess={() => { setShowAssignDirectorModal(false); handleModalSuccess("✅ Director asignado correctamente"); }}
        />
      )}

      {showChangeDirectorModal && (
        <ChangeDirectorModal
          studentModalityId={studentModalityId}
          currentDirectorName={profile.projectDirectorName}
          onClose={() => setShowChangeDirectorModal(false)}
          onSuccess={(message) => { setShowChangeDirectorModal(false); handleModalSuccess(message); }}
        />
      )}

      {showAssignExaminersModal && (
        <AssignExaminersModal
          studentModalityId={studentModalityId}
          onClose={() => setShowAssignExaminersModal(false)}
          onSuccess={() => { setShowAssignExaminersModal(false); handleModalSuccess("✅ Jueces asignados correctamente"); }}
        />
      )}

      {showModalityDetailsModal && modalityDetails && (
        <ModalityDetailsModal
          modalityDetails={modalityDetails}
          onClose={() => setShowModalityDetailsModal(false)}
        />
      )}

      {/* Modal: Cerrar Modalidad */}
      {showCloseModalityModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowCloseModalityModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔒 Cerrar Modalidad</h2>
              <button onClick={() => setShowCloseModalityModal(false)} className="modal-close" disabled={submitting}>✕</button>
            </div>
            <form onSubmit={handleCloseModality} className="modal-form">
              <div className="form-group">
                <label>Estudiante</label>
                <input type="text" value={profile.studentName} className="input" disabled />
              </div>
              <div className="form-group">
                <label>Motivo del Cierre *</label>
                <textarea
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  className="textarea"
                  placeholder="Explica por qué se cierra esta modalidad..."
                  required
                  rows="5"
                />
                <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                  El estudiante será notificado por correo electrónico
                </small>
              </div>
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", padding: "1rem", borderRadius: "6px", marginTop: "1rem" }}>
                <p style={{ margin: 0, color: "#92400e", fontSize: "0.875rem" }}>
                  <strong>⚠️ Advertencia:</strong> Esta acción cerrará permanentemente la modalidad del estudiante.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCloseModalityModal(false)} className="btn-cancel" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-reject" disabled={submitting} style={{ background: "#dc2626" }}>
                  {submitting ? "Cerrando..." : "Cerrar Modalidad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Modal: Decisión Final — Posgrado, Seminario de Grado, Producción Académica de Alto Nivel */}
      {showFinalDecisionModal && (
        <FinalDecisionModal
          studentModalityId={studentModalityId}
          modalityName={profile.modalityName}
          studentName={`${profile.studentName} ${profile.studentLastName}`}
          onClose={() => setShowFinalDecisionModal(false)}
          onSuccess={(message) => {
            setShowFinalDecisionModal(false);
            handleModalSuccess(message);
          }}
        />
      )}
    </div>
  );
}