import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentModalityProfile,
  reviewDocumentCommittee,
  approveCommittee,
  getDocumentBlobUrl,
  getModalityDetails,
} from "../../services/committeeService";
import AssignDirectorModal from "../../components/committee/AssignDirectorModal";
import AssignExaminersModal from "../../components/committee/AssignExaminerModal";
import ModalityDetailsModal from "../../components/committee/ModalityDetailsModal";
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
  const [showAssignDirectorModal, setShowAssignDirectorModal] = useState(false);
  const [showAssignExaminersModal, setShowAssignExaminersModal] = useState(false);
  const [showModalityDetailsModal, setShowModalityDetailsModal] = useState(false);
  const [modalityDetails, setModalityDetails] = useState(null);

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
      setError(
        err.response?.data?.message ||
          "No se pudo cargar la información del estudiante"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (studentDocumentId) => {
    console.log("📄 Intentando ver documento:", studentDocumentId);
    setLoadingDoc(studentDocumentId);

    try {
      const blobUrl = await getDocumentBlobUrl(studentDocumentId);
      console.log("✅ Abriendo documento en nueva pestaña");
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.error("❌ Error al cargar documento:", err);
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
      await reviewDocumentCommittee(studentDocumentId, {
        status: selectedStatus,
        notes: notes.trim(),
      });

      setSuccessMessage("✅ Documento revisado exitosamente");
      setTimeout(() => setSuccessMessage(""), 5000);

      await fetchProfile();

      setReviewingDocId(null);
      setSelectedStatus("");
      setNotes("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al revisar el documento");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveModality = async () => {
    const mandatoryDocs = profile.documents.filter(d => d.documentType === "MANDATORY");
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

    if (
      !window.confirm(
        "¿Estás seguro de aprobar esta modalidad? Esta acción es definitiva."
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await approveCommittee(studentModalityId);
      setSuccessMessage("✅ Modalidad aprobada exitosamente");
      setTimeout(() => {
        navigate("/comite");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al aprobar la modalidad");
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
      console.error(err);
      setError("Error al cargar detalles de la modalidad");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleModalSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
    fetchProfile();
  };

  // Helper para determinar si un documento puede ser editado
  const canEditDocument = (doc) => {
    return doc.status !== "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW";
  };

  // Helper para obtener clase de badge
  const getStatusBadgeClass = (status) => {
    if (status === "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW") return "accepted";
    if (status === "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW") return "rejected";
    if (status === "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE") return "corrections";
    if (status === "ACCEPTED_FOR_PROGRAM_HEAD_REVIEW") return "accepted";
    if (status === "REJECTED_FOR_PROGRAM_HEAD_REVIEW") return "rejected";
    if (status === "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD") return "corrections";
    return "pending";
  };

  // Helper para obtener etiqueta legible del estado
  const getStatusLabel = (status) => {
    const statusLabels = {
      "PENDING": "Pendiente",
      "ACCEPTED_FOR_PROGRAM_HEAD_REVIEW": "Aceptado por Jefe de Programa",
      "REJECTED_FOR_PROGRAM_HEAD_REVIEW": "Rechazado por Jefe de Programa",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD": "Correcciones solicitadas por Jefe",
      "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW": "Aceptado por Comité",
      "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW": "Rechazado por Comité",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE": "Correcciones solicitadas por Comité",
      "CORRECTION_RESUBMITTED": "Corrección reenviada",
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <div className="student-profile-loading">
        Cargando perfil del estudiante...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="student-profile-error">
        <p>{error}</p>
        <button onClick={() => navigate("/comite")} className="back-btn">
          ← Volver al listado
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="student-profile-no-data">
        No hay información disponible
      </div>
    );
  }

  const mandatoryDocs = profile.documents.filter(d => d.documentType === "MANDATORY");
  const uploadedDocs = profile.documents.filter((d) => d.uploaded);
  const uploadedMandatory = mandatoryDocs.filter(d => d.uploaded);
  const allMandatoryAccepted = uploadedMandatory.every(
    (d) => d.status === "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW"
  );

  return (
    <div className="student-profile-container">
      {/* Header */}
      <div className="student-profile-header">
        <h2 className="student-profile-title">
          Perfil del Estudiante - Comité de Currículo
        </h2>
        <p className="student-profile-subtitle">
          Revisa documentos y gestiona la modalidad de grado
        </p>
      </div>

      {/* Student Info Card - EXPANDIDA */}
      <div className="student-info-card">
        <h3 className="card-section-title">👤 Información del Estudiante</h3>
        <div className="student-info-grid">
          <div className="student-info-item">
            <span className="student-info-label">Nombre Completo</span>
            <span className="student-info-value">
              {profile.studentName} {profile.studentLastName}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Email</span>
            <span className="student-info-value email">
              {profile.studentEmail}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Código Estudiantil</span>
            <span className="student-info-value">
              {profile.studentCode || "N/A"}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Programa Académico</span>
            <span className="student-info-value">
              {profile.academicProgramName}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Facultad</span>
            <span className="student-info-value">
              {profile.facultyName}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Créditos Aprobados</span>
            <span className="student-info-value">
              {profile.approvedCredits || "N/A"}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Promedio (GPA)</span>
            <span className="student-info-value">
              {profile.gpa || "N/A"}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Semestre</span>
            <span className="student-info-value">
              {profile.semester || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Modality Info Card */}
      <div className="student-info-card">
        <h3 className="card-section-title">📚 Información de la Modalidad</h3>
        <div className="student-info-grid">
          <div className="student-info-item">
            <span className="student-info-label">Modalidad</span>
            <span className="student-info-value">{profile.modalityName}</span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Estado Actual</span>
            <span className="student-info-value status">
              {profile.currentStatusDescription}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Última Actualización</span>
            <span className="student-info-value">
              {profile.lastUpdatedAt 
                ? new Date(profile.lastUpdatedAt).toLocaleString("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "N/A"}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Créditos Requeridos</span>
            <span className="student-info-value">
              {profile.creditsRequired || "N/A"}
            </span>
          </div>

          {profile.projectDirectorName && (
            <>
              <div className="student-info-item">
                <span className="student-info-label">Director de Proyecto</span>
                <span className="student-info-value">
                  {profile.projectDirectorName}
                </span>
              </div>

              <div className="student-info-item">
                <span className="student-info-label">Email del Director</span>
                <span className="student-info-value email">
                  {profile.projectDirectorEmail}
                </span>
              </div>
            </>
          )}

          {profile.defenseDate && (
            <>
              <div className="student-info-item">
                <span className="student-info-label">Fecha de Sustentación</span>
                <span className="student-info-value">
                  {new Date(profile.defenseDate).toLocaleString("es-CO", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="student-info-item">
                <span className="student-info-label">Lugar de Sustentación</span>
                <span className="student-info-value">
                  {profile.defenseLocation || "N/A"}
                </span>
              </div>
            </>
          )}

          {profile.academicDistinction && (
            <div className="student-info-item">
              <span className="student-info-label">Resultado</span>
              <span className="student-info-value distinction">
                {profile.academicDistinction}
              </span>
            </div>
          )}
        </div>

        {profile.modalityId && (
          <div className="modality-details-btn-container">
            <button
              onClick={handleViewModalityDetails}
              className="btn-view-modality-details"
            >
              📋 Ver Detalles Completos de la Modalidad
            </button>
          </div>
        )}
      </div>

      {/* Documents Statistics */}
      <div className="documents-stats-card">
        <h3 className="card-section-title">📊 Estadísticas de Documentos</h3>
        <div className="stats-grid">
          <div className="stat-item total">
            <div className="stat-number">{profile.totalDocuments || 0}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item approved">
            <div className="stat-number">{profile.approvedDocuments || 0}</div>
            <div className="stat-label">Aprobados</div>
          </div>
          <div className="stat-item pending">
            <div className="stat-number">{profile.pendingDocuments || 0}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-item rejected">
            <div className="stat-number">{profile.rejectedDocuments || 0}</div>
            <div className="stat-label">Rechazados</div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="documents-section">
        <h3 className="documents-section-title">📄 Documentos</h3>

        {uploadedDocs.length === 0 ? (
          <div className="documents-empty">
            <div className="documents-empty-icon">📭</div>
            <p className="documents-empty-text">
              El estudiante aún no ha cargado documentos
            </p>
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
                      <td>
                        <strong>{doc.documentName}</strong>
                      </td>
                      <td>
                        <span className={`mandatory-badge ${doc.documentType === "MANDATORY" ? "yes" : "no"}`}>
                          {doc.documentType === "MANDATORY" ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`doc-status-badge ${getStatusBadgeClass(
                            doc.status
                          )}`}
                        >
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
                            ? new Date(doc.lastUpdate).toLocaleString("es-CO", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </span>
                      </td>
                      <td>
                        <div className="doc-actions">
                          <button
                            onClick={() =>
                              handleViewDocument(doc.studentDocumentId)
                            }
                            disabled={loadingDoc === doc.studentDocumentId}
                            className={`doc-btn doc-btn-view ${
                              loadingDoc === doc.studentDocumentId
                                ? "loading"
                                : ""
                            }`}
                          >
                            {loadingDoc === doc.studentDocumentId
                              ? "Cargando..."
                              : "Ver documento"}
                          </button>

                          {canEditDocument(doc) ? (
                            <button
                              onClick={() => {
                                if (reviewingDocId === doc.studentDocumentId) {
                                  setReviewingDocId(null);
                                  setSelectedStatus("");
                                  setNotes("");
                                } else {
                                  setReviewingDocId(doc.studentDocumentId);
                                  setSelectedStatus("");
                                  setNotes("");
                                }
                              }}
                              className={`doc-btn ${
                                reviewingDocId === doc.studentDocumentId
                                  ? "doc-btn-cancel"
                                  : "doc-btn-review"
                              }`}
                            >
                              {reviewingDocId === doc.studentDocumentId
                                ? "Cancelar"
                                : "Cambiar estado"}
                            </button>
                          ) : (
                            <span className="locked-badge">
                              🔒 Aprobado
                            </span>
                          )}
                        </div>

                        {reviewingDocId === doc.studentDocumentId && canEditDocument(doc) && (
                          <div className="review-panel">
                            <h4 className="review-panel-title">
                              Revisión de documento
                            </h4>

                            <div className="review-form-group">
                              <label className="review-label">
                                Nuevo estado:
                              </label>
                              <select
                                value={selectedStatus}
                                onChange={(e) =>
                                  setSelectedStatus(e.target.value)
                                }
                                className="review-select"
                              >
                                <option value="">Seleccionar estado</option>
                                <option value="ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW">
                                  ✅ Aceptado
                                </option>
                                <option value="REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW">
                                  ❌ Rechazado
                                </option>
                                <option value="CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE">
                                  🔄 Requiere correcciones
                                </option>
                              </select>
                            </div>

                            <div className="review-form-group">
                              <label className="review-label">
                                Comentario:
                              </label>
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="review-textarea"
                                placeholder="Escribe aquí el motivo de tu decisión..."
                                rows={4}
                              />
                            </div>

                            <button
                              onClick={() =>
                                handleReviewDocument(doc.studentDocumentId)
                              }
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

            <div className="approve-all-section">
              <div className="approve-all-content">
                <button
                  onClick={handleApproveModality}
                  disabled={!allMandatoryAccepted || submitting || uploadedMandatory.length < mandatoryDocs.length}
                  className={`approve-all-btn ${
                    allMandatoryAccepted && uploadedMandatory.length === mandatoryDocs.length ? "enabled" : "disabled"
                  }`}
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
          </>
        )}
      </div>

      {/* Committee Actions Section */}
      <div className="council-actions-section">
        <h3 className="section-title">🎯 Acciones del Comité de Currículo</h3>
        <div className="council-actions-grid">
          {/* Asignar Director - Solo si NO tiene director */}
          {!profile.projectDirectorName && (
            <button
              onClick={() => setShowAssignDirectorModal(true)}
              className="council-action-btn assign-director"
            >
              <span className="action-icon">👨‍🏫</span>
              <span className="action-text">Asignar Director</span>
            </button>
          )}

          {/* Asignar Jueces - Solo si estado = DEFENSE_SCHEDULED */}
          {profile.currentStatus === "DEFENSE_SCHEDULED" && (
            <button
              onClick={() => setShowAssignExaminersModal(true)}
              className="council-action-btn assign-director"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
              }}
            >
              <span className="action-icon">👨‍⚖️</span>
              <span className="action-text">Asignar Jueces de Sustentación</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages - DESPUÉS de las acciones del comité */}
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

      {/* Back Button */}
      <div className="back-button-section">
        <button onClick={() => navigate("/comite")} className="back-btn">
          ← Volver al listado
        </button>
      </div>

      {/* MODALES */}
      {showAssignDirectorModal && (
        <AssignDirectorModal
          studentModalityId={studentModalityId}
          onClose={() => setShowAssignDirectorModal(false)}
          onSuccess={() => {
            setShowAssignDirectorModal(false);
            handleModalSuccess("✅ Director asignado correctamente");
          }}
        />
      )}

      {showAssignExaminersModal && (
        <AssignExaminersModal
          studentModalityId={studentModalityId}
          onClose={() => setShowAssignExaminersModal(false)}
          onSuccess={() => {
            setShowAssignExaminersModal(false);
            handleModalSuccess("✅ Jueces asignados correctamente");
          }}
        />
      )}

      {showModalityDetailsModal && modalityDetails && (
        <ModalityDetailsModal
          modalityDetails={modalityDetails}
          onClose={() => setShowModalityDetailsModal(false)}
        />
      )}
    </div>
  );
}