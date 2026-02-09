import { useEffect, useState } from "react";
import {
  getCurrentModalityStatus,
  getMyDocuments,
  uploadStudentDocument,
  getStudentDocumentBlob
} from "../../services/studentService";
import "../../styles/student/status.css";

export default function ModalityStatus() {
  const [data, setData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, docsRes] = await Promise.all([
        getCurrentModalityStatus(),
        getMyDocuments(),
      ]);
     
      console.log("✅ Estado:", statusRes);
      console.log("✅ Documentos:", docsRes);
     
      setData(statusRes);
      setDocuments(docsRes);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
      setError(
        err.response?.data?.message ||
          "No tienes una modalidad activa en este momento"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (requiredDocumentId, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage("Solo se permiten archivos PDF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("El archivo no puede superar los 5MB");
      return;
    }

    setUploadingDocId(requiredDocumentId);
    setMessage("");

    try {
      console.log("📤 Subiendo documento:", {
        studentModalityId: data.studentModalityId,
        requiredDocumentId: requiredDocumentId,
        fileName: file.name
      });

      await uploadStudentDocument(data.studentModalityId, requiredDocumentId, file);
      setMessage("Documento subido exitosamente");
     
      const docsRes = await getMyDocuments();
      setDocuments(docsRes);
     
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("❌ Error al subir:", err);
      setMessage(err.response?.data || "Error al subir el documento");
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleViewDocument = async (studentDocumentId) => {
    console.log("📄 Intentando ver documento con ID:", studentDocumentId);
    setLoadingDocId(studentDocumentId);

    try {
      const blobUrl = await getStudentDocumentBlob(studentDocumentId);
      console.log("✅ Blob URL generada:", blobUrl);
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        console.log("🗑️ Liberando blob URL");
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.error("❌ Error completo al cargar documento:", err);
      setMessage(err.response?.data?.message || err.message || "Error al cargar el documento");
    } finally {
      setLoadingDocId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || "";
   
    if (statusLower.includes("accepted") || statusLower.includes("aceptado")) {
      return "accepted";
    }
    if (statusLower.includes("rejected") || statusLower.includes("rechazado")) {
      return "rejected";
    }
    if (statusLower.includes("corrections") || statusLower.includes("correcciones")) {
      return "corrections";
    }
    if (statusLower.includes("pending") || statusLower.includes("pendiente")) {
      return "pending";
    }
    return "pending";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      "PENDING": "Pendiente de revisión",
      "ACCEPTED_FOR_PROGRAM_HEAD_REVIEW": "Aceptado por Jefe de Programa",
      "REJECTED_FOR_PROGRAM_HEAD_REVIEW": "Rechazado por Jefe de Programa",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD": "Correcciones solicitadas - Jefe de Programa",
      "ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW": "Aceptado por comité de currículo de programa",
      "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW": "Rechazado por comité de currículo de programa",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE": "Correcciones solicitadas por comité de currículo de programa",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className="status-loading">Cargando estado de la modalidad...</div>;
  }

  if (error) {
    return (
      <div className="status-container">
        <div className="status-error-container">
          <div className="status-error-card">
            <div className="status-error-icon">📋</div>
            <h2 className="status-error-title">Estado de la modalidad</h2>
            <div className="status-error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-container">
      {/* Header */}
      <div className="status-header">
        <h2 className="status-title">Estado de la Modalidad</h2>
      </div>

      {/* Mensaje de feedback */}
      {message && (
        <div className={`status-message ${message.includes("Error") || message.includes("error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Información principal */}
      <div className="status-main-card">
        <div className="status-info-grid">
          <div className="status-info-item">
            <span className="status-label">Modalidad</span>
            <span className="status-value">{data.modalityName}</span>
          </div>

          <div className="status-info-item">
            <span className="status-label">Estado actual</span>
            <span className="status-current-badge">{data.currentStatus}</span>
          </div>

          {data.currentStatusDescription && (
            <div className="status-description">
              {data.currentStatusDescription}
            </div>
          )}

          <div className="status-info-item">
            <span className="status-label">Última actualización</span>
            <span className="status-date">
              {new Date(data.lastUpdatedAt).toLocaleString('es-CO', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </span>
          </div>
          {/* Información del Director de Proyecto */}
      {data.projectDirectorName && (
        <div className="status-section">
          <h3 className="status-section-title">Director de Proyecto</h3>
          <div className="status-info-card">
            <div className="status-info-grid">
              <div className="status-info-item">
                <span className="status-label">Nombre</span>
                <span className="status-value">{data.projectDirectorName}</span>
              </div>
              <div className="status-info-item">
                <span className="status-label">Email</span>
                <span className="status-value">{data.projectDirectorEmail}</span>
              </div>
            </div>
          </div>
        </div>
      )}
       {/* Información de Sustentación */}
      <div className="status-section">
        <h3 className="status-section-title">Información de Sustentación</h3>
        <div className="status-info-card">
          {data.defenseDate ? (
            <div className="status-info-grid">
              <div className="status-info-item">
                <span className="status-label">Fecha programada</span>
                <span className="status-value">
                  {new Date(data.defenseDate).toLocaleString('es-CO', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
              <div className="status-info-item">
                <span className="status-label">Lugar</span>
                <span className="status-value">{data.defenseLocation || "No especificado"}</span>
              </div>
              {data.defenseProposedByProjectDirector && (
                <div className="status-info-note">
                  ℹ️ {data.defenseProposedByProjectDirector}
                </div>
              )}
            </div>
          ) : (
            <div className="status-info-empty">
              <div className="status-info-empty-icon"></div>
              <p>Aún no se ha programado la fecha de sustentación</p>
              <small style={{ color: "#666", marginTop: "0.5rem" }}>
                Se te notificará cuando tu director o el comité programen la sustentación
              </small>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>


      {/* Estadísticas de Documentos */}
      <div className="status-section">
        <h3 className="status-section-title">📊 Resumen de Documentos</h3>
        <div className="status-documents-stats">
          <div className="status-stat-card">
            <div className="status-stat-number">{data.totalDocuments || 0}</div>
            <div className="status-stat-label">Total</div>
          </div>
          <div className="status-stat-card success">
            <div className="status-stat-number">{data.approvedDocuments || 0}</div>
            <div className="status-stat-label">Aprobados</div>
          </div>
          <div className="status-stat-card warning">
            <div className="status-stat-number">{data.pendingDocuments || 0}</div>
            <div className="status-stat-label">Pendientes</div>
          </div>
          <div className="status-stat-card error">
            <div className="status-stat-number">{data.rejectedDocuments || 0}</div>
            <div className="status-stat-label">Rechazados</div>
          </div>
        </div>
      </div>

      {/* Sección de Documentos */}
      <div className="status-documents-section">
        <h3 className="status-section-title">📄 Mis Documentos</h3>
       
        {documents.length === 0 ? (
          <div className="status-documents-empty">
            <div className="status-documents-empty-icon">📭</div>
            <p>No hay documentos cargados</p>
          </div>
        ) : (
          <div className="status-documents-grid">
            {documents.map((doc) => (
              <div key={doc.studentDocumentId} className="status-document-card">
                <div className="status-document-header">
                  <h4 className="status-document-name">{doc.documentName}</h4>
                  {doc.mandatory && (
                    <span className="status-document-mandatory-badge">Obligatorio</span>
                  )}
                </div>

                <div className="status-document-info">
                  <div className="status-document-info-item">
                    <span className="status-document-label">Estado:</span>
                    <span className={`status-document-badge ${getStatusBadgeClass(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </div>

                  {doc.uploadedAt && (
                    <div className="status-document-info-item">
                      <span className="status-document-label">Subido:</span>
                      <span className="status-document-date">
                        {new Date(doc.uploadedAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {doc.notes && (
                    <div className="status-document-notes">
                      <span className="status-document-label">Comentarios:</span>
                      <p className="status-document-notes-text">{doc.notes}</p>
                    </div>
                  )}
                </div>

                <div className="status-document-actions">
                  {doc.studentDocumentId && (
                    <button
                      onClick={() => handleViewDocument(doc.studentDocumentId)}
                      disabled={loadingDocId === doc.studentDocumentId}
                      className={`status-document-btn view ${loadingDocId === doc.studentDocumentId ? 'loading' : ''}`}
                    >
                      {loadingDocId === doc.studentDocumentId
                        ? "Cargando..."
                        : "Ver documento"}
                    </button>
                  )}

                  {(doc.status === "REJECTED_FOR_PROGRAM_HEAD_REVIEW" ||
                    doc.status === "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW" ||
                    doc.status === "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD" ||
                    doc.status === "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE") && (
                    <div className="status-document-upload">
                      <label className="status-document-upload-label">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const docId = doc.requiredDocumentId || doc.studentDocumentId;
                              handleFileUpload(docId, file);
                            }
                          }}
                          disabled={uploadingDocId === doc.studentDocumentId}
                          className="status-document-upload-input"
                        />
                        <span className="status-document-upload-btn">
                          {uploadingDocId === doc.studentDocumentId
                            ? "⏳ Subiendo..."
                            : "📤 Resubir documento"}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="status-history-section">
        <h3 className="status-history-title">Historial de Estados</h3>

        {data.history && data.history.length > 0 ? (
          <ul className="status-history-list">
            {data.history.map((h, index) => (
              <li key={index} className="status-history-item">
                <div className="status-history-card">
                  <div className="status-history-status">{h.status}</div>
                  <div className="status-history-description">{h.description}</div>

                  <div className="status-history-meta">
                    <div className="status-history-meta-item">
                      <span className="status-history-meta-label">Fecha:</span>
                      <span className="status-history-meta-value">
                        {new Date(h.changeDate).toLocaleString('es-CO', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="status-history-meta-item">
                      <span className="status-history-meta-label">Responsable:</span>
                      <span className="status-history-meta-value">{h.responsible}</span>
                    </div>
                  </div>

                  {h.observations && (
                    <div className="status-observations">
                      <span className="status-observations-label">Observaciones:</span>
                      <p className="status-observations-text">{h.observations}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="status-history-empty">
            <div className="status-history-empty-icon">📭</div>
            <p>No hay historial disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}