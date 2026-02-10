import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDirectorStudentDetail,
  proposeDefenseByDirector,
  approveModalityCancellationByDirector,
  rejectModalityCancellationByDirector,
  canProposeDefense,
  hasCancellationRequest,
  formatDate,
  getErrorMessage,
  getStatusLabel,
  getStatusBadgeClass,
} from "../../services/directorService";
import "../../styles/admin/Roles.css";
import "../../styles/council/modals.css";

export default function DirectorStudentProfile() {
  const { studentModalityId } = useParams();
  const navigate = useNavigate();
 
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
 
  // Modals
  const [showDefenseModal, setShowDefenseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
 
  // Form data
  const [defenseData, setDefenseData] = useState({
    defenseDate: "",
    defenseLocation: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchStudentDetail();
  }, [studentModalityId]);

  const fetchStudentDetail = async () => {
    try {
      const data = await getDirectorStudentDetail(studentModalityId);
      console.log("Student detail:", data);
      setStudent(data);
    } catch (err) {
      console.error("Error fetching student detail:", err);
      setMessage("Error al cargar detalle: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProposeDefense = async (e) => {
    e.preventDefault();

    if (!defenseData.defenseDate) {
      setError("Debes seleccionar una fecha");
      return;
    }

    if (!defenseData.defenseLocation.trim()) {
      setError("Debes ingresar el lugar de la sustentación");
      return;
    }

    setSubmitting(true);
    setError("");
   
    try {
      const response = await proposeDefenseByDirector(studentModalityId, defenseData);

      // Formatear fecha para mostrar
      const formattedDate = new Date(defenseData.defenseDate).toLocaleString("es-CO", {
        dateStyle: "full",
        timeStyle: "short",
      });

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `✅ Propuesta de sustentación enviada correctamente para el ${formattedDate} en ${defenseData.defenseLocation}`
      );

      // Esperar segundos antes de cerrar
      setTimeout(() => {
        setShowDefenseModal(false);
        setSuccessMessage("");
        setDefenseData({ defenseDate: "", defenseLocation: "" });
        fetchStudentDetail();
        setMessage(response.message || "Propuesta de sustentación enviada exitosamente");
        setTimeout(() => setMessage(""), 10000);
      }, 10000);
    } catch (err) {
      console.error("Error proposing defense:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveCancellation = async () => {
    if (!window.confirm("¿Estás seguro de aprobar esta solicitud de cancelación?")) {
      return;
    }

    try {
      const response = await approveModalityCancellationByDirector(studentModalityId);
      setMessage(response.message || "Cancelación aprobada. Será enviada al comité.");
      fetchStudentDetail();
     
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Error approving cancellation:", err);
      setMessage("Error al aprobar cancelación: " + getErrorMessage(err));
    }
  };

  const handleRejectCancellation = async (e) => {
    e.preventDefault();

    if (!rejectReason.trim()) {
      setMessage("Debe proporcionar un motivo para rechazar la cancelación");
      return;
    }

    try {
      const response = await rejectModalityCancellationByDirector(studentModalityId, rejectReason);
      setMessage(response.message || "Cancelación rechazada. El estudiante continuará con la modalidad.");
      setShowRejectModal(false);
      setRejectReason("");
      fetchStudentDetail();
     
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Error rejecting cancellation:", err);
      setMessage("Error al rechazar cancelación: " + getErrorMessage(err));
    }
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return <div className="admin-loading">Cargando perfil del estudiante...</div>;
  }

  if (!student) {
    return (
      <div className="admin-page">
        <div className="admin-message error">
          No se pudo cargar la información del estudiante
        </div>
        <button onClick={() => navigate('/project-director')} className="admin-btn-secondary">
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <button
            onClick={() => navigate('/project-director')}
            className="admin-btn-secondary"
            style={{ marginBottom: "1rem" }}
          >
            ← Volver al Dashboard
          </button>
          <h1 className="admin-page-title">Perfil del Estudiante</h1>
          <p className="admin-page-subtitle">{student.studentName}</p>
        </div>
       
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {canProposeDefense(student.currentStatus) && (
            <button
              onClick={() => setShowDefenseModal(true)}
              className="admin-btn-primary"
            >
              📅 Proponer Sustentación
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
          <button onClick={() => setMessage("")} style={{ marginLeft: "1rem" }}>✕</button>
        </div>
      )}

      {/* Alerta de Cancelación */}
      {hasCancellationRequest(student.currentStatus) && (
        <div style={{
          background: "#fef3c7",
          border: "2px solid #f59e0b",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#92400e" }}>
            ⚠️ Solicitud de Cancelación Pendiente
          </h3>
          <p style={{ margin: "0 0 1rem 0", color: "#78350f" }}>
            El estudiante ha solicitado cancelar esta modalidad. Como director de proyecto,
            debes revisar y decidir si apruebas o rechazas esta solicitud.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={handleApproveCancellation}
              className="admin-btn-primary"
              style={{ background: "#059669" }}
            >
              ✓ Aprobar Cancelación
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="admin-btn-delete"
            >
              ✕ Rechazar Cancelación
            </button>
          </div>
        </div>
      )}

      {/* Información del Estudiante */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div className="admin-card-header">
          <h2>👤 Información del Estudiante</h2>
        </div>
        <div className="admin-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Nombre Completo
              </strong>
              <span>{student.studentName}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Email
              </strong>
              <span>{student.studentEmail}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Estado Actual
              </strong>
              <span className={`admin-status-badge ${getStatusBadgeClass(student.currentStatus)}`}>
                {getStatusLabel(student.currentStatus)}
              </span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Última Actualización
              </strong>
              <span>{formatDate(student.lastUpdatedAt)}</span>
            </div>
          </div>
         
          {student.currentStatusDescription && (
            <div style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e5e7eb"
            }}>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.5rem" }}>
                Descripción del Estado
              </strong>
              <p style={{ margin: 0, lineHeight: 1.6, color: "#4b5563" }}>
                {student.currentStatusDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información de la Modalidad */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div className="admin-card-header">
          <h2>📚 Información de la Modalidad</h2>
        </div>
        <div className="admin-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Modalidad de Grado
              </strong>
              <span>{student.modalityName}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Programa Académico
              </strong>
              <span>{student.academicProgramName}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                Facultad
              </strong>
              <span>{student.facultyName}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "#6b7280", marginBottom: "0.25rem" }}>
                ID de Modalidad
              </strong>
              <span>#{student.studentModalityId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documentos */}
      {student.documents && student.documents.length > 0 && (
        <div className="admin-card" style={{ marginBottom: "2rem" }}>
          <div className="admin-card-header">
            <h2>📄 Documentos</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {student.documents.map((doc, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    background: doc.uploaded ? "#f0fdf4" : "#f9fafb",
                    border: `1px solid ${doc.uploaded ? "#86efac" : "#e5e7eb"}`,
                    borderRadius: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                        {doc.documentName}
                        {doc.mandatory && (
                          <span style={{ color: "#dc2626", marginLeft: "0.5rem" }}>*</span>
                        )}
                      </strong>
                      <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {doc.statusDescription}
                      </span>
                    </div>
                    <span
                      className={`admin-status-badge ${doc.uploaded ? 'success' : 'inactive'}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {doc.uploaded ? "✓ Subido" : "Sin subir"}
                    </span>
                  </div>
                 
                  {doc.notes && (
                    <p style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.875rem",
                      fontStyle: "italic",
                      color: "#4b5563"
                    }}>
                      <strong>Notas:</strong> {doc.notes}
                    </p>
                  )}
                 
                  {doc.lastUpdate && (
                    <p style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.75rem",
                      color: "#9ca3af"
                    }}>
                      Última actualización: {formatDate(doc.lastUpdate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historial de Cambios */}
      {student.history && student.history.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>📋 Historial de Estados</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {student.history.map((history, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    background: "#f9fafb",
                    borderLeft: "3px solid #3b82f6",
                    borderRadius: "4px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <strong className={`admin-status-badge ${getStatusBadgeClass(history.status)}`}>
                      {getStatusLabel(history.status)}
                    </strong>
                    <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {formatDate(history.changeDate)}
                    </span>
                  </div>
                 
                  {history.description && (
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#4b5563" }}>
                      {history.description}
                    </p>
                  )}
                 
                  {history.observations && (
                    <p style={{
                      margin: "0.5rem 0 0 0",
                      padding: "0.5rem",
                      background: "white",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontStyle: "italic",
                      color: "#6b7280"
                    }}>
                      <strong>Observaciones:</strong> {history.observations}
                    </p>
                  )}
                 
                  {history.responsible && (
                    <p style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.75rem",
                      color: "#9ca3af"
                    }}>
                      Responsable: {history.responsible}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Proponer Sustentación - CON DISEÑO DE MODALS.CSS */}
      {showDefenseModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowDefenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Proponer Fecha de Sustentación</h3>
              <button 
                onClick={() => setShowDefenseModal(false)} 
                className="modal-close"
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {successMessage ? (
                <div className="modal-success-animation">
                  <div className="success-icon">✅</div>
                  <div className="success-message">{successMessage}</div>
                  <div className="success-submessage">
                    El comité revisará tu propuesta...
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProposeDefense}>
                  {error && <div className="error-message">{error}</div>}

                  <div className="form-group">
                    <label>Fecha y Hora de Sustentación *</label>
                    <input
                      type="datetime-local"
                      value={defenseData.defenseDate}
                      onChange={(e) => {
                        setDefenseData({ ...defenseData, defenseDate: e.target.value });
                        setError("");
                      }}
                      min={today}
                      className="form-input"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Lugar de Sustentación *</label>
                    <input
                      type="text"
                      value={defenseData.defenseLocation}
                      onChange={(e) => {
                        setDefenseData({ ...defenseData, defenseLocation: e.target.value });
                        setError("");
                      }}
                      placeholder="Ej: Auditorio Principal, Sala 302, etc."
                      className="form-input"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="info-box">
                    <p>
                      ℹ️ Esta propuesta será enviada al Comité de Currículo del Programa
                      para su revisión y aprobación.
                    </p>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowDefenseModal(false)}
                      className="btn-cancel"
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? "Enviando..." : "Enviar Propuesta"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar Cancelación */}
      {showRejectModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>✕ Rechazar Solicitud de Cancelación</h2>
              <button onClick={() => setShowRejectModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectCancellation} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Motivo del Rechazo *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="admin-textarea"
                  placeholder="Explica por qué se rechaza la solicitud de cancelación..."
                  rows="5"
                  required
                />
                <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                  El estudiante recibirá este mensaje y la modalidad continuará su proceso normal
                </small>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowRejectModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-delete">
                  Rechazar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}