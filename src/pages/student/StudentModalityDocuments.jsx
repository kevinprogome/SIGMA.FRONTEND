// src/pages/student/StudentModalityDocuments.jsx
import { useEffect, useState } from "react";
import {
  getModalityById,
  uploadStudentDocument,
} from "../../services/studentService";
import "../../styles/student/studentmodalitydocuments.css"; // 👈 Importa el CSS

export default function StudentModalityDocuments({
  studentModalityId,
  modalityId,
}) {
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [sendingDocId, setSendingDocId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success o error

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await getModalityById(modalityId);
        setDocuments(res.documents || []);
      } catch (err) {
        console.error(err);
        setMessage("Error al cargar documentos requeridos");
        setMessageType("error");
      }
    };

    fetchDocuments();
  }, [modalityId]);

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
      
      // Limpiar el archivo seleccionado después de subir
      setSelectedFiles((prev) => ({
        ...prev,
        [documentId]: null,
      }));
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Error al enviar el documento"
      );
      setMessageType("error");
    } finally {
      setSendingDocId(null);
    }
  };

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h3 className="documents-title">Documentos Requeridos</h3>
      </div>

      <div className="documents-body">
        {message && (
          <div className={`documents-message ${messageType}`}>
            {message}
          </div>
        )}

        {documents.length === 0 ? (
          <div className="documents-empty">
            <div className="documents-empty-icon">📄</div>
            <p className="documents-empty-text">No hay documentos requeridos</p>
          </div>
        ) : (
          <ul className="documents-list">
            {documents.map((doc) => (
              <li key={doc.id} className="document-card">
                <h4 className="document-name">{doc.documentName}</h4>
                
                {doc.description && (
                  <p className="document-description">{doc.description}</p>
                )}

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
                    onClick={() => handleUpload(doc.id)}
                    disabled={
                      !selectedFiles[doc.id] ||
                      sendingDocId === doc.id
                    }
                    className={`document-upload-button ${
                      sendingDocId === doc.id ? "loading" : ""
                    }`}
                  >
                    {sendingDocId === doc.id
                      ? "Enviando..."
                      : "Enviar documento"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}