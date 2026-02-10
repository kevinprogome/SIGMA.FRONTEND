import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getModalityById,
  uploadStudentDocument,
  getMyDocuments,
  getStudentDocumentBlob,
} from "../../services/studentService";
import "../../styles/student/studentmodalitydocuments.css";

export default function StudentModalityDocuments({
  studentModalityId,
  modalityId,
}) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [uploadedDocumentsMap, setUploadedDocumentsMap] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [sendingDocId, setSendingDocId] = useState(null);
  const [viewingDocId, setViewingDocId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchDocumentsData();
  }, [modalityId, studentModalityId]);

  const fetchDocumentsData = async () => {
    try {
      // 1. Obtener documentos requeridos de la modalidad
      const modalityRes = await getModalityById(modalityId);
      const requiredDocs = modalityRes.documents || [];

      // 2. Obtener documentos ya subidos por el estudiante
      const uploadedDocs = await getMyDocuments();
      
      console.log("📄 Documentos requeridos:", requiredDocs);
      console.log("✅ Documentos ya subidos:", uploadedDocs);

      // 3. Crear un mapa de documentos subidos por nombre
      const uploadedMap = {};
      uploadedDocs.forEach((uploaded) => {
        uploadedMap[uploaded.documentName] = {
          studentDocumentId: uploaded.studentDocumentId,
          uploadedAt: uploaded.uploadedAt,
          status: uploaded.status,
          notes: uploaded.notes,
          filePath: uploaded.filePath,
          mandatory: uploaded.mandatory,
        };
      });

      setDocuments(requiredDocs);
      setUploadedDocumentsMap(uploadedMap);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Error al cargar documentos");
      setMessageType("error");
    }
  };

  const handleFileChange = (documentId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [documentId]: file,
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

  const handleUpload = async (documentId, documentName) => {
    const file = selectedFiles[documentId];
    if (!file) return;

    try {
      setSendingDocId(documentId);
      setMessage("");

      const res = await uploadStudentDocument(
        studentModalityId,
        documentId,
        file
      );

      setMessage(res.message || "Documento enviado correctamente");
      setMessageType("success");

      // Limpiar el archivo seleccionado
      setSelectedFiles((prev) => ({
        ...prev,
        [documentId]: null,
      }));

      // Recargar documentos para actualizar el estado
      await fetchDocumentsData();

      // Verificar si todos los documentos obligatorios han sido subidos
      const mandatoryDocs = documents.filter((doc) => doc.mandatory);
      const allMandatoryUploaded = mandatoryDocs.every(
        (doc) => uploadedDocumentsMap[doc.documentName] || doc.documentName === documentName
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
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Error al enviar el documento");
      setMessageType("error");
    } finally {
      setSendingDocId(null);
    }
  };

  // ✅ NUEVA FUNCIÓN PARA RESUBIR DOCUMENTO
  const handleReupload = async (studentDocumentId, requiredDocumentId, documentName) => {
    const file = selectedFiles[requiredDocumentId];
    if (!file) return;

    try {
      setSendingDocId(studentDocumentId);
      setMessage("");

      const res = await uploadStudentDocument(
        studentModalityId,
        requiredDocumentId,
        file
      );

      setMessage(`✅ ${documentName} actualizado correctamente`);
      setMessageType("success");

      // Limpiar el archivo seleccionado
      setSelectedFiles((prev) => ({
        ...prev,
        [requiredDocumentId]: null,
      }));

      // Recargar documentos
      await fetchDocumentsData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Error al actualizar el documento");
      setMessageType("error");
    } finally {
      setSendingDocId(null);
    }
  };

  // Calcular progreso (solo documentos obligatorios)
  const mandatoryDocuments = documents.filter((doc) => doc.mandatory);
  const uploadedMandatoryCount = mandatoryDocuments.filter(
    (doc) => uploadedDocumentsMap[doc.documentName]
  ).length;
  const progressPercentage =
    mandatoryDocuments.length > 0
      ? Math.round((uploadedMandatoryCount / mandatoryDocuments.length) * 100)
      : 0;

  // Helper para obtener etiqueta de estado
  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Pendiente de revisión",
      ACCEPTED_FOR_PROGRAM_HEAD_REVIEW: "Aceptado por Jefe de Programa",
      REJECTED_FOR_PROGRAM_HEAD_REVIEW: "Rechazado por Jefe de Programa",
      CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD: "Correcciones solicitadas",
      ACCEPTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW: "Aceptado por Comité",
      REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW: "Rechazado por Comité",
      CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE:
        "Correcciones solicitadas por Comité",
      CORRECTION_RESUBMITTED: "Corrección reenviada",
    };
    return labels[status] || status;
  };

  // Helper para obtener clase de estado
  const getStatusClass = (status) => {
    if (status?.includes("ACCEPTED")) return "accepted";
    if (status?.includes("REJECTED")) return "rejected";
    if (status?.includes("CORRECTIONS")) return "corrections";
    return "pending";
  };

  // ✅ NUEVA FUNCIÓN: Verificar si un documento puede ser resubido
  const canReuploadDocument = (status) => {
    const reuploadableStatuses = [
      "REJECTED_FOR_PROGRAM_HEAD_REVIEW",
      "REJECTED_FOR_PROGRAM_CURRICULUM_COMMITTEE_REVIEW",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_HEAD",
      "CORRECTIONS_REQUESTED_BY_PROGRAM_CURRICULUM_COMMITTEE",
    ];
    return reuploadableStatuses.includes(status);
  };

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h3 className="documents-title">Documentos Requeridos</h3>

        {/* Barra de progreso (solo documentos obligatorios) */}
        {mandatoryDocuments.length > 0 && (
          <div className="documents-progress">
            <div className="documents-progress-info">
              <span className="documents-progress-text">
                {uploadedMandatoryCount} de {mandatoryDocuments.length}{" "}
                documentos obligatorios subidos
              </span>
              <span className="documents-progress-percentage">
                {progressPercentage}%
              </span>
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

        {documents.length === 0 ? (
          <div className="documents-empty">
            <div className="documents-empty-icon">📄</div>
            <p className="documents-empty-text">
              No hay documentos requeridos para esta modalidad
            </p>
          </div>
        ) : (
          <ul className="documents-list">
            {documents.map((doc) => {
              const uploadedInfo = uploadedDocumentsMap[doc.documentName];
              const isUploaded = !!uploadedInfo;

              return (
                <li
                  key={doc.id}
                  className={`document-card ${isUploaded ? "uploaded" : ""}`}
                >
                  <div className="document-card-header">
                    <div>
                      <h4 className="document-name">{doc.documentName}</h4>
                      {doc.mandatory && (
                        <span className="document-mandatory-badge">
                          Obligatorio
                        </span>
                      )}
                    </div>
                    {isUploaded && (
                      <span className="document-uploaded-badge">
                        ✓ Subido
                      </span>
                    )}
                  </div>

                  {doc.description && (
                    <p className="document-description">{doc.description}</p>
                  )}

                  <div className="document-requirements">
                    <div className="document-requirement">
                      <span className="document-requirement-label">
                        Formato:
                      </span>
                      <span className="document-requirement-value">
                        {doc.allowedFormat}
                      </span>
                    </div>
                    <div className="document-requirement">
                      <span className="document-requirement-label">
                        Tamaño máx:
                      </span>
                      <span className="document-requirement-value">
                        {doc.maxFileSizeMB} MB
                      </span>
                    </div>
                  </div>

                  {/* ✅ MOSTRAR INFO DEL DOCUMENTO SUBIDO */}
                  {isUploaded && (
                    <div className="document-uploaded-info">
                      <div className="uploaded-info-row">
                        <span className="uploaded-info-label">
                          📅 Fecha de carga:
                        </span>
                        <span className="uploaded-info-value">
                          {new Date(uploadedInfo.uploadedAt).toLocaleString(
                            "es-CO",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </span>
                      </div>
                      <div className="uploaded-info-row">
                        <span className="uploaded-info-label">
                          📊 Estado:
                        </span>
                        <span
                          className={`uploaded-status-badge ${getStatusClass(
                            uploadedInfo.status
                          )}`}
                        >
                          {getStatusLabel(uploadedInfo.status)}
                        </span>
                      </div>
                      {uploadedInfo.notes && (
                        <div className="uploaded-info-row">
                          <span className="uploaded-info-label">
                            💬 Notas:
                          </span>
                          <span className="uploaded-info-value notes">
                            {uploadedInfo.notes}
                          </span>
                        </div>
                      )}

                      {/* Botón para ver documento */}
                      <button
                        onClick={() =>
                          handleViewDocument(
                            uploadedInfo.studentDocumentId,
                            doc.documentName
                          )
                        }
                        disabled={
                          viewingDocId === uploadedInfo.studentDocumentId
                        }
                        className="document-view-button"
                      >
                        {viewingDocId === uploadedInfo.studentDocumentId
                          ? "Cargando..."
                          : "👁️ Ver documento subido"}
                      </button>

                      {/* ✅ PERMITIR RESUBIDA SI ESTÁ RECHAZADO O EN CORRECCIONES */}
                      {canReuploadDocument(uploadedInfo.status) ? (
                        <div className="document-reupload-section">
                          <div className="document-reupload-message">
                            ⚠️ Este documento necesita correcciones. Puedes
                            subir una nueva versión.
                          </div>
                          <div className="document-file-input-wrapper">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                handleFileChange(doc.id, e.target.files[0])
                              }
                              className="document-file-input"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleReupload(
                                uploadedInfo.studentDocumentId,
                                doc.id,
                                doc.documentName
                              )
                            }
                            disabled={
                              !selectedFiles[doc.id] ||
                              sendingDocId === uploadedInfo.studentDocumentId
                            }
                            className={`document-upload-button ${
                              sendingDocId === uploadedInfo.studentDocumentId
                                ? "loading"
                                : ""
                            }`}
                          >
                            {sendingDocId === uploadedInfo.studentDocumentId
                              ? "Actualizando..."
                              : "🔄 Actualizar documento"}
                          </button>
                        </div>
                      ) : (
                        /* 🔒 MENSAJE DE BLOQUEO SOLO SI NO PUEDE RESUBIR */
                        <div className="document-locked-message">
                          🔒 Ya subiste este documento. Si necesitas
                          modificarlo, contacta al Jefe de Programa.
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ SOLO MOSTRAR INPUT SI NO ESTÁ SUBIDO */}
                  {!isUploaded && (
                    <div className="document-upload-section">
                      <div className="document-file-input-wrapper">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            handleFileChange(doc.id, e.target.files[0])
                          }
                          className="document-file-input"
                        />
                      </div>
                      <button
                        onClick={() => handleUpload(doc.id, doc.documentName)}
                        disabled={
                          !selectedFiles[doc.id] || sendingDocId === doc.id
                        }
                        className={`document-upload-button ${
                          sendingDocId === doc.id ? "loading" : ""
                        }`}
                      >
                        {sendingDocId === doc.id
                          ? "Enviando..."
                          : "📤 Enviar documento"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}