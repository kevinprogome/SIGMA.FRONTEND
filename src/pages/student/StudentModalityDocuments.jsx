import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getModalityById,
  uploadStudentDocument,
} from "../../services/studentService";
import "../../styles/student/studentmodalitydocuments.css";

export default function StudentModalityDocuments({
  studentModalityId,
  modalityId,
}) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState(new Set());
  const [sendingDocId, setSendingDocId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [modalityId]);

  const fetchDocuments = async () => {
    try {
      const res = await getModalityById(modalityId);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Error al cargar documentos requeridos");
      setMessageType("error");
    }
  };

  const handleFileChange = (documentId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [documentId]: file,
    }));
  };

  const handleUpload = async (documentId) => {
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
     
      // Marcar documento como subido
      setUploadedDocuments((prev) => new Set([...prev, documentId]));
     
      // Limpiar el archivo seleccionado
      setSelectedFiles((prev) => ({
        ...prev,
        [documentId]: null,
      }));

      // Verificar si todos los documentos han sido subidos
      const allUploaded = documents.every((doc) => 
        uploadedDocuments.has(doc.id) || doc.id === documentId
      );

      if (allUploaded && documents.length > 0) {
        // Mostrar mensaje de éxito completo
        setMessage("¡Excelente! Has subido todos los documentos requeridos. Ahora puedes ver el estado de tu modalidad.");
        setMessageType("success-complete");

        // Redireccionar después de 3 segundos
        setTimeout(() => {
          navigate("/student/status");
        }, 8000);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Error al enviar el documento");
      setMessageType("error");
    } finally {
      setSendingDocId(null);
    }
  };

  // Calcular progreso
  const totalDocuments = documents.length;
  const uploadedCount = uploadedDocuments.size;
  const progressPercentage = totalDocuments > 0 
    ? Math.round((uploadedCount / totalDocuments) * 100) 
    : 0;

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h3 className="documents-title">Documentos Requeridos</h3>
        
        {/* Barra de progreso */}
        {totalDocuments > 0 && (
          <div className="documents-progress">
            <div className="documents-progress-info">
              <span className="documents-progress-text">
                {uploadedCount} de {totalDocuments} documentos subidos
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
                Serás redirigido automáticamente en 8 segundos...
              </div>
            )}
          </div>
        )}

        {documents.length === 0 ? (
          <div className="documents-empty">
            <div className="documents-empty-icon">📄</div>
            <p className="documents-empty-text">No hay documentos requeridos</p>
          </div>
        ) : (
          <ul className="documents-list">
            {documents.map((doc) => {
              const isUploaded = uploadedDocuments.has(doc.id);
              
              return (
                <li key={doc.id} className={`document-card ${isUploaded ? 'uploaded' : ''}`}>
                  <div className="document-card-header">
                    <h4 className="document-name">{doc.documentName}</h4>
                    {isUploaded && (
                      <span className="document-uploaded-badge">✓ Subido</span>
                    )}
                  </div>

                  {doc.description && (
                    <p className="document-description">{doc.description}</p>
                  )}

                  <div className="document-requirements">
                    <div className="document-requirement">
                      <span className="document-requirement-label">Formato:</span>
                      <span className="document-requirement-value">
                        {doc.allowedFormat}
                      </span>
                    </div>
                    <div className="document-requirement">
                      <span className="document-requirement-label">Tamaño máx:</span>
                      <span className="document-requirement-value">
                        {doc.maxFileSizeMB} MB
                      </span>
                    </div>
                  </div>

                  <div className="document-upload-section">
                    <div className="document-file-input-wrapper">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          handleFileChange(doc.id, e.target.files[0])
                        }
                        className="document-file-input"
                        disabled={isUploaded}
                      />
                    </div>
                    <button
                      onClick={() => handleUpload(doc.id)}
                      disabled={
                        !selectedFiles[doc.id] || sendingDocId === doc.id || isUploaded
                      }
                      className={`document-upload-button ${
                        sendingDocId === doc.id ? "loading" : ""
                      } ${isUploaded ? "uploaded" : ""}`}
                    >
                      {sendingDocId === doc.id
                        ? "Enviando..."
                        : isUploaded
                        ? "✓ Documento subido"
                        : "Enviar documento"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}