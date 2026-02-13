import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadStudentDocument,
  getMyAvailableDocuments,
  getStudentDocumentBlob,
} from "../../services/studentService";
import "../../styles/student/studentmodalitydocuments.css";

export default function StudentModalityDocuments({ studentModalityId }) {
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [sendingDocId, setSendingDocId] = useState(null);
  const [viewingDocId, setViewingDocId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const fetchDocumentsData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Obteniendo documentos disponibles...");
      
      const response = await getMyAvailableDocuments();
      
      console.log("✅ Respuesta completa:", response);

      // Verificar si hay documentos MANDATORY faltantes
      if (!response.success) {
        setMessage(response.message || "Error al cargar documentos");
        setMessageType("error");
        
        if (response.missingDocuments) {
          setMessage(
            `⚠️ ${response.message}\n\nDocumentos faltantes:\n- ${response.missingDocuments.join("\n- ")}`
          );
        }
        return;
      }

      setDocuments(response.documents || []);
      setStatistics(response.statistics || null);

    } catch (err) {
      console.error("❌ Error al cargar documentos:", err);
      setMessage(err.response?.data?.message || "Error al cargar documentos");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (requiredDocumentId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [requiredDocumentId]: file,
    }));
  };

  const handleViewDocument = async (studentDocumentId, documentName) => {
    console.log("📄 Intentando ver documento:", studentDocumentId);
    setViewingDocId(studentDocumentId);
    
    try {
      const blobUrl = await getStudentDocumentBlob(studentDocumentId);
      console.log("✅ Abriendo documento en nueva pestaña");
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.error("❌ Error al cargar documento:", err);
      setMessage(`Error al cargar el documento "${documentName}"`);
      setMessageType("error");
    } finally {
      setViewingDocId(null);
    }
  };

  const handleUpload = async (requiredDocumentId, documentName, documentType) => {
    const file = selectedFiles[requiredDocumentId];
    if (!file) return;

    try {
      setSendingDocId(requiredDocumentId);
      setMessage("");

      const res = await uploadStudentDocument(
        studentModalityId,
        requiredDocumentId,
        file
      );

      setMessage(res.message || "Documento enviado correctamente");
      setMessageType("success");

      // Limpiar el archivo seleccionado
      setSelectedFiles((prev) => ({
        ...prev,
        [requiredDocumentId]: null,
      }));

      // Recargar documentos
      await fetchDocumentsData();

      // Si era MANDATORY, verificar si todos están completos
      if (documentType === "MANDATORY") {
        const mandatoryDocs = documents.filter((doc) => doc.documentType === "MANDATORY");
        const allMandatoryUploaded = mandatoryDocs.every(
          (doc) => doc.uploaded || doc.requiredDocumentId === requiredDocumentId
        );

        if (allMandatoryUploaded && mandatoryDocs.length > 0) {
          setMessage(
            "🎉 ¡Excelente! Has subido todos los documentos obligatorios. Ahora puedes ver el estado de tu modalidad."
          );
          setMessageType("success-complete");
          setTimeout(() => {
            navigate("/student/status");
          }, 5000);
        }
      }
    } catch (err) {
      console.error("❌ Error al enviar documento:", err);
      setMessage(err.response?.data?.message || "Error al enviar el documento");
      setMessageType("error");
    } finally {
      setSendingDocId(null);
    }
  };

  const handleReupload = async (studentDocumentId, requiredDocumentId, documentName) => {
    const file = selectedFiles[requiredDocumentId];
    if (!file) return;

    try {
      setSendingDocId(requiredDocumentId);
      setMessage("");

      const res = await uploadStudentDocument(
        studentModalityId,
        requiredDocumentId,
        file
      );

      setMessage(`✅ ${documentName} actualizado correctamente`);
      setMessageType("success");

      setSelectedFiles((prev) => ({
        ...prev,
        [requiredDocumentId]: null,
      }));

      await fetchDocumentsData();
    } catch (err) {
      console.error("❌ Error al actualizar documento:", err);
      setMessage(err.response?.data?.message || "Error al actualizar el documento");
      setMessageType("error");
    } finally {
      setSendingDocId(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Pendiente de revisión",
      ACCEPTED_FOR_PROGRAM_HEAD_REVIEW: "Aceptado por Jefe de Programa",
      REJECTED_FOR_PROGRAM_HEAD_REVIEW: "Rechazado por Jefe de Programa",
      CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD: "Correcciones solicitadas",
      ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW: "Aceptado por Comité",
      REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW: "Rechazado por Comité",
      CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE: "Correcciones solicitadas por Comité",
      CORRECTION_RESUBMITTED: "Corrección reenviada",
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    if (status?.includes("ACCEPTED")) return "accepted";
    if (status?.includes("REJECTED")) return "rejected";
    if (status?.includes("CORRECTIONS")) return "corrections";
    return "pending";
  };

  const canReuploadDocument = (status) => {
    const reuploadableStatuses = [
      "REJECTED_FOR_PROGRAM_HEAD_REVIEW",
      "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE",
    ];
    return reuploadableStatuses.includes(status);
  };

  const getDocumentTypeBadge = (documentType) => {
    if (documentType === "MANDATORY") {
      return <span className="document-type-badge mandatory">Obligatorio</span>;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="documents-container">
        <div className="documents-loading">
          <div className="spinner"></div>
          <p>Cargando documentos disponibles...</p>
        </div>
      </div>
    );
  }

  // Separar documentos por tipo
  const mandatoryDocs = documents.filter((doc) => doc.documentType === "MANDATORY");
  const secondaryDocs = documents.filter((doc) => doc.documentType === "SECONDARY");

  // Calcular progreso solo de MANDATORY
  const uploadedMandatoryCount = mandatoryDocs.filter((doc) => doc.uploaded).length;
  const progressPercentage =
    mandatoryDocs.length > 0
      ? Math.round((uploadedMandatoryCount / mandatoryDocs.length) * 100)
      : 0;

  return (
    <div className="documents-container">
      {/* Header con estadísticas */}
      <div className="documents-header">
        <h3 className="documents-title">Mis Documentos</h3>
      

        {/* Barra de progreso solo para MANDATORY */}
        {mandatoryDocs.length > 0 && (
          <div className="documents-progress">
            <div className="documents-progress-info">
              <span className="documents-progress-text">
                📋 Documentos obligatorios: {uploadedMandatoryCount} de {mandatoryDocs.length}
              </span>
              <span className="documents-progress-percentage">{progressPercentage}%</span>
            </div>
            <div className="documents-progress-bar">
              <div
                className="documents-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="documents-body">
        {message && (
          <div className={`documents-message ${messageType}`}>
            {message}
            {messageType === "success-complete" && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                Serás redirigido automáticamente en 5 segundos...
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTOS MANDATORY */}
        {mandatoryDocs.length > 0 && (
          <div className="documents-section">
            <h4 className="documents-section-title">Documentos Obligatorios</h4>
            <p className="documents-section-subtitle">
              Estos documentos son requeridos para iniciar tu modalidad de grado.
            </p>
            <ul className="documents-list">
              {mandatoryDocs.map((doc) => (
                <DocumentCard
                  key={doc.requiredDocumentId}
                  doc={doc}
                  studentModalityId={studentModalityId}
                  selectedFiles={selectedFiles}
                  sendingDocId={sendingDocId}
                  viewingDocId={viewingDocId}
                  handleFileChange={handleFileChange}
                  handleUpload={handleUpload}
                  handleReupload={handleReupload}
                  handleViewDocument={handleViewDocument}
                  getStatusLabel={getStatusLabel}
                  getStatusClass={getStatusClass}
                  canReuploadDocument={canReuploadDocument}
                  getDocumentTypeBadge={getDocumentTypeBadge}
                />
              ))}
            </ul>
          </div>
        )}

        {/* DOCUMENTOS SECONDARY */}
        {secondaryDocs.length > 0 && (
          <div className="documents-section">
            <h4 className="documents-section-title">Documentos pendientes</h4>
            <p className="documents-section-subtitle">
              Estos documentos se suben durante el desarrollo de tu modalidad.
            </p>
            <ul className="documents-list">
              {secondaryDocs.map((doc) => (
                <DocumentCard
                  key={doc.requiredDocumentId}
                  doc={doc}
                  studentModalityId={studentModalityId}
                  selectedFiles={selectedFiles}
                  sendingDocId={sendingDocId}
                  viewingDocId={viewingDocId}
                  handleFileChange={handleFileChange}
                  handleUpload={handleUpload}
                  handleReupload={handleReupload}
                  handleViewDocument={handleViewDocument}
                  getStatusLabel={getStatusLabel}
                  getStatusClass={getStatusClass}
                  canReuploadDocument={canReuploadDocument}
                  getDocumentTypeBadge={getDocumentTypeBadge}
                />
              ))}
            </ul>
          </div>
        )}

        {documents.length === 0 && (
          <div className="documents-empty">
            <div className="documents-empty-icon">📄</div>
            <p className="documents-empty-text">
              No hay documentos disponibles para esta modalidad
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE REUTILIZABLE: DOCUMENT CARD
// ========================================

function DocumentCard({
  doc,
  studentModalityId,
  selectedFiles,
  sendingDocId,
  viewingDocId,
  handleFileChange,
  handleUpload,
  handleReupload,
  handleViewDocument,
  getStatusLabel,
  getStatusClass,
  canReuploadDocument,
  getDocumentTypeBadge,
}) {
  const isUploaded = doc.uploaded;

  return (
    <li className={`document-card ${isUploaded ? "uploaded" : ""}`}>
      <div className="document-card-header">
        <div>
          <h4 className="document-name">{doc.documentName}</h4>
          {getDocumentTypeBadge(doc.documentType)}
        </div>
        {isUploaded && <span className="document-uploaded-badge">✓ Subido</span>}
      </div>

      {doc.description && <p className="document-description">{doc.description}</p>}

      <div className="document-requirements">
        <div className="document-requirement">
          <span className="document-requirement-label">Formato:</span>
          <span className="document-requirement-value">{doc.allowedFormat}</span>
        </div>
        <div className="document-requirement">
          <span className="document-requirement-label">Tamaño máx:</span>
          <span className="document-requirement-value">{doc.maxFileSizeMB} MB</span>
        </div>
      </div>

      {isUploaded && (
        <div className="document-uploaded-info">
          <div className="uploaded-info-row">
            <span className="uploaded-info-label">📅 Fecha de carga:</span>
            <span className="uploaded-info-value">
              {new Date(doc.uploadDate).toLocaleString("es-CO", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

          <div className="uploaded-info-row">
            <span className="uploaded-info-label">📊 Estado:</span>
            <span className={`uploaded-status-badge ${getStatusClass(doc.status)}`}>
              {getStatusLabel(doc.status)}
            </span>
          </div>

          {doc.notes && (
            <div className="uploaded-info-row">
              <span className="uploaded-info-label">💬 Notas:</span>
              <span className="uploaded-info-value notes">{doc.notes}</span>
            </div>
          )}

          <button
            onClick={() => handleViewDocument(doc.studentDocumentId, doc.documentName)}
            disabled={viewingDocId === doc.studentDocumentId}
            className="document-view-button"
          >
            {viewingDocId === doc.studentDocumentId ? "Cargando..." : "👁 Ver documento subido"}
          </button>

          {canReuploadDocument(doc.status) ? (
            <div className="document-reupload-section">
              <div className="document-reupload-message">
                ⚠️ Este documento necesita correcciones. Puedes subir una nueva versión.
              </div>
              <div className="document-file-input-wrapper">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(doc.requiredDocumentId, e.target.files[0])}
                  className="document-file-input"
                />
              </div>
              <button
                onClick={() =>
                  handleReupload(doc.studentDocumentId, doc.requiredDocumentId, doc.documentName)
                }
                disabled={
                  !selectedFiles[doc.requiredDocumentId] ||
                  sendingDocId === doc.requiredDocumentId
                }
                className={`document-upload-button ${
                  sendingDocId === doc.requiredDocumentId ? "loading" : ""
                }`}
              >
                {sendingDocId === doc.requiredDocumentId
                  ? "Actualizando..."
                  : "🔄 Actualizar documento"}
              </button>
            </div>
          ) : (
            <div className="document-locked-message">
              🔒 Ya subiste este documento. Si necesitas modificarlo, contacta al Jefe de Programa.
            </div>
          )}
        </div>
      )}

      {!isUploaded && (
        <div className="document-upload-section">
          <div className="document-file-input-wrapper">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(doc.requiredDocumentId, e.target.files[0])}
              className="document-file-input"
            />
          </div>
          <button
            onClick={() =>
              handleUpload(doc.requiredDocumentId, doc.documentName, doc.documentType)
            }
            disabled={
              !selectedFiles[doc.requiredDocumentId] || sendingDocId === doc.requiredDocumentId
            }
            className={`document-upload-button ${
              sendingDocId === doc.requiredDocumentId ? "loading" : ""
            }`}
          >
            {sendingDocId === doc.requiredDocumentId ? "Enviando..." : "📤 Enviar documento"}
          </button>
        </div>
      )}
    </li>
  );
}