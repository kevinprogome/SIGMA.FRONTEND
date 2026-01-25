// src/pages/student/StudentModalityDocuments.jsx
import { useEffect, useState } from "react";
import {
  getModalityById,
  uploadStudentDocument,
} from "../../services/studentService";

export default function StudentModalityDocuments({
  studentModalityId,
  modalityId,
}) {
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [sendingDocId, setSendingDocId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await getModalityById(modalityId);
        setDocuments(res.documents || []);
      } catch (err) {
        console.error(err);
        setMessage("Error al cargar documentos requeridos");
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
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Error al enviar el documento"
      );
    } finally {
      setSendingDocId(null);
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Documentos requeridos</h3>

      {message && <p>{message}</p>}

      {documents.length === 0 ? (
        <p>No hay documentos requeridos</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} style={{ marginBottom: "20px" }}>
              <strong>{doc.documentName}</strong>
              <p>{doc.description}</p>
              <p>
                <strong>Formato:</strong> {doc.allowedFormat} <br />
                <strong>Tamaño máx:</strong> {doc.maxFileSizeMB} MB
              </p>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  handleFileChange(doc.id, e.target.files[0])
                }
              />

              <button
                onClick={() => handleUpload(doc.id)}
                disabled={
                  !selectedFiles[doc.id] ||
                  sendingDocId === doc.id
                }
                style={{ marginLeft: "10px" }}
              >
                {sendingDocId === doc.id
                  ? "Enviando..."
                  : "Enviar documento"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
