import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentModalityProfile,
  reviewDocument,
  approveSecretary,
  getDocumentBlobUrl,
} from "../../services/secretaryService";
import "../../styles/secretary/secretaryprofile.css";

export default function StudentProfileSecretary() {
  const { studentModalityId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingDocId, setReviewingDocId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getStudentModalityProfile(studentModalityId);
        console.log("RESPUESTA BACKEND:", res);
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

    if (studentModalityId) {
      fetchProfile();
    }
  }, [studentModalityId]);

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
      alert(err.response?.data?.message || "Error al cargar el documento");
    } finally {
      setLoadingDoc(null);
    }
  };

  const handleReviewDocument = async (studentDocumentId) => {
    if (!selectedStatus) {
      alert("Por favor selecciona un estado");
      return;
    }

    if (!notes.trim()) {
      alert("Por favor agrega un comentario");
      return;
    }

    setSubmitting(true);
    try {
      await reviewDocument(studentDocumentId, {
        status: selectedStatus,
        notes: notes.trim(),
      });

      alert("Documento revisado exitosamente");

      const res = await getStudentModalityProfile(studentModalityId);
      setProfile(res);

      setReviewingDocId(null);
      setSelectedStatus("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al revisar el documento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAll = async () => {
    const uploadedDocs = profile.documents.filter((d) => d.uploaded);
    const allAccepted = uploadedDocs.every(
      (d) => d.status === "ACCEPTED_FOR_SECRETARY_REVIEW"
    );

    if (!allAccepted) {
      alert(
        "Debes aceptar todos los documentos cargados antes de enviar al Consejo de Facultad"
      );
      return;
    }

    if (
      !window.confirm(
        "¿Estás segura de enviar este estudiante al Consejo de Facultad?"
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await approveSecretary(studentModalityId);
      alert("Estudiante enviado al Consejo de Facultad exitosamente");
      navigate("/secretary");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Error al enviar al Consejo de Facultad"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper para obtener clase de badge
  const getStatusBadgeClass = (status) => {
    if (status === "ACCEPTED_FOR_SECRETARY_REVIEW") return "accepted";
    if (status === "REJECTED_FOR_SECRETARY_REVIEW") return "rejected";
    if (status === "CORRECTIONS_REQUESTED_BY_SECRETARY") return "corrections";
    return "pending";
  };

  if (loading) {
    return (
      <div className="student-profile-loading">
        Cargando perfil del estudiante...
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-profile-error">
        <p>{error}</p>
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

  const uploadedDocs = profile.documents.filter((d) => d.uploaded);
  const allAccepted = uploadedDocs.every(
    (d) => d.status === "ACCEPTED_FOR_SECRETARY_REVIEW"
  );

  return (
    <div className="student-profile-container">
      {/* Header */}
      <div className="student-profile-header">
        <h2 className="student-profile-title">Perfil del Estudiante</h2>
        <p className="student-profile-subtitle">
          Revisa y aprueba los documentos de la modalidad de grado
        </p>
      </div>

      {/* Student Info Card */}
      <div className="student-info-card">
        <div className="student-info-grid">
          <div className="student-info-item">
            <span className="student-info-label">Nombre</span>
            <span className="student-info-value">{profile.studentName}</span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Email</span>
            <span className="student-info-value email">
              {profile.studentEmail}
            </span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Modalidad</span>
            <span className="student-info-value">{profile.modalityName}</span>
          </div>

          <div className="student-info-item">
            <span className="student-info-label">Estado actual</span>
            <span className="student-info-value status">
              {profile.currentStatusDescription}
            </span>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="documents-section">
        <h3 className="documents-section-title">Documentos Cargados</h3>

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
                    <th>Estado</th>
                    <th>Notas</th>
                    <th>Última actualización</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedDocs.map((doc) => (
                    <tr key={doc.studentDocumentId}>
                      <td>
                        <strong>{doc.documentName}</strong>
                      </td>
                      <td>
                        <span
                          className={`doc-status-badge ${getStatusBadgeClass(
                            doc.status
                          )}`}
                        >
                          {doc.statusDescription}
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
                        </div>

                        {/* Review Panel */}
                        {reviewingDocId === doc.studentDocumentId && (
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
                                <option value="ACCEPTED_FOR_SECRETARY_REVIEW">
                                  Aceptado
                                </option>
                                <option value="REJECTED_FOR_SECRETARY_REVIEW">
                                  Rechazado
                                </option>
                                <option value="CORRECTIONS_REQUESTED_BY_SECRETARY">
                                  Requiere correcciones
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

            {/* Approve All Section */}
            <div className="approve-all-section">
              <div className="approve-all-content">
                <button
                  onClick={handleApproveAll}
                  disabled={!allAccepted || submitting}
                  className={`approve-all-btn ${
                    allAccepted ? "enabled" : "disabled"
                  }`}
                >
                  {submitting
                    ? "Procesando..."
                    : "Enviar al Consejo de Facultad"}
                </button>

                {!allAccepted && (
                  <div className="approve-warning">
                    Debes aceptar todos los documentos cargados antes de
                    enviar al Consejo de Facultad
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Back Button */}
      <div className="back-button-section">
        <button onClick={() => navigate("/secretary")} className="back-btn">
          Volver al listado
        </button>
      </div>
    </div>
  );
}