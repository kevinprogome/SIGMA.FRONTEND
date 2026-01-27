import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentModalityProfile,
  reviewDocument,
  approveSecretary,
  getDocumentBlobUrl,
} from "../../services/secretaryService";

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
      alert(
        err.response?.data?.message || "Error al cargar el documento"
      );
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

      // Recargar el perfil
      const res = await getStudentModalityProfile(studentModalityId);
      setProfile(res);

      // Resetear formulario
      setReviewingDocId(null);
      setSelectedStatus("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Error al revisar el documento"
      );
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
        err.response?.data?.message ||
          "Error al enviar al Consejo de Facultad"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando perfil del estudiante...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>No hay información disponible</p>;

  const uploadedDocs = profile.documents.filter((d) => d.uploaded);
  const allAccepted = uploadedDocs.every(
    (d) => d.status === "ACCEPTED_FOR_SECRETARY_REVIEW"
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Perfil del estudiante</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Nombre:</strong> {profile.studentName}
        </p>
        <p>
          <strong>Email:</strong> {profile.studentEmail}
        </p>
        <p>
          <strong>Modalidad:</strong> {profile.modalityName}
        </p>
        <p>
          <strong>Estado actual:</strong> {profile.currentStatusDescription}
        </p>
      </div>

      <h3>Documentos cargados</h3>

      {uploadedDocs.length === 0 ? (
        <p>El estudiante aún no ha cargado documentos</p>
      ) : (
        <>
          <table border="1" cellPadding="10" style={{ width: "100%" }}>
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
                  <td>{doc.documentName}</td>
                  <td>
                    <span
                      style={{
                        color:
                          doc.status === "ACCEPTED_FOR_SECRETARY_REVIEW"
                            ? "green"
                            : doc.status === "REJECTED_FOR_SECRETARY_REVIEW"
                            ? "red"
                            : doc.status ===
                              "CORRECTIONS_REQUESTED_BY_SECRETARY"
                            ? "orange"
                            : "black",
                        fontWeight: "bold",
                      }}
                    >
                      {doc.statusDescription}
                    </span>
                  </td>
                  <td>{doc.notes || "-"}</td>
                  <td>
                    {doc.lastUpdate
                      ? new Date(doc.lastUpdate).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDocument(doc.studentDocumentId)}
                      disabled={loadingDoc === doc.studentDocumentId}
                      style={{ marginRight: "10px" }}
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
                    >
                      {reviewingDocId === doc.studentDocumentId
                        ? "Cancelar"
                        : "Cambiar estado"}
                    </button>

                    {reviewingDocId === doc.studentDocumentId && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px",
                          border: "1px solid #ccc",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <div style={{ marginBottom: "10px" }}>
                          <label>
                            <strong>Nuevo estado:</strong>
                          </label>
                          <select
                            value={selectedStatus}
                            onChange={(e) =>
                              setSelectedStatus(e.target.value)
                            }
                            style={{
                              marginLeft: "10px",
                              padding: "5px",
                            }}
                          >
                            <option value="">
                              -- Seleccionar estado --
                            </option>
                            <option value="ACCEPTED_FOR_SECRETARY_REVIEW">
                              ACCEPTED_FOR_SECRETARY_REVIEW
                            </option>
                            <option value="REJECTED_FOR_SECRETARY_REVIEW">
                              REJECTED_FOR_SECRETARY_REVIEW
                            </option>
                            <option value="CORRECTIONS_REQUESTED_BY_SECRETARY">
                              CORRECTIONS_REQUESTED_BY_SECRETARY
                            </option>
                          </select>
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                          <label>
                            <strong>Comentario:</strong>
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            style={{
                              width: "100%",
                              marginTop: "5px",
                              padding: "5px",
                            }}
                            placeholder="Escribe aquí el motivo de tu decisión..."
                          />
                        </div>

                        <button
                          onClick={() =>
                            handleReviewDocument(doc.studentDocumentId)
                          }
                          disabled={submitting}
                          style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "8px 15px",
                            cursor: submitting
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          {submitting
                            ? "Guardando..."
                            : "Guardar revisión"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "30px" }}>
            <button
              onClick={handleApproveAll}
              disabled={!allAccepted || submitting}
              style={{
                backgroundColor: allAccepted ? "#2196F3" : "#ccc",
                color: "white",
                padding: "12px 25px",
                fontSize: "16px",
                cursor:
                  allAccepted && !submitting ? "pointer" : "not-allowed",
              }}
            >
              {submitting
                ? "Procesando..."
                : "Enviar al Consejo de Facultad"}
            </button>
            {!allAccepted && (
              <p style={{ color: "orange", marginTop: "10px" }}>
                Debes aceptar todos los documentos cargados antes de
                enviar al Consejo de Facultad
              </p>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: "30px" }}>
        <button onClick={() => navigate("/secretary")}>
          Volver al listado
        </button>
      </div>
    </div>
  );
}